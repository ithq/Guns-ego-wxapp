// pages/myWlt/myWlt.js
//钱包页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentBalance: 0, //当前可提现余额
    frozenBalance: 0, //已冻结余额
    responseInfo: null,
    custNo: '',
    doubleOperateFlag: true //重复点击控制
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
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
    app.endOperate(this);
    //我的钱包
    this.walletInfo();
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
  // 获取我的钱包信息
  walletInfo: function () {
    var that = this;
    var keycode = cmmn.getKeyCode([], app.glbParam.code);
    var para = {
      session3rd: app.glbParam.ssn_3rd,
      keycode: keycode
    }
    utls.wxRequset("wxapp", "geMyWallet", para, function (success) {
      if (success.data.result == 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo;
      //结果保存到缓存
      wx.setStorageSync('responseInfo', responseInfo);
      var frozenBalance = 0;
      var custNo = "";
      var currentBalance = 0;
      if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
        frozenBalance = parseInt(responseInfo.frozenBalance);
        custNo = responseInfo.custNo;
        currentBalance = parseInt(responseInfo.availableBalance);
      }
      that.setData({
        responseInfo: responseInfo,
        custNo: custNo,
        currentBalance: currentBalance,
        frozenBalance: frozenBalance
      });
    }, function (fail) {
      app.endOperate(that);
    }, function (complete) {
    })
  },
  // 跳转提现页
  takeMoney: function () {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var custNo = that.data.custNo;
    var currentBalance = that.data.currentBalance;
    var takeMoneyType = 1;
    var url = '/pages/wthDrwl/wthDrwl?withdrawalType=' + takeMoneyType + '&custNo=' + custNo + "&availableBalance=" + currentBalance;
    wx.navigateTo({
      url: url
    })
  },
  // 跳转提现记录页面
  takeMoneyRecord: function () {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.navigateTo({
      url: '/pages/flwRcd/flwRcd?custNo=' + that.data.custNo
    })
  }

})