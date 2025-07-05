// pages/rentalRecord/rentalRecord.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/rentalRecord.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

const pageSize = 10;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    orderList: [],
    noData: true,
    tabStatu: 3,
    page: 1, //当前页数
    loadMore: true,  // false: 没有更多了
    triggered: true, // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    loadingData: true // false: 上拉加载下一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 返回上一页
  goBack:function(e) {
    util.goBack();
  },

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: url + '?orderId=' + id
    })
  },

  /**
   * 获取订单列表
   * borrowState，订单状态 0.未租借 1.请求中 2.租借中 3.已撤销 4.故障单 5.已归还 6.购买单 8.超时单 ,9.已完全退款,-1.已删除
   */
  getData: function(pageNo, override) {
    this.setData({
      page: pageNo
    });

    request.post(api.orderList,{
      page: pageNo,
      pageSize: pageSize,
      orderType: this.data.tabStatu 
    }).then((res) => {
      if (res.data.length > 0) {
        res.data.map(item => {
          if (item.borrowState == 2) {
            var diffTime = util.diffTime(item.borrowTime);
            item.usedMinute =  util.diffTimeFormat(diffTime);
          } else {
            item.usedMinute = util.leaseUseTime(item.usedMinute)
          }
        })

        this.setData({
          noData:  false,
          orderList: override ? res.data : this.data.orderList.concat(res.data),
          loadMore: parseInt(res.data.length % pageSize) == 0 ? true : false,
        })
      } else {
        this.setData({
          noData:  override ? true : false,
          loadMore: false
        })
      }
    }).then(() => {
      this.setData({
        refresh: false,
        loadingData: false,
        triggered: false
      })
      this._freshing = false
    }).catch((err) => {
      if (err == 'requestFailed') {
        this.setData({
          refresh: true,
          noData: false
        })
      }
      this.setData({
        loadMore: true,
        noData: override ? true : false,
        loadingData: true,
        triggered: false
      })
      this._freshing = false
    });
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
  }, 100),

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
    });

    wx.nextTick(() => {
      this.getData(1, true);
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
  onRefresh() { // 自定义下拉刷新被触发
    if (this._freshing) return
    this._freshing = true
    this.getData(1, true);
  },

  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  scrollToLower: function(e) {
    let loadingData = this.data.loadingData
    if (loadingData  || !this.data.loadMore ) return
    this.setData({
      loadingData: true
    });

    // 加载下一页数据
    if (this.data.loadMore) {
      this.getData(this.data.page + 1)
    }
  },

  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})