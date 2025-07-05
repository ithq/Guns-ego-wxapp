// pages/aboutUs/aboutUs.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/aboutUs.js");  //语言包
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
    logo: app.globalData.imgUrl + "aboutUs/logo3.png",
    aboutUs: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    self.getData();
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  getData: function() {
    const self = this;

    request.post(api.aboutUs).then((res) => {
      self.setData({
        aboutUs: res.data
      })
    });
  },

  call: util.throttle(function(e) {
    const self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.aboutUs.tel
    }).catch((e) => {
      console.log(e)  // 用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })
  }, 500),

  //一键复制
  copyTxt: function (e) {
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