// pages/feedbackDetails/feedbackDetails.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/feedBack.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api

let timeEquation = 5 * 60 * 1000

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: util.getLanguage(language),
    common: util.getLanguage(common),
    imgUrl: app.globalData.imgUrl,
    replyId: '', // 问题id
    listData: [],
    textContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: this.data.lg.feedbackDetails
    });

    if (options.id) {
      this.setData({
        replyId: options.id
      }, () => {
        this.getData(options.id);
      })
    }
  },

  // 今天日期
  timeConversion: function() { 
    let date = new Date()
    const todayDate = util.formatTime(date);
    return todayDate.replace(/\//g, "-").split(" ")[0]
  },
  
  // 日期时分 / 时分
  getTime: function(date, flag) {
    if (flag) { // 时分
      let s = date.split(" ")[1];
      return s.substr( 0 , s.lastIndexOf(":")); 
    } else { // 日期时分
      return date.substr( 0 , date.lastIndexOf(":")); 
    }
  },

  // 时差
  jetLag: function(startTime, endTime) {
    if (endTime - startTime > timeEquation ) { // 小于5分钟
      return true
    } else {
      return false
    }
  },

  // 获取数据
  getData: function(id) {
    const self = this;
    const today = self.timeConversion();

    request.post(api.feedbackReply + "?feedbackId=" + id).then((res) => {
      res.data.map((item) => {
        item.timeShow = false // 显示时间
        item.timestamp = new Date(item.addTime).getTime();
      });
     
      res.data.map((item, index, arr) => {
        if (item.addTime.split(" ")[0] == today) {
          if (arr.length == 1) {
            item.timeShow = true
            item.addTime = self.getTime(item.addTime, 1)
          } else if (index < arr.length -1) {
            item.timeShow = self.jetLag(item.timestamp, arr[index+1].timestamp);
            item.addTime = self.getTime(item.addTime, 1)
          } else {
            item.timeShow = self.jetLag(arr[index-1].timestamp ,item.timestamp);
            item.addTime = self.getTime(item.addTime, 1)
          }
        } else {
          if (arr.length == 1) {
            item.timeShow = true
            item.addTime = self.getTime(item.addTime, 1)
          } else if (index < arr.length -1) {
            item.timeShow = self.jetLag(item.timestamp, arr[index+1].timestamp);
            item.addTime = self.getTime(item.addTime)
          } else {
            item.timeShow = self.jetLag(arr[index-1].timestamp ,item.timestamp);
            item.addTime = self.getTime(item.addTime)
          }
        }
      });

      res.data[0].timeShow = true;
      self.setData({
        listData: res.data
      })
    }).then(res => {
      // 滚动位置
      self.pageScroll();
    }).catch(err => {
      console.log(err)
    })
  },

  // 点赞
  bindLike: function(e) {
    const self = this;
    const { replyId , listData} = this.data;
    const {like, index} = e.currentTarget.dataset;
    request.post(api.isLike + "?replyId=" + replyId + "&isLike=" + like).then((res) => {
      listData[index].isLike = like; 
      self.setData({
          listData: listData
      });
    }).catch(err => {
      console.log(err)
    })
  },

  // 发送
  sendReply: function(content, msgType) {
    const self = this;
    const { replyId, listData } = self.data;
    return request.post(api.reply, {
      feedbackId: replyId,
      content: content,
      msgType: msgType // 1 文字 2 图片 3 视频
    }).then(() => {
      let newData = self.createData(content, msgType)
      self.setData({
        textContent: '',
        listData: listData.concat(newData)
      });
    }).then(() => {
      // 滚动位置
      self.pageScroll();
    }).catch(err => {
      console.log(err)
    })
  },

  // 页面滚动
  pageScroll: function () {
    const query = wx.createSelectorQuery();
    query.select('#feedbackDetails').boundingClientRect();
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].height, 
        duration: 300
      })
    });
  },

  // 造数据
  createData: function(content, msgType) {
    const {listData} = this.data;
    let timeShow = this.jetLag(listData[listData.length -1].timestamp, new Date().getTime());

    let addDate = util.formatTime(new Date());
    let addTime = this.getTime(addDate, 1);
    return [{
      content: content,
      msgType: msgType,
      timeShow: timeShow,
      addTime: addTime,
      replyType: 1
    }]
  },

  // 发送文字
  getInputKey(e) {
    let key = e.currentTarget.dataset.name;
    let value = e.detail.value;
    this.setData({
      [key]: value
    })
  },

  sendText: function() {
    const self = this;
    const { textContent } = self.data;
    const textSpaces = util.removeSpaces(textContent);

    if(!textSpaces) {
      util.showToast('请输入内容');
      return false;
    }
    this.sendReply(textSpaces , 1);
  },

  bindconfirm: function(e) {
    let txt =  e.detail.value;
    const txtSpaces = util.removeSpaces(txt);
    if(!txtSpaces) { 
      return false;
    }

    this.sendReply(txtSpaces , 1);
  },

  // 发送图片
  // 选择上传图片 
  addImage: function (e) {
    var self = this;
    wx.chooseImage({
      count: 9, 
      sizeType: ['original', 'compressed'], 
      sourceType: ['album', 'camera'], 
      success: res => {
        wx.showLoading({
          title: '发送中',
          mask: true
        })
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          if (res.tempFiles[i].size / 1024 > 100) { 
            self.compressImage(0, 0, [res.tempFilePaths[i]], 0, 20);
          } else {
            self.compressImage(0, 0, [res.tempFilePaths[i]], 0, 40);
          }
        }
      }
    })
  },

  // 压缩图片
  compressImage: function (index,failNum, tempFilePaths, count = 0,quality = 40){
    let self = this;
    if (index < tempFilePaths.length){
      wx.compressImage({
        src: tempFilePaths[index], // 图片路径
        quality: quality, // 压缩质量
        success: result => {
          index = index + 1; 
          self.uploadOneByOne(result.tempFilePath).then(() => {
            self.compressImage(index,failNum,tempFilePaths,count = 0,quality = 40);
          });
        }, 
        fail: function (e) {
          failNum += 1;//失败数量，可以用来提示用户
          self.compressImage(index,failNum,tempFilePaths,count = 0,quality = 40);
        },
        complete: e => {
          count += 1; 
          if (count == tempFilePaths.length) {
            wx.hideLoading();
            return false;
          } 
        }
      });
    }
  },

  // 上传图片
  uploadOneByOne(imgPaths) {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: api.upLoad,
        filePath: imgPaths,
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
          var imgData = JSON.parse(res.data);
          self.sendReply(imgData.data.url , 2).then((res) => {
            resolve(res);
          })
        },
        fail: err => {
          console.log(err)
          resolve(err);
        }
      })
    })
  },

  //判断是否是图片
  isImg: function (value){
    if(/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(value)) {
      return true;
    }
  },

  //图片预览
  previewImage: function (e) {
    var self = this;
    const {listData} = this.data;
    const {index} = e.currentTarget.dataset;
    let imgListData = listData.filter(item => {
      return self.isImg(item.content) == true
    })

    let imgList = [], imgindex = 0;
    imgListData.map((item, i) => {
      imgList.push(item.content);
      if (listData[index].content == item.content ) {
        imgindex = i
      }
    })
    console.log("当前显示："+imgindex);
    wx.previewImage({
      current: imgList[imgindex],
      urls: imgList
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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