// auth.js
// 获取应用实例
const app = getApp()
const util = require("../../utils/util");

Page({
  data: {
    userInfo: {},
    needUserAuth: 0, // 是否需要授权，0显示登录中，1显示授权按钮
    hasUserInfo: false,
    scanByParam: '', // 扫码参数
    isFromScan: false, // 是否扫码进入
    retryLoginCount: 0, // 重试登录次数
    retryLoginMaxCount: 5, // 重试登录3次
    canIUseGetSetting: false,
    canIUseGetUserInfo: false,
    canIUseGetUserProfile: false
  },
  onLoad(options) {
    this.loadview();
  },
  /**
   * 加载
   */
  loadview: function () {
    let that = this;
    try {
      // 处理扫码
      if (wx.getLaunchOptionsSync) {
        let opts = wx.getLaunchOptionsSync();
        if (opts.query && opts.query.q) {
          that.setData({
            isFromScan: true,
            scanByParam: decodeURIComponent(opts.query.q)
          })
          wx.setStorageSync('scan_param', that.data.scanByParam)
        } else {
          wx.removeStorageSync('scan_param');
        }
      };
      // 权限检查
      that.setData({
        canIUseGetSetting: wx.canIUse("getSetting"),
        canIUseGetUserInfo: wx.canIUse('button.open-type.getUserInfo'),
        canIUseGetUserProfile: wx.canIUse("getUserProfile")
      })
    } catch (error) {}
  },
  onShow: function () {
    let that = this;
    // 授权登录
    that.setData({
      needUserAuth: 0
    });
    util.showLoading('加载中...');
    that.validateSession();
  },
  onHide: function () {
    // Do something when page hide.
  },
  onUnload: function () {
    // Do something when page close.
  },
  /**
   * 校验登录状态
   */
  validateSession: function () {
    let that = this;
    wx.checkSession({
      success: (res) => {
        //用户未登录的重新登录，已经登陆则直接跳转页面逻辑
        if (app.isLogined()) {
          app.globalData.authGetUserInfo = true;
          util.hideLoading();
          that.redirectPage();
        } else {
          //未登陆用户，执行登陆操作
          that.userLogin();
        }
      },
      fail: (res) => {
        // 未登录用户，标记
        app.globalData.authGetUserInfo = false;
        that.userLogin();
      }
    })
  },
  /**
   * 用户登录
   */
  userLogin: function () {
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          // 登录
          app.globalData.authCode = res.code;
          app.globalData.sessionId = null;
          // 新版本授权登录
          if (that.data.canIUseGetUserProfile) {
            // 授权微信头像和昵称
            if (!wx.getStorageSync('user_profile')) {
              util.hideLoading();
              //把用户同意授权标识上
              that.setData({
                needUserAuth: 1
              });
              return;
            }
          }
          if (that.data.canIUseGetSetting) {
            //获取授权结果
            wx.getSetting({
              success: (resquest) => {
                //授权用户信息
                if (resquest.authSetting['scope.userInfo']) {
                  that.getUserInfo();
                } else {
                  // 没有授权用户，重新授权
                  if (canIUseGetUserInfo) {
                    that.setData({
                      needUserAuth: 1
                    });
                    return;
                  } else {
                    wx.authorize({
                      scope: 'scope.userInfo',
                      success: (res) => {
                        // 得到用户信息登录
                        that.getUserInfo();
                      },
                      fail: (res) => {
                        that.getUserInfo();
                      }
                    })
                  }
                }
              },
              fail: (res) => {
                that.getUserInfo();
              }
            })
          } else {
            //获取用户信息
            that.getUserInfo();
          }
        } else {
          //登录失败，重试登录
          that.userRetryLogin();
        }
      },
      fail(res) {
        //登录失败，重试登录
        that.userRetryLogin();
      }
    })
    util.hideLoading();
  },
  /**
   * 调用登陆失败，5次重新尝试登陆机会
   */
  userRetryLogin: function () {
    let that = this;
    that.data.retryLoginCount = that.data.retryLoginCount + 1;
    if (that.data.retryLoginCount < that.data.retryLoginMaxCount) {
      that.userLogin();
    } else {
      // util.alertDialog('提示', '登录失败，请稍后再试！');
    }
  },
  /**
   * 得到用信息
   * @param {*} param 
   */
  getUserInfo: function (param) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    let that = this;
    wx.getUserInfo({
      lang: 'zh_CN',
      success: (res) => {
        // 授权成功回调
        app.globalData.authGetUserInfo = true;
        app.onGetUserInfoSuccessCallback && app.onGetUserInfoSuccessCallback(res);
        // 得到用户信息 登录
        app.globalData.loginCount = 0;
        app.doLoginWithGetUserInfoEvent(res);
        app.globalData.authGetUserInfo = true;
        // 页面跳转
        that.redirectPage();
      },
      fail: (res) => {
        if (that.canIUseGetUserInfo) {
          that.setData({
            needUserAuth: 1
          })
          return;
        }
        var msg = res.errMsg;
        if (msg.indexOf('auth deny') > -1) {
          app.refusedGetUserInfoWithUser();
        }
      }
    })
  },
  /**
   * 获取头像昵称
   * @param {object} e 
   */
  getUserProfile(e) {
    let that = this;
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        // 授权成功回调
        app.globalData.authGetUserInfo = true;
        app.onGetUserInfoSuccessCallback && app.onGetUserInfoSuccessCallback(res);
        // 同意授权，保存用户信息
        wx.setStorageSync('user_profile', 1);
        app.doLoginWithGetUserInfoEvent(res);
        that.redirectPage();
      },
      fail: (res) => {
        // 拒绝授权
        app.refusedGetUserInfoWithUser();
      }
    })
  },
  /**
   * 跳转网页 
   */
  redirectPage: function () {
    var scanParam = wx.getStorageSync('scan_param');
    if (scanParam) {
      this.doScanParam(scanParam);
      return;
    }
    // 跳转首页
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  /**
   * 处理二维码
   */
  doScanParam: function (scanParam) {
    let that = this;
    try {
      //得到完整的二维码url
      var qrCodeUrl = unescape(scanParam);
      wx.removeStorageSync('scan_param');
      // 调用统一处理二维码接口
      app.handleQrcodeUrlAndConfirmFun(that, qrCodeUrl, function () {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      })
    } catch (error) {}
  }
})