// pages/wthDrwPrgs/wthDrwPrgs.js
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    serveiceTelNo: app.glbParam.serveiceTelNo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
    this.setData({
      tradeOutId: options.tradeOutId
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
    this.handlePrgs();
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

  },
  //单笔流水处理进度
  handlePrgs: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var tradeOutId = that.data.tradeOutId;
    var params = [tradeOutId];
    var keycode = cmmn.getKeyCode(params, app.glbParam.code);
    utls.wxRequsetForPost("wxapp", "getWithdrawalProcessInfo", {
      session3rd: app.glbParam.ssn_3rd,
      keycode: keycode,
      tradeOutId: tradeOutId
    }, function (success) {
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo.withdrawProgress;
      that.setData({
        responseInfo: responseInfo
      });
    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  },
  //客服电话
  callService: function () {
    var telNo = this.data.serveiceTelNo;
    wx.makePhoneCall({
      phoneNumber: telNo,
      success: function () {
      },
      fail: function () {
      }
    })
  }
})