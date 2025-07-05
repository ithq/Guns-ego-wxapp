// pages/wallet/wallet.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/wallet.js");  //语言包
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
    lock: false,
    imgUrl: app.globalData.imgUrl,
    userInfo: {}, // 用户信息
    amount: "", // 充值金额
    moneyList:[], // 金额列表
    rechargeIndex: 0, // 金额列表下标
    hideFlag: true, //true 隐藏  false 显示
    animationData: {} // 弹框动画
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  initData: function() {
    this.getUserInfo().then(() => {
      this.rechargeMoney();
    })
  },

  // 金额列表
  rechargeMoney: function(qrcode) {
    return request.post(api.rechargeMoney).then((res) => {
      // str.split
      this.setData({
        moneyList: res.data.split(','),
        amount: res.data.split(',')[0]
      })
    }).catch(err => {
      this.setData({
        moneyList: [1,2,5,10,20,50],
        amount: 1
      })
    });
  },

  // 获取用户信息
  getUserInfo: function() {
    var self = this;
    return request.post(api.getUserInfo).then((res) => {
      self.setData({
        userInfo: res.data
      })
    }).catch((err) => {
      console.log('失败');
    });
  },

  // 选择金额
  pickAmount: util.throttle(function(e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var amount = e.currentTarget.dataset.amount;
    self.setData({
      rechargeIndex: index,
      amount: amount
    })
  }, 100),

  // 充值
  confirmRecharge: util.throttle(function(e) {
    var self = this;
    self.hideModal();

    if (self.data.lock) return;
    self.setData({
      lock: true
    })

    self.recharge().then((res) => { // 发起充值
      self.doWxRecharge(res.data.wechatPayResult).then(() => { // 微信充值
        self.rechargeFinish(res.data.rechargeId); // 完成充值
      }).catch((err) => {
        self.setData({
          lock: false
        })
        console.log(err)  // 用catch(e)来捕获错误{"errMsg":"requestPayment:fail cancel"}
      })
    }).catch((err) => {
      self.setData({
        lock: false
      })
    });
  }, 1000),

  // 发起充值 type 0微信，3支付宝
  recharge: function () {
    return request.post(api.recharge, {
      price: this.data.amount,  // this.data.amount
      type: 0
    })
  },

  // 微信充值
	doWxRecharge(param) {
    const self = this;
    return new Promise((resolve, reject) => {
      wx.requestPayment({ //小程序发起微信充值
        appId: param.appId,
        timeStamp: param.timeStamp, //时间戳 timeStamp一定要是字符串类型的，不然会报错
        nonceStr: param.nonceStr, // 随机字符串，长度为32个字符以下
        package: param.packages,  // 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
        signType: param.signType, // 签名类型，默认为MD5，
        paySign: param.paySign, // 签名
        success: event => {
          resolve(event);
        },
        fail: error => {
          console.log(error.errMsg);
          if (error.errMsg == "requestPayment:fail cancel") {
            util.showToast(self.data.lg.rechargeCancel);
          } else {
            util.showToast(error.errMsg);
          }
          reject(error);
        }
      })
    })
  },

  // 充值完成
  rechargeFinish: function (rechargeId) {
    return request.post(api.rechargeFinish + '?rechargeId=' + rechargeId).then((res) => {
      this.setData({
        lock: false
      })
      wx.navigateTo({
        url: "../paymentSuccess/paymentSuccess?transactionId=" + rechargeId + "&orderType=1&createdTime=" + res.data.createTime
      })
    }).catch(err => {
      this.setData({
        lock: false
      })
      wx.navigateTo({
        url: "../paymentFailed/paymentFailed?transactionId=" + rechargeId + "&orderType=1&createdTime=" + res.data.createTime
      })
    });
  },

  /**
   * 动画效果
   * */ 
  // 显示遮罩层
  showRecharge: function () {
    var self = this;
    self.setData({
      hideFlag: false
    })
    
    var animation = wx.createAnimation({ // 创建动画实例
      duration: 420,
      timingFunction: 'ease',
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      self.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
 
  // 隐藏遮罩层
  hideModal: function () {
    var self = this;
    var animation = wx.createAnimation({
      duration: 420,
      timingFunction: 'linear',
    })
    this.animation = animation
    self.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      self.setData({
        rechargeIndex: 0,
        hideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 430)//先执行下滑动画，再隐藏模块
    
  },

  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      animationData: this.animation.export()
    })
  },

  //动画 -- 滑出
  slideDown: function () {
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
    });
    this.initData();
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
    this.getUserInfo();
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