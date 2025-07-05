// pages/personalInformation/personalInformation.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/personalCenter.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

let modal = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    userInfo: {},
    failureText: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserInfo();
  },

  // 获取手机号
  getPhoneNumber: function (e) {
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      const {encryptedData, iv} = e.detail;
      request.login().then((res) => { // 登录 获取code
        request.getSessionKey(res.code).then(res => { // 获取sessionKey openId
          const {sessionKey, openId} = res.data;
          this.getMobile(encryptedData, iv, sessionKey, openId)
        })
      });
    }
  },

  getMobile: function(encryptedData, iv, sessionKey, openId) {
    request.post(api.getMobile, {
      cloudID: "",
      encryptedData: encryptedData,
      iv: iv,
      sessionKey: sessionKey,
      openId: openId
    }).then((res) => {
      this.toast.showToast({
        type: 'success',
        txt: this.data.lg.bindSuccess,
        duration: 2000,
        compelete: () => {
          this.getUserInfo();
        }
      }) 
    }).catch((err) => {
      this.toast.showToast({
        type: 'fail',
        txt: err.msg + this.data.lg.rerequest,
        duration: 2000
      }) 
    });
  },

  failureConfirm: function() {
    modal.modalColse();
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 获取用户信息
  getUserInfo: function() {
    request.post(api.getUserInfo).then((res) => {
      this.setData({
        userInfo: res.data
      })
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.toast = this.selectComponent("#toast");
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