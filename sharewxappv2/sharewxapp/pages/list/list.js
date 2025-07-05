// list.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: [],
    netDotUrl: "",
    resourceUrl: app.globalData.resourceUrl,
    totalCount: 6,
    isEmpty: false,
    responseFlah: true,
    totalCountStar: 0,
    onScrollLowerFlag: true,
    loadingHidden: false
  },
  netDot: function (e) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    that.data.netDotUrl = '../netDot/netDot?shopAddr=' + e.currentTarget.dataset.shopaddr + '&latitude=' + e.currentTarget.dataset.latitude + '&longitude=' + e.currentTarget.dataset.longitude + '&phone=' + e.currentTarget.dataset.phone + '&otherImgUrlList=' + e.currentTarget.dataset.otherimgurllist;
    wx.navigateTo({
      url: that.data.netDotUrl
    });
  },
  onLoadData:true,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //绑定回到首页的按钮
    app.bindHomePageButton(that, "../index/index");
    //得到到缓存   
    var responseInfo = wx.getStorageSync('responseInfo')
    //加载数据
    that.loadData(responseInfo);
  },
  loadData: function (responseInfo) {
    var that = this;
    that.onLoadData = true;
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //附近商家信息
    util.shareRequest("wxapp", "nearMerchant", {
      longitude: responseInfo.centerLongitude,
      latitude: responseInfo.centerLatitude
    },that.processNearMerchantData,
    function (msg) {
      //失败
    },function (msg) {
      //完成
      app.finishOperation(that);
      that.onLoadData = false;
    })
  },
  processNearMerchantData: function (rs) {
    if (rs.data.length == 0){
      util.confirmDialog('提示','附近暂无可充电网点哦!',
      function (confirm) {
        wx.reLaunch({
            url: '../index/index'
          })
        },
      function(confirm){
        wx.reLaunch({
          url: '../index/index'
        })
      })
      return;
    }

    var that = this;
    that.setData({
      item: rs.data
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.onLoadData){
      app.finishOperation(this);
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})