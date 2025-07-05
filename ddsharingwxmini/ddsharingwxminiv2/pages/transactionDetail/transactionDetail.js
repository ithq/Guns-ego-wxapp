// pages/transactionDetail/transactionDetail.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/transactionDetail.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

const pageSize = 10; 
let lastMonth = 0; // 每月数据最后一组数据的月份

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    listData: [],
    page: 1, //当前页数
    triggered: true, // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    loadMore: true,  // false: 没有更多了
    loadingData: true, // true: 开始加载下一页
    transactionType: 'create_date', //  排序传参类型 create_date： 充值、 add_time： 消费
    apiType: 'rechargeList', // 接口类型 rechargeList:充值 tranlist 消费
    switchNavStatu: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
  },

  // 导航切换
  switchNav: util.throttle(function(e) {
    this.setData({
      listData: [],
      loadMore: true,
      transactionType: e.currentTarget.dataset.type,
      apiType: e.currentTarget.dataset.apitype,
      page: 1,
      switchNavStatu: e.currentTarget.dataset.index
    });

    wx.nextTick(() => {
      this.getData(1, true);
    })
  }, 800),

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },

  //获取充值记录
  getData: function(pageNo, override) {
    const self = this;
    let { transactionType, apiType } = self.data;
    lastMonth = override ? 0 : lastMonth;
    self.setData({
      page: pageNo
    });

    request.post(api[apiType],{
      page: pageNo,
      pageSize: pageSize,
      sort: transactionType,
      orderType: 1, 
      order: "desc",
      starDate: "",
      endDate: "",
    }).then((res) => {
      if (res.data.length > 0) {
        let pageData = res.data;
        let pageArrayData = [] 

        pageData.map(item => {
          item.monthShow = true // 显示月份
          pageArrayData = pageArrayData.concat(item.data)

          if (item.month == lastMonth) { // 如果当前月份和上一页数据最后的月份相同则隐藏月份
            item.monthShow = false
          }
        })
        lastMonth = pageData[res.data.length - 1].month // 重新赋值

        self.setData({
          listData: override ? pageData : self.data.listData.concat(pageData),
          loadMore: parseInt(pageArrayData.length % pageSize) == 0 ? true : false
        })
      } else {
        self.setData({
          loadMore: override ? true : false
        })
      }
    }).then((res) => {
      this.setData({
        loadingData: false,
        triggered: false
      })
      this._freshing = false
    }).catch((err) => {
      this.setData({
        loadMore: true,
        loadingData: true,
        triggered: false
      })
      this._freshing = false
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
    if (loadingData || !this.data.loadMore) return
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