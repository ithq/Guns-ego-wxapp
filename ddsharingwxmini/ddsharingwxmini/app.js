// app.js
const util = require('/utils/util.js');
var api = require('/config/api.js');

App({
  globalData: {
    appName: '共享扫码充电',
    serviceTel: '4006662808',
    weChatVersion: 'V1.0',
    email: 'kf@flypowersz.com',
    webSite: 'http://flypowersz.com',
    userInfo: null, //用户信息
    authGetUserInfo: false, // 是否授权用户，授权成功ture
    authCode: '', // 授权code
    sessionId: '', // session
    isDoLoginFlag: false, //  true登录中
    loginCount: 0, // 登录次数
    isLoginServerFlag: false, //true登录服务中
  },
  onLaunch() {
    let that = this;
    // 1.获取缓存信息
    try {
      that.globalData.userInfo = wx.getStorageSync('userInfo');
    } catch (e) {}

  },
  /**
   * 成功授权拿到用户信息后回调
   */
  onGetUserInfoSuccessCallback: function (userInfo) {},
  /**
   * 登录成功回调
   */
  onLoginSuccessCallback: function (userInfo) {},
  /**
   * 登录失败回调
   */
  onLoginFailCallback: function () {},
  /**
   * 是否登录
   * @returns boolean 
   */
  isLogined: function () {
    if (this.globalData.sessionId == null || this.globalData.sessionId == '') {
      return false;
    }
    return true;
  },
  /**
   * 获取sessionId
   */
  getSessionId: function (count = 0) {
    let sessionId = null;
    try {
      sessionId = wx.getStorageSync('sessionId');
    } catch (error) {
      if (count == 0) {
        return this.getSessionId(count++);
      }
    }
    return sessionId;
  },
  /*
   *根据扫一扫得到的二维码得到充电器id..
   */
  handleQrcodeUrlAndConfirmFun: function (obj, qrcodeUrlContext, confirmFun) {

  },
  /**
   * 当前用户拒绝获到用户信息，调用此方法，并提示用户
   * @param {string} msg 
   */
  refusedGetUserInfoWithUser: function (msg) {
    let that = this;
    util.confirmDialog({
      title: '提示',
      content: '拒绝授权获取微信昵称等信息，部分功能您将无法使用,是否重新授权！',
      confirmText: '是',
      successFun: function () {
        wx.reLaunch({
          url: '/pages/auth/auth'
        })
      },
      calcelText: '否',
      cancelFun: function () {
        wx.reLaunch({
          url: '/pages/index/index?refusedGetUserInfo=true'
        })
      }
    })
  },
  /**
   * 根据微信的code及usrInfo信息，处理共享充电系统登录相关事务并实现登录
   * 1.判断是否在登录中..
   * 2.保存登录数的全局参数
   * 3.处理成功获取到头象的回调
   * 4.处理服务器登录请求....
   * @param {object} userInfo 
   */
  doLoginWithGetUserInfoEvent: function (userInfo) {
    let that = this;
    // 1.先判断一下是否正在登录中...
    if (that.globalData.isDoLoginFlag) {
      return;
    }
    // 2.标记正在登录中
    that.globalData.isDoLoginFlag = true;
    that.globalData.authGetUserInfo = true;
    that.globalData.loginCount = 0;
    // 3.处理成功获取到头象后的回调
    that.onGetUserInfoSuccessCallback && that.onGetUserInfoSuccessCallback(userInfo);
    // 4.保存头像信息
    try {
      that.globalData.userInfo = userInfo;
    } catch (error) {}
    // 5.保存用户信息到后台
    that.doLoginForServerEvent(userInfo);
    that.globalData.isDoLoginFlag = false;
  },
  /**
   * 根据微信返回的信息登录共享充电器....
   * 1.分解微信返回的数据
   * 2.调服务端方法登录
   * 3.处理端返回参数
   * @param {object} userInfo 
   */
  doLoginForServerEvent: function (userInfo) {
    let that = this;
    if (that.globalData.isLoginServerFlag) {
      return;
    }
    that.globalData.isLoginServerFlag = true;
    // 1.标记登录次数
    that.globalData.loginCount = that.globalData.loginCount + 1;
    var params = {
      code: that.globalData.authCode,
      iv: userInfo.iv,
      encryptedData: userInfo.encryptedData,
      userInfo: userInfo.userInfo
    }
    // 2.登录服务
    util.request(api.Login, params, 'POST').then(res => {
      that.globalData.isLoginServerFlag = false;
      // 1.分析返回参数
      var result = res.data;
      var token = result.token;
      var getUserInfo = result.userInfo;
      // 2.保存参数session
      that.globalData.sessionId = token;
      that.globalData.userInfo = getUserInfo;
      wx.setStorageSync('sessionId', token);
      wx.setStorageSync('userInfo', getUserInfo);
      // 3. 登录成功回调
      that.onLoginSuccessCallback && that.onLoginSuccessCallback(getUserInfo);
    }).catch(res => {
      that.globalData.isLoginServerFlag = false;
      that.onLoginFailCallback && that.onLoginFailCallback();
      //失败后重试3次登录...
      if (that.globalData.loginCount < 3) {
        that.doLoginForServerEvent(userInfo);
      }
    })
  },
  /**
   * 弹出插屏广告
   */
  showInterstitial(adUnitId) {
    // 在页面onLoad回调事件中创建插屏广告实例
    let interstitialAd = null
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: adUnitId
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
    // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
  },
  /**
   * 处理重复操作问题，操作时屏蔽层
   * @param {object} object 
   * @param {string} message 
   */
  firstOperate: function (object, message) {
    if (!util.throttle(object, 500)) {
      return;
    }
    return this.showLoadingForFirstOperate(object, message, true);
  },
  /**
   * 处理重复操作问题，操作屏蔽层
   * @param {*} object 
   * @param {*} message 
   * @param {*} showFlag 
   */
  showLoadingForFirstOperate: function (object, message, loadingFlag) {
    if (object.data.doubleOperateFlag == null || object.data.doubleOperateFlag == undefined) {
      object.setData({
        doubleOperateFlag: true
      })
    }
    if (!object.data.doubleOperateFlag) {
      return false;
    }
    object.setData({
      doubleOperateFlag: false
    })
    object.data.doubleOperateFlag = false;
    if (loadingFlag) {
      util.showLoading(message);
    }
    return true;
  },
  /**
   * 删除防重复操作屏蔽层
   * @param {*} object 
   */
  endOperate: function (object) {
    return this.showLoadingEndOperate(object, true);
  },
  /**
   * 删除防重复操作屏蔽层
   * @param {*} object 
   */
  showLoadingEndOperate: function (object, loadingFlag) {
    object.setData && object.setData({
      doubleOperateFlag: true
    })
    if (object.data) {
      object.data.doubleOperateFlag = true;
    }
    if (loadingFlag) {
      util.hideLoading();
    }
  },
  /**
   * 处理扫码得到的二维码地址
   * @param {object} obj 
   * @param {string} url 
   */
  handleScanUrl: function (obj, url) {
    var deviceInfo = this.getParamByUrl(url);
    if (deviceInfo.productId == '' || deviceInfo.deviceId == '') {
      util.alertDialog('提示信息', '请扫码正确的二维码！', '确定');
      return;
    }
    this.scanDeviceForService(obj, deviceInfo.productId, deviceInfo.deviceId, null);
  },
  /**
   * 从二维码地址转成设备id
   * @param {string} url 
   * @return {productId, deviceId}
   */
  getParamByUrl(url) {
    var obj = {}
    var str = url.split("?")[1].split("&")
    for (var i = 0; i < str.length; i++) {
      var a = str[i].split('=')
      obj[a[0]] = a[1]
    }
    return obj;
  },
  /**
   * 处理扫码服务
   * @param {object} obj 
   * @param {string} productId 
   * @param {string} deviceId 
   * @param {function} confirmFun 
   */
  scanDeviceForService: function (obj, productId, deviceId, confirmFun) {
    let that = this;
    // 1.服务参数
    var params = {
      productId: productId,
      deviceId: deviceId
    }
    // 2.调用服务
    util.request(api.SingleSelectPage, params).then(res => {
      that.endOperate(obj);
      // 3.判断有订单，跳转订单页面；否则跳转充值页面
      var pageList = {
        'using1': '/pages/continueAndFinished/continueAndFinished',
        'using2': '/pages/using2/using2',
        'rule1': '/pages/rule1/rule1',
        'rule2': '/pages/rule2/rule2'
      };
      var page = res.data.page;
      var singleOrderId = res.data.singleOrderId;
      var pageUrl = pageList[page];
      if (pageUrl) {
        wx.navigateTo({
          url: pageUrl + '?singleOrderId=' + singleOrderId + '&productId=' + productId + '&deviceId=' + deviceId
        })
      } else {
        util.alertDialog('提示信息', '处理二维码信息异常，请确认二维码是否正确！', '确定', function () {
          confirmFun && confirmFun();
        });
      }
    }).catch(res => {
      that.endOperate(obj);
      util.alertDialog('提示信息', '处理二维码信息异常，请确认二维码是否正确！', '确定', function () {
        confirmFun && confirmFun();
      })
    })
  }
})