// pages/userProtocol/userProtocol.js
const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/protocol.js");  //语言包
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
    protocolContent: ''
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

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },

  getData: function() {
    var self = this;
    var lang = wx.getStorageSync('language') || 'zh-CN';
    request.post(api.agreement + '?language=' + lang).then((res) => {
      var protocolContent =  res.data.content
      // 没有域名
      // articalContent.replace("/upload/image","http://localhost:8080/upload/image")
      protocolContent = protocolContent.replace(/<img/gi, '<img mode="widthFix" style="max-width:100%;display:block"')
      .replace(/<section/g, '<div').replace(/\/section>/g, '\div>');
      console.log(protocolContent);
      self.setData({
        protocolContent: protocolContent
      })
    });
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