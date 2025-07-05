// pages/historicalFeedback/historicalFeedback.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/feedBack.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: util.getLanguage(language),
    common: util.getLanguage(common),
    listData: [],
    showData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: this.data.lg.historicalFeedback
    });
    this.getData();
  },

  // 当前时间转化
  timeConversion: function() {
    let date = new Date()
    const todayDate = util.formatTime(date);
    return todayDate.replace(/\//g, "-").split(" ")[0]
  },

  getTime: function(date, flag) {
    if (flag) {
      let s = date.split(" ")[1];
      return s.substr( 0 , s.lastIndexOf(":")); 
    } else {
      return date.split(" ")[0]; 
    }
  },

  // 获取数据
  getData: function() {
    const self = this;
    const today = self.timeConversion();

    request.post(api.feedbackList).then((res) => {
      if (res.data.length > 0) {
        res.data.map(item => {
          if (item.addTime.split(" ")[0] == today) {
            item.addTime = self.getTime(item.addTime, 1)
          } else {
            item.addTime = self.getTime(item.addTime)
          }
        });
        self.setData({
          showData: false,
          listData: res.data
        })
      } else {
        self.setData({
          showData: true
        })
      }
    }).then(res => {
      wx.stopPullDownRefresh();
    }).catch(err => {
      wx.stopPullDownRefresh();
      self.setData({
        showData: true
      })
      console.log(err)
    })
  },

  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
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
    this.getData();
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