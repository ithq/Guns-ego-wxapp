// pages/withdraw/withdraw.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/withdraw.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

let modal = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    lock: false,
    imgUrl: app.globalData.imgUrl,
    withdrawalAmount: '', // 提现金额
    userInfo: {},
    failureReason: '' // 失败原因
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    self.getUserInfo();
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 获取用户信息
  getUserInfo: function() {
    var self = this;
    return request.post(api.getUserInfo).then((res) => {
      self.setData({
        userInfo: res.data
      })
    });
  },

  // 全部提现
  withdrawAll: util.throttle(function(e) {
    var self = this;
    var allAmount = e.currentTarget.dataset.amount;
    self.setData({
      withdrawalAmount: allAmount
    })
  }, 1000),

  // 提现
  withdrawImmediately: util.throttle(function(e) {
    var self = this;
    const { lg, withdrawalAmount, userInfo} = self.data;
    var amount = withdrawalAmount + '' ;
    amount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 保留小数点2位

    if (amount.indexOf(".") < 0 && amount != "") { // 去除整数前边的0 如： 0012
      amount = amount.replace(/\b(0+)/gi, "");
    } 

    if (!util.removeSpaces(amount)) { // 空
      util.showToast(lg.inputPlaceholder);
      return false
    };

    if (amount <= 0 ) { // 小于0
      util.showToast(lg.surefire);
      return false
    };

    if (amount > userInfo.accountMy) { // 大于余额
      util.showToast(lg.exceed);
      return false
    };

    self.withdraw(amount);
  }, 1000),

  // 获取用户信息 type 1支付宝，2微信
  withdraw: function(price) {
    var self = this;
    if (self.data.lock) return;
    self.setData({
      lock: true
    })

    return request.post(api.withdraw, {
      price: price,
      type: 2
    }).then((res) => {
      self.getUserInfo();
      self.setData({
        withdrawalAmount: '',
        lock: false
      })
      wx.navigateTo({
        url: '../paymentSuccess/paymentSuccess?transactionId=' + res.data.id + "&orderType=2&createdTime=" + res.data.createTime
      })
    }).catch((err) => {
      self.setData({ 
        lock: false,
        failureReason: err.msg
      })
      modal = this.selectComponent('.fail-modal');
      modal.modalShow();
      // wx.navigateTo({
      //   url: '../paymentFailed/paymentFailed?transactionId=' + err.data.id + "&orderType=2&createdTime=" + res.data.createTime
      // })
    });
  },

  closeModal: function() {
    modal.modalColse();
  },

  // 获取输入框的值
  getAmount(e) {
    // “.”只出现一次，而不能出现两次以上
    e.detail.value = e.detail.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");

    //只能输入两个小数  
    // e.detail.value = e.detail.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');

    //清除“数字”和“.”以外的字符   
    e.detail.value = e.detail.value.replace(/[^\d.]/g, "");  

    if (e.detail.value.indexOf(".") == 0) {
      // 自动补零
      e.detail.value = e.detail.value.replace(/[^$#$]/g, "0.");
      //只保留第一个“.”, 清除多余的
      e.detail.value = e.detail.value.replace(/\.{2,}/g, ".");
    }
    
    this.setData({
      withdrawalAmount: e.detail.value
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
    this.getUserInfo();
    wx.stopPullDownRefresh();
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