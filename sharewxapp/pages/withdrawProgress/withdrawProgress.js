// pages/personCenter/withdrawProgress/withdrawProgress.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceUrl: app.globalData.resourceUrl,
    responseInfo:null,
    serverTelNo: app.globalData.serverTelNo
  },
  //单笔流水处理进度
  handleProgress: function (e) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    var tradeOutId = that.data.tradeOutId;
    var params = [tradeOutId];
    var keycode = common.getKeyCode(params, app.globalData.code);
    util.shareRequestPost("wxapp", "getWithdrawalProcessInfo", {
      session3rd: app.globalData.session_3rd,
      keycode: keycode,
      tradeOutId: tradeOutId
    }, function (success) {
      if (success.data.result === 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo.withdrawProgress;
      that.setData({
        responseInfo: responseInfo
      });
    }, function (error) { }, function (complete) {
      //取消重复点击开始=============
      app.finishOperation(that);
      //取消重复点击结束=============
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.bindHomePageButton(this, "../index/index");
    var that = this;
    that.setData({
      tradeOutId: options.tradeOutId
    })
  },
  //客服电话
  callServiceTelNo: function () {
    var telNo=this.data.serverTelNo;
    wx.makePhoneCall({
      phoneNumber: telNo,
      success: function () {
      },
      fail: function () {
      }
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
    this.handleProgress();
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