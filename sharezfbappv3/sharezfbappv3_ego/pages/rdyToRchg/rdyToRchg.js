// /pages/rdyToRchg/rdyToRchg.js
//充电密码页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    audioContext: null, // 音频播放
    advertImage: '', //广告图片
    password0: null,
    password1: null,
    password2: null,
    password3: null,
    password4: null,
    password5: null,
    responseInfo: null,
    pwd: null,
    tradeId: null,
    deviceNo: null,
    chargerId: null,
    showFaultTorefund: null,
    showReplacePwd: null,
  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);
    // 创建前景音上下文对象
    if(my.createInnerAudioContext){
      this.setData({
        audioContext: my.createInnerAudioContext() 
      })
    }
  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //加载显示密码
    that.loadPassword();
    // 加载广告图 
    var advertImage = '/assets/img/showPasswordBg.jpg';
    var advertInfo = app.getAdvertInfo(4);
    if(advertInfo){
      advertImage = advertInfo.images;
    }
    that.setData({
      advertImage: advertImage
    })
    //语音提示，输入密码
    that.onPlayVoice();
  },
  onUnload() {
    // 页面被关闭
    var that = this;
    // 2.把语音停止播放
    that.data.audioContext.pause();
  },
  /**加载显示密码 */
  loadPassword(){
    //取缓存数据
    var response = my.getStorageSync({ key: 'responseInfo' });
    var responseInfo = response.data;
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
    if (pwdType == '1004' || pwdType == '1006' || pwdType == '1007') {
      showReplacePwd = true;
    }
    var pwd0 = (pwd > 0) ? pwd.charAt(0) : "";
    var pwd1 = (pwd > 1) ? pwd.charAt(1) : "";
    var pwd2 = (pwd > 2) ? pwd.charAt(2) : "";
    var pwd3 = (pwd > 3) ? pwd.charAt(3) : "";
    var pwd4 = (pwd > 4) ? pwd.charAt(4) : "";
    var pwd5 = (pwd > 5) ? pwd.charAt(5) : "";
    this.setData({
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
      showReplacePwd: showReplacePwd,
    });

  },

  /**
   * 广告图片点击
   */
  clickAdvertImage(e){
    app.clickAdvertInfo(4, this.data.chargerId);
  },
  /**
   * 更新密码
   */
  replacePwd(e){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    //防重复点击结束=============

    
    // 提交更新密码
    var chargerId = that.data.chargerId;
    var deviceNo = this.data.deviceNo;
    var tradeId = that.data.tradeId;
    var keyCode = cmmn.getKeyCode([deviceNo, chargerId, tradeId], app.glbParam.authCode);
    utls.wxRequsetForPost("zfb", "replacePassWd", {
      custNo: app.glbParam.custNo,
      chargerId: chargerId,
      deviceNo, deviceNo,
      tradeId: tradeId,
      currLatitude: app.glbParam.currLatitude,
      currLongitude: app.glbParam.currLongitude,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (rs) {
      if (rs.data.result == "success") {
        var pageIndex = rs.data.responseInfo.pageIndex; //ContinueAndFinishedPage
        if (pageIndex === 'MyRechargerPage') {
          //跳转到我要充电的界面
          my.redirectTo({
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          my.redirectTo({
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
            my.setStorageSync({
              key: 'responseInfo',
              data: rs.data.responseInfo
            });
          } catch (e) {
            try {
              my.setStorageSync({
                key: 'responseInfo',
                data: rs.data.responseInfo
              });
            } catch (e) {
            }
          }
          //跳转到输入密码界面...
          my.redirectTo({
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
   * 一进入时进行语音播报
   */
  onPlayVoice: function () {
    var that = this;
    if(!that.data.audioContext){
      this.setData({
        audioContext: my.createInnerAudioContext() 
      })
    }
    that.data.audioContext.autoplay = true;
    // 这里要用优酷的src="/img/voice/getpassword.mp3"
    that.data.audioContext.src = "XNDc3MjE5ODE4NA==";
    that.data.audioContext.onPlay(() => { });
    that.data.audioContext.onError((res) => { });
  },
  /**
   * 故障上报
   */
  faultOption(e){
    my.redirectTo({
      url: '/pages/faultOption/faultOption'
    })
  }

});