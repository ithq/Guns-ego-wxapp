// pages/billingDetail/billingDetail.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/billingDetail.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
let orderType;  //订单类型 1充值记录   2消费记录
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    billContent: {},
    showRecharge: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    orderType = options.orderType;
    if (options.transactionId) {
      this.getData(options.transactionId)
    }
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 获取数据
  getData: function(transactionId) {
    if(orderType == 1){
      var getUrl = api.recahargeDetail + '?TradeNo=' + transactionId;
      this.setData({
        showRecharge: true
      })
    } else {
      var getUrl = api.consumption + '?id=' + transactionId;
      this.setData({
        showRecharge: false
      })
    }

    request.get(getUrl).then((res) => {
      this.setData({
        billContent: res.data
      })
    })
  },

  //一键复制
  copyTxt: util.throttle(function(e) {
    var self = this;
    var txt = e.currentTarget.dataset.txt;
    wx.setClipboardData({
      data: txt,
      success (res) {
        console.log(res)
        util.showToast(self.data.lg.copySuccessful)
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  }, 1000),

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