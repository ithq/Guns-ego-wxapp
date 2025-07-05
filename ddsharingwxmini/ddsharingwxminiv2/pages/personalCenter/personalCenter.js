// pages/personalCenter/personalCenter.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/personalCenter.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    userInfo: {},
    expired: true,
    loginShow: false, // 代理登录
    account: '',
    pasd: '',
    isLock: false,
    notFull: false,
    notViewedNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },

  // 打开扫描
  scanCode: util.throttle(function(e) {
    // rentalStatus 1租借中
    if (this.data.userInfo.rentalStatus == 1) {
      wx.navigateTo({
        url: '../rentalRecord/rentalRecord'
      })
    } else {
      util.scanCode();
    }
  }, 1000),

  // 获取用户信息
  getUserInfo: function() {
    var self = this;
    request.post(api.getUserInfo).then((res) => {
      self.setData({
        userInfo: res.data,
        expired: false
      })
    }).then(res => {
      self.notViewed();
    }).catch((err) => {
      self.setData({
        expired: true
      })
    });
  },

  // 统计未查看
  notViewed: function() {
    const self = this;
    request.post(api.countFeek).then((res) => {
      self.setData({
        notViewedNum: res.data
      })
    });
  },

  /**
   * 代理登录
   * */
  internalLogin: function() {
    this.setData({
      loginShow: true
    })
  },

  // 关闭弹框
  loginColse: function() {
    this.setData({
      loginShow: false,
      isLock: false,
      notFull: false,
      account: '',
      pasd: ''
    })
  },

  // 获取账号密码
  getInputKey(e) {
    let key = e.currentTarget.dataset.name;
    let value = e.detail.value;
    this.setData({
      [key]: value
    })

    wx.nextTick(() => {
      let { account, pasd} = this.data;

      if (account  && pasd) {
        this.setData({
          notFull: true
        })
      } else {
        this.setData({
          notFull: false
        })
      }
    })
  },

  // 去登录
  toLogin: function() {
    // 验证是否为空
    let { account, pasd, lg} = this.data;
    account = util.removeSpaces(account);
    pasd = util.removeSpaces(pasd);

    if(!account) { // 账号
      util.showToast(lg.accountPlase);
      return false;
    }

    if(!pasd) {　// 密码
      util.showToast(lg.pasdPlase);
      return false;
    }

    this.loginApi(account, pasd)
  },

  // 登录接口
  loginApi: function(account, pasd) {
    if (this.data.isLock) return;
    this.setData({
      isLock:true,
      notFull: false
    });
    
    request.post(api.login, {
      mobile: account,
      pwd: pasd,
      type: 9 // 9.手机号登录
    }).then((res) => {
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('vip_agent_login', 1);

      util.showToast(this.data.lg.loginSuccess);
      this.loginColse();
      // wx.navigateTo({
      //   url: '../agent/productChoose/productChoose'
      // })
      this.goAgent();
    }).catch((err) => {
      util.showToast(err.msg);
      this.setData({
        isLock:false
      })
    });
  },
  //直接进入蓝牙线代理端
  goAgent(){
    //../personalCenter/personalCenter?type=3
    wx.navigateTo({
      url: '../agent/personalCenter/personalCenter?type=3',
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

    var vipAgentLogin = wx.getStorageSync('vip_agent_login');
    if (vipAgentLogin == 1) {
      // 重新登录
      wx.removeStorageSync('token');
      wx.removeStorageSync('vip_agent_login');
    }

    this.getUserInfo();
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