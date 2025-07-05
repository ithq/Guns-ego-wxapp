// netDot.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceUrl: app.globalData.resourceUrl,
    phone:"",
    shopAddr: "",
    latitude: "",
    longitude: ""
  },
  //扫码
  scanEWM:function(even){
    var that = this;
    wx.scanCode({
      success: (res) => {
        app.handleEwmUrl(that, res.result);
      }
    })
  
  
  }
  ,
  gotoTheShop:function(e){
    var that = this;
    var shopLatitude = Number(that.data.latitude);
    var shopLongitude = Number(that.data.longitude)
    wx.openLocation({
      latitude: shopLatitude,
      longitude: shopLongitude,
      scale: 18
    })
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //绑定首页按钮
    app.bindHomePageButton(this, "../index/index");
    var imgUrl = options.otherImgUrlList;
    var ortherImgUrl = null;
    if (imgUrl != undefined && imgUrl != null && imgUrl != 'null' && imgUrl.length != 0){
      ortherImgUrl = imgUrl;
    }
      //页面初始化 options为页面跳转所带来的参数
      this.setData({
        phone: options.phone,
        shopAddr: options.shopAddr,
        latitude: options.latitude,
        longitude: options.longitude,
        ortherImgUrl: ortherImgUrl
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
    app.finishOperation(this);
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