// pages/login/login.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/login.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    language: '',
    modalText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  //  授权登录
  bindGetUserInfo: function (e) { 
    if (e.detail.errMsg == "getUserInfo:ok") { // 允许
      wx.showLoading({
        title: '登录中...',
        mask: true
      })
      // 缓存用户微信信息
      const {userInfo,encryptedData, iv} = e.detail
      app.globalData.userInfo = userInfo;

      // 登录，获取token
      request.login().then((res) => { // 登录
        request.getSessionKey(res.code).then(res => {
          request.getToken(encryptedData, iv, res.data.sessionKey).then(result => {
            wx.hideLoading();
            wx.setStorageSync('token', result.data.token);

            // 外部扫码租借登录
            var externalCode = wx.getStorageSync('externalCode') || '{}';
            var codeData = JSON.parse(externalCode);

            if (!codeData.qrcode) {
              this.goBack();
              return false
            }
            
            switch (codeData.type) {
              case 'cdb':
                wx.redirectTo({
                  url: '/pages/rental/rental?qrcode=' + codeData.qrcode,
                });
                break;
              case 'mmx':
                  wx.redirectTo({
                    url: '/pages/line/lease/lease?qrcode=' + codeData.qrcode,
                  });
                  break;
              case 'bluetooth':
                // 为了不影响原有的蓝牙线，使用新的page
                if (codeData.qrcode.startsWith('70')){
                  wx.navigateTo({
                    url: '/pages/ble/lease/lease?qrcode=' + codeData.qrcode,
                  });
                } else {
                  wx.navigateTo({
                    url: '/pages/bluetooth/lease/lease?qrcode=' + codeData.qrcode,
                  });
                }
                break;
              default:
                this.goBack();
                break;
            }
          });
        })
      }).catch((err) => {
        wx.hideLoading();
        this.setData({
          modalText: err.msg + '，' + this.data.lg.loginAgain
        })
        this.fialModal.modalShow();
      });
    } else { // 拒绝
      this.setData({
        modalText: this.data.lg.refuseText
      })
      this.modal.modalShow();
    }
  },

  // 确定拒绝授权
  refuse: function(e) {
    this.goBack();
  },

  // 返回上一页
  goBack: function () {
    util.goBack();
  },

  loginAgain: function() {
    this.fialModal.modalColse();
  },

  //页面跳转
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
    this.modal = this.selectComponent('.refuse-modal');
    this.fialModal = this.selectComponent('.fail-moda');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var lang = wx.getStorageSync('zhengdeLanguage');
    var lg = util.getLanguage(language);
    var commonLg = util.getLanguage(common);
    this.setData({
      lg: lg,
      commonLg: commonLg,
      language: lang
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.removeStorageSync('externalCode');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('externalCode');
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