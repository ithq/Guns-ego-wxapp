// pages/fnhRchg/fnhRchg.js
//归还成功提示页面
const util = require('../../utils/util.js')
const app = getApp()
const cmmn = require('../../utils/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yfjAmount:0,
    userHaveUsedTimeForSecondTxt:"",
    userHaveUsedTimeForSecond:0,
    currentUseAmt:0,
    doubleOperateFlag: true,//处理重复提交
    btnOperationHid: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定返回主页小按键
    app.HomeBtnOnBind(this, "../../index/index");
    //取消费数据
    var responseInfo = wx.getStorageSync('responseInfo')
    var yfjAmount = 0;
    var userHaveUsedTimeForSecond = 0;
    var currentUseAmt = 0;
    var yfjBalanceAmount = 0;
    if (responseInfo != undefined && responseInfo != null && responseInfo != "") {
      currentUseAmt = responseInfo.amount;
      yfjAmount = responseInfo.yfj;
      yfjBalanceAmount = responseInfo.balance;
      userHaveUsedTimeForSecond = responseInfo.haveUseTimesForSecond;
    }
    var hours = parseInt(userHaveUsedTimeForSecond / 3600);
    userHaveUsedTimeForSecond = Math.round(userHaveUsedTimeForSecond % 3600);
    var minutes = parseInt(userHaveUsedTimeForSecond / 60);
    userHaveUsedTimeForSecond = Math.round(userHaveUsedTimeForSecond % 60);
    var userHaveUsedTimeForSecondTxt = "";
    if (hours > 0) {
      userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + hours + " 小时";
    }
    if (minutes > 0) {
      userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + minutes + " 分";
    }
    userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + userHaveUsedTimeForSecond + " 秒";
    // 预付款金额大于0，才展示退预付款
    var btnOperationHid = (yfjBalanceAmount <= 0);
    this.setData({
      responseInfo: responseInfo,
      currentUseAmt: currentUseAmt,
      userHaveUsedTimeForSecondTxt: userHaveUsedTimeForSecondTxt,
      yfjAmount: yfjAmount,
      btnOperationHid: btnOperationHid
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
    //清空缓存
    wx.removeStorageSync('responseInfo')
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
   //跳转个人中心
  goToUsrCt: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.redirectTo({
      url: '../usrCt/usrCt'
    })
  }
})