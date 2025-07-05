// index.js
// 获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      userId: '10000',
      nickName: '点击登录',
      avatarUrl: '/static/images/avatar.png',
      userLevel:'',
      userLevelName:'',
      registerDate: '',
    },
    MyMenus: [
      {
        url: "scanDevice",
        pic: "scan.png",
        name: "扫码充电",
        bindtap: 'scanDevice'
      },
      {
        url: "/pages/orderList/orderList",
        pic: "record.png",
        name: "我的订单",
        bindtap: 'goPages'
      },
      // {
      //   url: "/pages/ucenter/address/address",
      //   pic: "address.png",
      //   name: "附近网点",
      //   bindtap: 'goPages'
      // },
      // {
      //   url: "/pages/feedback/feedback",
      //   pic: "feedback.png",
      //   name: "意见反馈",
      //   bindtap: 'goPages'
      // },
      {
        url: "/pages/about/about",
        pic: "about_us.png",
        name: "关于我们",
        bindtap: 'goPages'
      }
      // *,{ url: "/pages/about/about", pic: "comment.png", name: "使用帮助" }
    ],
    order: {
      unpaid: 0,
      unship: 0,
      unrecv: 0,
      uncomment: 0
    },
    hasLogin: false,
    totalAmount: 0.00
  },

  /**
   * 页面跳转
  */
 goPages:function(e){
    if (!app.isLogined()) {
      wx.navigateTo({
        url: "/pages/auth/auth"
      });
      return;
    };
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //1. 其它页面因为要登录，未曾登录而跳转过来的...
    var refusedGetUserInfo = options.refusedGetUserInfo;
    if(!app.isLogined() && refusedGetUserInfo != 'true' && !app.globalData.authGetUserInfo){
      wx.navigateTo({ url: '/pages/auth/auth' })
      return;
    }
    //2.成功获取授权信息后回调方法
    app.onGetUserInfoSuccessCallback = function(userInfo) {
      if(userInfo && userInfo.userInfo){
        // wx.setStorageSync('userInfo', userInfo.userInfo);
      }
    }
    //3.注册登录成功后回调方法
    app.onLoginSuccessCallback = function(userInfo){
      // 刷新用户信息
      that.setData({
        userInfo: userInfo
      })
      // 在页面onLoad回调事件中创建插屏广告实例
      // app.showInterstitial('adunit-37a884a0838296f7');
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    // 加载用户信息
    try {
      var userInfo = app.globalData.userInfo;
      that.setData({
        userInfo: userInfo
      })
    } catch (error) {}
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

  },
  /**
   * 扫码充电
   */
  scanDevice: function(){
    let that = this;
    if (!app.isLogined()) {
      wx.navigateTo({
        url: "/pages/auth/auth"
      });
      return;
    };
    if(!app.firstOperate(that, '正在加载...')){
      return;
    }
    wx.scanCode({
      success: (res) => {
        app.handleScanUrl(that, res.result);
      },
      complete: (res) => {
        app.endOperate(that);
      }
    })
  },
  /**
   * 联系客服
   * @param {*} e 
   */
  callPhone: function (e) {
    var that = this
    wx.makePhoneCall({
      phoneNumber: app.globalData.servicePhone
    })
  },
})