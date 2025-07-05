// about.js
const app = getApp();
const util = require("../../utils/util");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    aboutUs: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const aboutUs = {
      logoUrl: '/static/images/logo.png',
      weChat: app.globalData.appName,
      weChatVersion: app.globalData.weChatVersion,
      serviceTel: app.globalData.serviceTel,
      email: app.globalData.webSite.email,
      serviceEmail: app.globalData.email,
      webSite: app.globalData.webSite
    }
    this.setData({
      aboutUs: aboutUs
    })
  },
  // 打电话
  call: util.throttle(function (e) {
    const that = this;

    wx.makePhoneCall({
      phoneNumber: that.data.aboutUs.serviceTel
    }).catch((e) => {
      console.log(e) // 用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })
  }, 500),
  //一键复制
  copyTxt: function (e) {
    var self = this;
    var txt = e.currentTarget.dataset.txt;
    wx.setClipboardData({
      data: txt,
      success(res) {
        console.log(res)
        util.showToast(self.data.lg.copySuccessful)
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
})