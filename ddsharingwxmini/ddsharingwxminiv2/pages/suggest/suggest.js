// pages/suggest/suggest.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/suggest.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

var uploadImageList = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    directions: '',
    minWord: 10,
    currentWord: 0,
    maxWord: 201,
    phone: '',
    imgList: [],
    canSubmit: false, // 可提交，提交按钮颜色
    lock: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 返回上一页
  goBack:  function(e) {
    util.goBack();
  }, 

  // 提交 removeTwoSpaces
  feedbackSubmit: function() {
    var self = this;
    
    const {directions, phone, lg, imgList } = self.data;
    const phoneRemoveSpaces = util.removeSpaces(phone);

    if(!directions || directions.length < 10) {　// 描述
      util.showToast(lg.textAreaPlaceholder);
      return false;
    }

    if(!phoneRemoveSpaces) { // 手机号
      util.showToast(lg.contactPlaceholder);
      return false;
    }

    if (imgList.length > 0) { // 有上传图片
      self.uploadImage();
    } else { // 没有上传图片
      self.faultSubmit();
    }
  },

  faultSubmit: function(pics=[]) {
    var self = this;
    const { directions, phone, lock } = self.data;
    const phoneRemoveSpaces = util.removeSpaces(phone);

    if (lock) return;
    self.setData({
      lock:true
    });

    request.post(api.faultSubmit,{
      qrCode: '',
      problem: directions,
      mobile: phoneRemoveSpaces,
      pics: pics,
      type: 2 // 1机柜故障，2其他问题与建议
    }).then((res) => {
      // 弹框
      self.toast.showToast({
        type: 'success',
        txt: self.data.lg.submitSuccess,
        duration: 4000,
        compelete: () => {
          uploadImageList = [];
          self.setData({
            directions: '',
            currentWord: 0,
            phone: '',
            imgList: [],
            canSubmit: false, // 可提交，提交按钮颜色
            lock: false
          })
        }
      })  
    }).catch(() => {
      self.toast.showToast({
        type: 'fail',
        txt: self.data.lg.submitFail,
        duration: 2000,
        compelete: function () {
          self.setData({
            lock: false
          });
        }
      }) 
    });
  },

  // 获取输入框的值
  getInputKey(e) {
    let key = e.currentTarget.dataset.name;
    let value = e.detail.value;
    this.setData({
      [key]: value
    })

    wx.nextTick(() => {
      let { directions, phone } = this.data;

      if (directions  && phone ) {
        this.setData({
          canSubmit: true
        })
      } else {
        this.setData({
          canSubmit: false
        })
      }
    })
  },

  // 字数与计算
  getValueLength: function (e) {
    let value = e.detail.value;
    let len = parseInt(value.length);

    this.setData({
      directions: value,
      currentWord: len //当前字数 
    })
  },

  // 选择上传图片 
  addImage: function (e) {
    var self = this;
    var imgList = self.data.imgList;
    var n = 3;

    if (3 > imgList.length > 0) {
      n = 3 - imgList.length;
    } else if (imgList.length == 3) {
      n = 1;
    }

    wx.chooseImage({
      count: n, 
      sizeType: ['original', 'compressed'], 
      sourceType: ['album', 'camera'], 
      success: res => {
        var tempFilePaths = res.tempFilePaths;
        if (imgList.length == 0) {
          imgList = tempFilePaths
        } else if (imgList.length < 3) {
          imgList = imgList.concat(tempFilePaths);
        } 
        self.setData({
          imgList: imgList
        });
      }
    })
  },

  //图片预览
  previewImage: function (e) {
    var self = this;
    wx.previewImage({
      current: e.currentTarget.dataset.index, 
      urls: self.data.imgList
    })
  },

  // 删除照片 
  deleteImage: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var imgList = self.data.imgList;
    
    imgList.splice(index, 1)
    self.setData({
      imgList: imgList
    });
  },

  uploadImage: function() {
    var self = this;
    var imgList = self.data.imgList;

    var url = api.upLoad; // 上传的接口
    var successUp = 0; //成功，初始化为0
    var failUp = 0; //失败，初始化为0
    var count = 0; //第几张，初始化为0
    var length = imgList.length; //总共上传的数量

    self.uploadOneByOne(url, imgList, successUp, failUp, count, length);
  }, 

  /**
   * 上传图片：递归的方式上传
   * url:上传地址
   * imgPaths：上传的图片列表
   * successUp：上传成功的个数，初始化为0
   * failUp：上传失败的个数，初始化为0
   * count：第几张
   * length：图片列表的长度
   */
  uploadOneByOne(url, imgPaths, successUp, failUp, count, length) {
    var self = this;
    wx.uploadFile({
      url: url, 
      filePath: imgPaths[count],
      name: "file", 
      header:{
        'Content-Type': 'multipart/form-data',
        'token': wx.getStorageSync('token'),
        'lang': 'zh_CN'
      },
      formData: {
        lang: wx.getStorageSync('language'),
        token: wx.getStorageSync('token')
      },
      success: res => {
        successUp++; //成功+1
        var imgData = JSON.parse(res.data);
        uploadImageList.push(imgData.data.path);
      },
      fail: err => {
        failUp++; //失败+1
      },
      complete: e => {
        count++; //下一张
        
        if (count == length) {
          self.faultSubmit(uploadImageList);
          return false;
        } 

        self.uploadOneByOne(url, imgPaths, successUp, failUp, count, length);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.toast = this.selectComponent("#toast");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var lg = util.getLanguage(language);
    var commonLg = util.getLanguage(common);
    this.setData({
      lg: lg,
      commonLg: commonLg
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})