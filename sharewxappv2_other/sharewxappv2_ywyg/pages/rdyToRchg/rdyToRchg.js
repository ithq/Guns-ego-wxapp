// pages/rdyToRchg/rdyToRchg.js
//显示充电密码页面
const utls = require('../../utls/utls.js')
const cmmn = require('../../utls/cmmn.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    audioContext: null,
    advertImage: '',
    responseInfo: null,
    pwd: "",
    tradeId: "",
    deviceNo: "",
    resourceUrl: app.glbParam.serverUrl,
    chargerId: '',
    password0: "",
    password1: "",
    password2: "",
    password3: "",
    password4: "",
    password5: "",
    // 故障上报开关
    faultTorefund: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let audioContext = null;
    if (wx.createInnerAudioContext) {
      audioContext = wx.createInnerAudioContext();
    }
    app.HomeBtnOnBind(this, "/pages/index/index");
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo');
    var chargerId = "";
    var deviceNo = "";
    var tradeId = "";
    var pwd = "";
    if (responseInfo != null && responseInfo != undefined
      && responseInfo.map != null && responseInfo.map != undefined) {
      chargerId = responseInfo.map.chargerId;
      deviceNo = responseInfo.map.deviceNo;
      tradeId = responseInfo.map.tradeId;
      pwd = responseInfo.map.password;
    }
    var faultTorefund = false;
    if (responseInfo && responseInfo.config){
      faultTorefund = responseInfo.config.faultTorefund;
    }
    var pwd0 = (pwd > 0) ? pwd.charAt(0) : "";
    var pwd1 = (pwd > 1) ? pwd.charAt(1) : "";
    var pwd2 = (pwd > 2) ? pwd.charAt(2) : "";
    var pwd3 = (pwd > 3) ? pwd.charAt(3) : "";
    var pwd4 = (pwd > 4) ? pwd.charAt(4) : "";
    var pwd5 = (pwd > 5) ? pwd.charAt(5) : "";
    // 加载广告图 
    var advertImage = '/img/img/showPasswordBg.jpg';
    var advertInfo = app.getAdvertInfo(4);
    if(advertInfo){
      advertImage = advertInfo.images;
    }
    this.setData({
      audioContext: audioContext,
      advertImage: advertImage,
      password0: pwd0,
      password1: pwd1,
      password2: pwd2,
      password3: pwd3,
      password4: pwd4,
      password5: pwd5,
      responseInfo: responseInfo,
      pwd: pwd,
      tradeId: tradeId,
      deviceNo: deviceNo,
      chargerId: chargerId,
      faultTorefund: faultTorefund
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
    app.endOperate(this);
    //语音提示，输入密码
    this.onPlayVoice();
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
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    if(!that.data.audioContext){
      let audioContext = wx.createInnerAudioContext();
      that.setData({
        audioContext: audioContext
      })
    }
    that.data.audioContext.autoplay = true;
    that.data.audioContext.src = "/img/voice/getpassword.mp3";
    that.data.audioContext.onPlay(() => { });
    that.data.audioContext.onError((res) => { });
  },
  /**
   * 用户点击底边的故障上报
   */
  faultOption: function (e) {
    wx.navigateTo({
      url: '/pages/faultOption/faultOption'
    });
  },
  /**
   * 广告图片点击
   */
  clickAdvertInfo: function () {
    app.clickAdvertInfo(3, this.data.chargerId);
  }
})