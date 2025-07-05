// pages/withdrawalFailed/withdrawalFailed.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/paymentStatus.js");  //语言包
const common = require("../../language/common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    transactionId: null,
    orderType: null,
    createdTime: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    if (options.transactionId) {
      self.setData({
        transactionId: options.transactionId,
        orderType: options.orderType,
        createdTime: options.createdTime
      })
    }
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.redirectTo({
      url: url + '?transactionId=' + this.data.transactionId
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