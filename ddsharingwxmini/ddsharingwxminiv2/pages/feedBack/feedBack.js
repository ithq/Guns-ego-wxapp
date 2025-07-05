// pages/feedBack/feedBack.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/feedBack.js");  //语言包
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
    deviceID: '',  // 设备ID
    directions: '', // 描述
    minWord: 10, // 最少字数
    currentWord: 0, // 当前字数
    maxWord: 201, // 最大字数
    phone: '', // 手机号
    imgList: [], // 图片
    compressPicture: [],
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
    const { deviceID, directions, phone, lg, imgList } = self.data;
    const deviceIdRemoveSpaces = util.removeSpaces(deviceID);
    const phoneRemoveSpaces = util.removeSpaces(phone);

    if(!deviceIdRemoveSpaces) { // 设备
      util.showToast(lg.placeholder);
      return false;
    }

    if(!directions || directions.length < 10) {　// 描述
      util.showToast(lg.textAreaPlaceholder);
      return false;
    }

    if(!phoneRemoveSpaces) { // 手机号
      util.showToast(lg.contactPlaceholder);
      return false;
    }

    if (imgList.length > 0) { // 有上传图片
      wx.showLoading({
        title: '提交中',
        mask: true
      })
      self.uploadImage();
    } else { // 没有上传图片
      wx.showLoading({
        title: '提交中',
        mask: true
      })
      self.faultSubmit();
    }
  },

  faultSubmit: function(pics=[]) {
    var self = this;
    const { deviceID, directions, phone, lock } = self.data;
    const deviceIdRemoveSpaces = util.removeSpaces(deviceID);
    const phoneRemoveSpaces = util.removeSpaces(phone);

    if (lock) return;
    self.setData({
      lock:true
    });

    request.post(api.faultSubmit,{
      qrCode: deviceIdRemoveSpaces,
      problem: directions,
      mobile: phoneRemoveSpaces,
      pics: pics,
      type: 1 // 1机柜故障，2其他问题与建议
    }).then((res) => {
      wx.hideLoading();
      // 弹框
      self.toast.showToast({
        type: 'success',
        txt: self.data.lg.submitSuccess,
        duration: 4000,
        compelete: () => {
          uploadImageList = [];
          self.setData({
            deviceID: '',
            directions: '',
            currentWord: 0,
            phone: '',
            imgList: [],
            canSubmit: false, // 可提交，提交按钮颜色
            lock: false
          })
          wx.navigateTo({
            url: '/pages/historicalFeedback/historicalFeedback'
          })
        }
      })  
    }).catch(() => {
      wx.hideLoading();
      self.toast.showToast({
        type: 'fail',
        txt: self.data.lg.submitFail,
        duration: 2000,
        compelete: () => {
          self.setData({
            lock: false
          });
        }
      }) 
    });
  },

  modalConfirm: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 获取输入框的值
  getInputKey(e) {
    let key = e.currentTarget.dataset.name;
    let value = e.detail.value;
    this.setData({
      [key]: value
    })

    wx.nextTick(() => {
      let { deviceID, directions, phone } = this.data;

      if (deviceID  && directions  && phone ) {
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

  // 扫描
  scanCode: function () {
    var self = this;
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        if (res && res.errMsg == "scanCode:ok") {
          var deviceID = res.result;
          deviceID = deviceID.split("/");
          deviceID = deviceID[deviceID.length - 1];

          self.setData({
            deviceID: deviceID
          });
        }
      },
      fail: (err) => {
        console.log("err:" + JSON.stringify(err));
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
        imgList = imgList.concat(tempFilePaths);
        self.setData({
          imgList: imgList
        }, () => {
          for (let i = 0; i < res.tempFilePaths.length; i++) {
            if (res.tempFiles[i].size / 1024 > 100) { 
              self.compressImage(0, 0, [res.tempFilePaths[i]], 20);
            } else {
              self.compressImage(0, 0, [res.tempFilePaths[i]], 40);
            }
          }
        });
      }
    })
  },

  // 压缩图片
  compressImage: function (index,failNum, tempFilePaths, quality = 40){
    var self = this;
    if (index < tempFilePaths.length){
      wx.compressImage({
        src: tempFilePaths[index], // 图片路径
        quality: quality, // 压缩质量
        success: result => {
          index = index + 1; 
          self.setData({
            compressPicture: self.data.compressPicture.concat(result.tempFilePath)
          }, () => {
            self.compressImage(index,failNum,tempFilePaths, quality = 40);
          })          
        }, 
        fail: function (e) {
          failNum += 1;//失败数量，可以用来提示用户
          self.compressImage(index,failNum,tempFilePaths, quality = 40);
        }
      });
    }
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
    var compressPicture = self.data.compressPicture;
    
    imgList.splice(index, 1);
    compressPicture.splice(index, 1);
    self.setData({
      imgList: imgList,
      compressPicture: compressPicture
    });
  },

  uploadImage: function() {
    var self = this;
    var compressPicture = self.data.compressPicture;

    var url = api.upLoad; // 上传的接口
    var successUp = 0; //成功，初始化为0
    var failUp = 0; //失败，初始化为0
    var count = 0; //第几张，初始化为0
    var length = compressPicture.length; //总共上传的数量

    self.uploadOneByOne(url, compressPicture, successUp, failUp, count, length);
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