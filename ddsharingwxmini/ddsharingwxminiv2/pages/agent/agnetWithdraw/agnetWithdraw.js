// pages/agent/agnetWithdraw/agnetWithdraw.js

const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/withdraw.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var allMoney;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: util.getLanguage(language),
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    showLoading: true,
    withdrawalAmount: '', // 提现金额
    money: "",
    name: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    // allMoney = options.canWithdraw || 0;
    wx.setNavigationBarTitle({
        title: self.data.lg.pageTitle
    });
    // this.setData({
    //   money: options.canWithdraw
    // })
    this.getData();
  },
  getData() {
    var self = this;
    request.post(api.withdrawalAmount).then(res => {
      if(res.code == 1){
        allMoney = res.data.accountMy;
        self.setData({
          money: res.data.accountMy,
          name: res.data.name
        })
      }
    }).catch(err => {

    })
  },
  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 全部提现
  withdrawAll: util.throttle(function(e) {
    var self = this;
    self.setData({
      withdrawalAmount: allMoney
    })
  }, 1000),

  // 提现
  withdrawImmediately: util.throttle(function(e) {
    var self = this;
    const { lg, withdrawalAmount } = self.data;
    var amount = withdrawalAmount + '' ;
    amount = amount.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 保留小数点2位
    console.log("提现金额："+amount);
    console.log("所有金额："+allMoney);
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

    if (amount > allMoney) { // 大于余额
      util.showToast(lg.exceed);
      return false
    };

    self.withdraw(amount);
  }, 1000),

  //  type 1支付宝，2微信
  withdraw: function(price) {
    var self = this;
    return request.post(api.agentWithdrawal, {
      accountMy: price,
      type: 2
    }).then((res) => {
      if(res.code == 1){
        util.myShowToast(self.data.lg.submitSuccess);
        self.getData();
      }else{
        util.myShowToast(res.msg);
      }
    }).catch((err) => {
      util.myShowToast(err.msg);
    });
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
    app.clearLoadingTimer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.clearLoadingTimer();
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