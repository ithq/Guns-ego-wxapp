// pages/rentalRecordDetail/rentalRecordDetail.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/rentalRecord.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

var coutTimer, refreshTimer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    roderDetail: {},
    useTime: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;

    if (options.orderId) {
      self.getData(options.orderId)
    }
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

  /**
   * 获取订单列表
   * borrowState，订单状态 0.未租借 1.请求中 2.租借中 3.已撤销 4.故障单 5.已归还 6.购买单 8.超时单 -1.已删除
   */
  getData: function(orderId) {
    var self = this
    return request.post(api.orderDetail + '?orderSn=' + orderId).then((res) => {
      if (res.data.borrowState == 2) {
        // var diffTime = util.diffTime(res.data.borrowTime);
        // res.data.usedMinute =  util.diffTimeFormat(diffTime);
        self.timer(res.data.borrowTime);
      } else {
        clearTimeout(refreshTimer); //移除计时器
        clearTimeout(coutTimer); 
        res.data.usedMinute = util.leaseUseTime(res.data.usedMinute);
      }

      self.setData({
        useTime: true,
        roderDetail: res.data
      });
    }).then(() => {
      clearTimeout(refreshTimer);  //移除计时器
      refreshTimer = setTimeout(() => {this.getData(orderId)}, 60*1000);
    });
  },

  //计时器,首页租借中订单时间
  timer: function(borrowTime){
    var differ = util.diffTime(borrowTime); // 时间戳差
    var strs = util.diffTimeFormat(differ); // 格式： 00:00:00
    var usedMinute = 'roderDetail.usedMinute';
    this.setData({
      [usedMinute]: strs
    })
    clearTimeout(coutTimer);
    coutTimer = setTimeout(() => {this.timer(borrowTime)},1000);
  }, 

  //一键复制
  copyTxt: util.throttle(function(e) {
    var self = this;
    var txt = e.currentTarget.dataset.txt;
    wx.setClipboardData({
      data: txt,
      success (res) {
        console.log(res)
        util.showToast(self.data.commonLg.copySuccessful)
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
          }
        })
      }
    })
  }, 1000),

  // 打开扫描
  scanCode: util.throttle(function(e) {
    var self = this;
    util.scanCode(self.data.commonLg.scanFail);
  }, 1000),

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
    clearTimeout(refreshTimer); //移除计时器
    clearTimeout(coutTimer);  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(refreshTimer); //移除计时器
    clearTimeout(coutTimer);  
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