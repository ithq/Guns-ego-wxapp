// pages/nearbyShops/nearbyShops.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/index.js");  //语言包
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
    imgDefault: app.globalData.imgUrl + 'nearStore/default_logo3.png',
    back: true, 
    tabStatu: 3,  
    shopList: [], // 列表
    noData: false,
    page: 1, //当前页数
    loadMore: true,  // false: 没有更多了
    triggered: true, // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    loadingData: true, // false: 上拉加载下一页
    shopDetiail: {},
    showDetail: true, // 显示详情 true-隐藏  false-显示
    animationData:{}, //
    refresh: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  

  // 获取附近商家
  getData: function(pageNo, override) {
    this.setData({
      page: pageNo
    });

    request.post(api.nearbyShop,{
      latitude: wx.getStorageSync("lat") || '',
      longitude: wx.getStorageSync("lng") || '',
      page: pageNo,
      pageSize: pageSize,
      type: this.data.tabStatu 
    }).then((res) => {
      if (res.data.length > 0) {
        this.setData({
          noData:  false,
          shopList: override ? res.data : this.data.shopList.concat(res.data),
          loadMore: parseInt(res.data.length % pageSize) == 0 ? true : false,
        })
      } else {
        this.setData({
          noData:  override ? true : false,
          loadMore: override ? true : false
        })
      }
    }).then(() => { // 请求完成
      this.setData({
        refresh: false,
        loadingData: false,
        triggered: false
      })
      this._freshing = false
    }).catch((err) => {
      if (err == 'requestFailed') {
        this.setData({
          refresh: true
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

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 刷新
  toRefresh: function(e) {
    this.getData(1, true);
  },

  onLazyLoad(info) {
    console.log(info)
  },

  // 打开扫描
  scanCode: function(e) {
    var self = this;
    util.scanCode(self.data.commonLg.scanFail);
  },

  // 导航
  toNavigation: function(e) {
    const {lat, lng, name, address} = e.currentTarget.dataset;
    wx.openLocation({
      latitude: +lat,
      longitude: +lng,
      scale: 15,
      name: name,
      address: address
    })
  },

  // 打开详情弹框
  // 动画
  openDetail: function(e) {
    var self = this;
    var shopId = e.currentTarget.dataset.id;

    var shopDetiail = self.data.shopList.filter(item => {
        return item.shopId == shopId;
    })

    self.setData({
      shopDetiail: shopDetiail[0],
      showDetail: false
    })

    var animation = wx.createAnimation({
      duration: 600,// 动画的持续时间 默认400ms
      timingFunction: 'ease',// 动画的效果 默认值是linear
    })

    this.animation = animation 
    var time1 = setTimeout(function(){
      self.fadeIn(); // 调用显示动画
      clearTimeout(time1);
      time1 = null;
    }, 10)   
  },

  // 关闭详情
  closeDetail: function () {
    var self = this;
    var animation = wx.createAnimation({
      duration: 600,// 动画的持续时间 默认400ms
      timingFunction: 'linear',// 动画的效果 默认值是linear
    })
    this.animation = animation
    self.fadeDown(); // 调用隐藏动画   
    var time1 = setTimeout(function(){
      self.setData({
        showDetail: true,
        shopDetiailL: {}
      })
      clearTimeout(time1);
      time1 = null;
    }, 10) // 先执行下滑动画，再隐藏模块
  },

  // 显示动画
  fadeIn:function(){
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export() // 动画实例的export方法导出动画数据传递给组件的animation属性
    })    
  },

  // 隐藏动画
  fadeDown:function(){ 
    this.animation.translateY(600).step()
    this.setData({
      animationData: this.animation.export(),  
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
    wx.nextTick(() => {
      this.getData(1, true);
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.closeDetail();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.closeDetail();
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

  onPageScroll:function() { 

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})