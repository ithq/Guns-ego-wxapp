// pages/personCenter/myWallet/myWallet.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据 
   */
  data: {
    dbOperationFlag: true,
    responseInfo: null,
    custNo:'',
    availableBalance:0,
    frozenBalance: 0,
    resourceUrl: app.globalData.resourceUrl,
    totalBalance:0
  },
  // 余额提现
  withdrawal: function () {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============

    try {
      //保存formId
      app.saveFormId(e.detail.formId);

    } catch (e) { }
    var withdrawalType = 1;
    var custNo = this.data.custNo;
    var availableBalance = this.data.availableBalance;
    var url = '/pages/withdrawal/withdrawal?withdrawalType=' + withdrawalType + '&custNo=' +custNo+ "&availableBalance=" + availableBalance;
    wx.navigateTo({
      url: url
    })
  },
  // 流水记录
  flowRecord: function () {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============

    try {
      //保存formId
      app.saveFormId(e.detail.formId);
    } catch (e) { }
    wx.navigateTo({
      url: '/pages/flowRecord/flowRecord?custNo=' + that.data.custNo
    })
  },
  // 获取我的钱包信息
  getMyWalletInfo: function () {
    var that = this;
    var keycode = common.getKeyCode([], app.globalData.code);
    var para = {
      session3rd: app.globalData.session_3rd,
      keycode: keycode
    }
    util.shareRequest("wxapp", "geMyWallet", para, function (success) {
      //成功回调
      if (success.data.result == 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo;
      //信息加到缓存
      wx.setStorageSync('responseInfo', responseInfo);
      var custNo="";
      var availableBalance=0;
      var frozenBalance=0;
      var totalBalance=0;
      if (responseInfo != null && responseInfo != undefined && responseInfo != ""){
        custNo = responseInfo.custNo;
        availableBalance =parseInt(responseInfo.availableBalance);
        frozenBalance = parseInt(responseInfo.frozenBalance);
        totalBalance=availableBalance+frozenBalance;
      }
      //
      that.setData({
        responseInfo: responseInfo,
        custNo: custNo,
        availableBalance: availableBalance,
        frozenBalance: frozenBalance,
        totalBalance: totalBalance
      });
    }, function (fail) {
      app.finishOperation(that);
    }, function (complete) {
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.bindHomePageButton(that, "../../index/index");
    that.setData({
      custNo: options.custNo
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
    var that = this;
    app.finishOperation(that);
    //我的钱包
    that.getMyWalletInfo();
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