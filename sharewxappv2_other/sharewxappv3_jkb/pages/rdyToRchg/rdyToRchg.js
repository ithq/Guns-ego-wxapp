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
    chargerId: '',
    password0: "",
    password1: "",
    password2: "",
    password3: "",
    password4: "",
    password5: "",
    // 故障上报开关
    showFaultTorefund: false,
    // 更新密码开关
    showReplacePwd: false
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
    var showFaultTorefund = false;
    if (responseInfo && responseInfo.config){
      showFaultTorefund = responseInfo.config.faultTorefund;
    }
    // 只有万能版展示更新密码
    var showReplacePwd = false;
    var pwdType = responseInfo.pwdType;
    if (pwdType == '1004' || pwdType == '1006' || pwdType == '1007' || pwdType == '1008') {
      showReplacePwd = true;
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
      showFaultTorefund: showFaultTorefund,
      showReplacePwd: showReplacePwd
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
   * 密码无法开机，更新密码
   */
  replacePwd: function(e){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    var formId = e.detail.formId; //用于发消息模板
    //保存formId
    app.saveFormId(formId);
    
    var chargerId = that.data.chargerId;
    var deviceNo = this.data.deviceNo;
    var tradeId = that.data.tradeId;
    var params = [deviceNo, chargerId, tradeId];
    var keycode = cmmn.getKeyCode(params, app.glbParam.code);
    utls.wxRequsetForPost("wxapp", "replacePassWd", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      chargerId: chargerId,
      deviceNo, deviceNo,
      tradeId: tradeId,
      currLatitude: app.glbParam.currLatitude,
      currLongitude: app.glbParam.currLongitude
    }, function (rs) {
      if (rs.data.responseInfo) {
        var pageIndex = rs.data.responseInfo.pageIndex; //ContinueAndFinishedPage
        if (pageIndex === 'MyRechargerPage') {
          //跳转到我要充电的界面
          wx.redirectTo({
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          wx.redirectTo({
            url: '/pages/cntuAndFnsh/cntuAndFnsh'
          })
        } else if (pageIndex === 'ReadyToRecharge' || pageIndex === 'ReadyToBleRecharge') {
          //生成跳转到密码界面的参数对应...
          var responseInfo = rs.data.responseInfo;
          responseInfo.map = {};
          responseInfo.map.chargerId = that.data.chargerId;
          responseInfo.map.deviceNo = that.data.deviceNo;
          responseInfo.map.tradeId = that.data.tradeId;
          responseInfo.map.password = responseInfo.pwd;
          try {
            wx.setStorageSync('responseInfo', responseInfo);
          } catch (e) {
            try {
              wx.setStorageSync('responseInfo', responseInfo);
            } catch (e) {
            }
          }
          //跳转到输入密码界面...
          wx.redirectTo({
            url: '/pages/rdyToRchg/rdyToRchg'
          })
        } else {
          app.endOperate(that);
          utls.altDialog('提示', '处理二维码信息异常，请确定扫码正确!', '确定', null);
        }
      }else{
        app.endOperate(that);
        if (rs.data.result == 'error') {
          utls.altDialog('提示', rs.data.message, '确定', null);
        }else{
          utls.altDialog('提示', '系统异常，请重新尝试!', '确定', null);
        }
      }
    }, function (error) { }, function (complete) {
      //取消重复点击开始=============
      app.endOperate(that);
      //取消重复点击结束=============
    })

  },
  /**
   * 广告图片点击
   */
  clickAdvertInfo: function () {
    app.clickAdvertInfo(3, this.data.chargerId);
  }
})