// pages/helpCenter/helpCenter.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/helpCenter.js");  //语言包
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
    faqList: [],
    answerList: [],
    phoneNumber: '',
    notViewedNum: 0
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


  // 获取数据
  getData: function() {
    const self = this;
    var lang = wx.getStorageSync('language') || 'zh-CN'
    request.post(api.problem + '?language=' + lang).then((res) => {
      var faqList = res.data.raqs;
      faqList.map((item,index) => {
        item.index = +index + 1
        item.useful = 0;
        item.useless = 0;
      });

      self.setData({
        faqList: faqList,
        phoneNumber: res.data.customerPhone
      })
    });
  },

  // 获取答案
  getAnswer: util.throttle(function(e) {
    var self = this;
    var questionId = e.currentTarget.dataset.id;

    var answer = self.data.faqList.filter(item => {
      return item.id == questionId;
    })
    
    if(answer.length>0){
      self.data.answerList.push(answer[0]);
      self.setData({
        answerList: self.data.answerList
      });

      // 滚动位置
      const query = wx.createSelectorQuery();
      query.select('#help_center_faq_list').boundingClientRect();
      query.exec(function (res) {
        wx.pageScrollTo({
          scrollTop: res[0].height, 
          duration: 300
        })
      });
    }
  }, 1000),

  //点击有用
  clickUsrful: function(e) {
    var self = this;
    var questionId = e.currentTarget.dataset.id;
    var flag = e.currentTarget.dataset.flag;
    var answerList = self.data.answerList;

    answerList.map(item => {
      if (item.id == questionId) {
        if (item.useful == 1 || item.useless == 1) {
          util.showToast(self.data.lg.replied)
          return false
        }
        item[flag] = 1;
        util.showToast(self.data.lg.thanks);
      }
    });

    self.setData({
      answerList: answerList
    });
  },
  
  //拨打电话
  dialNumber: util.throttle(function(e) {
    const modal = this.selectComponent('.show-modal');
    modal.modalShow();
  },1000),

  call: function() {
    var self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.phoneNumber
    }).catch((e) => {
      console.log(e)  // 用catch(e)来捕获错误{makePhoneCall:fail cancel}
    })
  },

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },

  // 统计未查看
  notViewed: function() {
    const self = this;
    request.post(api.countFeek).then((res) => {
      self.setData({
        notViewedNum: res.data
      })
    });
  },

   //跳转使用教程
  goUserMethod: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url + "?type=bluetooth"
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
    this.notViewed();
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