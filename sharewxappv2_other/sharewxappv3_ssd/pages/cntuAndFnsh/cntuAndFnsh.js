// /pages/cntuAndFnsh/cntuAndFnsh
//继续使用或结束使用页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    advertImage: '',
    userHaveUsedTimeForSecondTxt:'', //用户已使用时间长
    haveUsedSeconds: "0",
    yfjAmount:'',  //预付费
    currentUseAmt:'', //当前消费
    shareTradeInfoModel: null,
    responseInfo: null,
    pwd: " ",
    custNo: '',
    shareDeviceInfoModelForTrade: null,
    doubleOperateFlag: true,//处理重复提交
    nextPageIndex: '', // 继续充电跳转界面
    needBluetooth: false, //是否必须开启蓝牙
    bleCode: '', //是否已开启蓝牙
    bleName: '', //蓝牙名称
    closeOrderFlag: false, //是否显示结束使用，true为显示
    readSecondTimer: null //读秒计时器
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
    //拿到当前消费的数据
    var yfjAmount = 0;
    var responseInfo = wx.getStorageSync('responseInfo')
    var haveUsedSecondsTmp = 0;
    if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
      haveUsedSecondsTmp = responseInfo.haveUsedSeconds;
    }
    var useAmountTmp = "0";
    if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
      useAmountTmp = responseInfo.useAmount;
    }
    var shareTradeInfoModelTmp = null;
    if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
      shareTradeInfoModelTmp = responseInfo.shareTradeInfoModel;
    }
    if (shareTradeInfoModelTmp != undefined && shareTradeInfoModelTmp != null){
      yfjAmount = shareTradeInfoModelTmp.yfjAmount;
    }
    var shareDeviceInfoModelForTradeTmp = null;
    if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
      shareDeviceInfoModelForTradeTmp = responseInfo.shareDeviceInfoModelForTrade;
    }
    var pwdTmp = "";
    if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
      pwdTmp = responseInfo.pwd;
    }
    var custNo = '';
    if (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.custId != null){
      custNo = responseInfo.shareTradeInfoModel.custId;
    }
    var nextPageIndex = '';
    var needBluetooth = false;
    var bleCode = '';
    var bleName = '';
    if (responseInfo){
      nextPageIndex = responseInfo.nextPageIndex;
      needBluetooth = responseInfo.needBluetooth ? true:false;
      bleCode = responseInfo.bleCode || '';
      bleName = responseInfo.bleName || '';
    }
    var closeOrderFlag = false;
    if (responseInfo && (responseInfo.pwdType == 1003 || responseInfo.pwdType == 1007 || responseInfo.pwdType == 1008)){
      // 预付款类型，直接显示结束订单
      closeOrderFlag = true;
    }else if(responseInfo && responseInfo.config){
      // 其他按配置，是否显示结束订单
      closeOrderFlag = responseInfo.config.closeOrderFlag || false;
    }
    // 加载广告图 
    var advertImage = '/img/img/showPasswordBg.jpg';
    var advertInfo = app.getAdvertInfo(6);
    if(advertInfo){
      advertImage = advertInfo.images;
    }
    this.setData({
      pwd:pwdTmp,
      nextPageIndex: nextPageIndex,
      currentUseAmt: useAmountTmp,
      shareDeviceInfoModelForTrade: shareDeviceInfoModelForTradeTmp,
      yfjAmount: yfjAmount,
      haveUsedSeconds: haveUsedSecondsTmp,
      shareTradeInfoModel: shareTradeInfoModelTmp,
      responseInfo: responseInfo,
      custNo: custNo,
      needBluetooth: needBluetooth,
      bleCode: bleCode,
      bleName: bleName,
      closeOrderFlag: closeOrderFlag,
      advertImage: advertImage
    });
    //处理充电时长读秒
    this.setData({
      readSecondTimer: setInterval(this.readSecondForRecharge, 1000)
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
    app.endOperate(this);
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
    // 清除充电时长读秒
    clearInterval(this.data.readSecondTimer);
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
  * 结束充电
  */
  overUsing: function (event) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var responseInfo = that.data.responseInfo;
    var chargerId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.chargerId != null) ? responseInfo.shareTradeInfoModel.chargerId : "";
    var custNo = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.custId != null) ? responseInfo.shareTradeInfoModel.custId : "";
    var tradeId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.id != null) ? responseInfo.shareTradeInfoModel.id : "";
    var params = [chargerId, custNo, tradeId];
    var keycode = cmmn.getKeyCode(params, app.glbParam.code);
    utls.wxRequsetForPost("wxapp", "finishRecharge", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      chargerId: chargerId,
      custNo: custNo,
      tradeId: tradeId
    }, function (success) {
      if (success.data.result == "error") {
        utls.altDialog('提示', success.data.message, '确定', null);
        return;
      }
      //返回数据放缓存
      try {
        wx.setStorageSync('responseInfo', success.data.responseInfo)
      } catch (e) {
        try {
          wx.setStorageSync('responseInfo', success.data.responseInfo)
        } catch (e) {
        }
      }
      wx.redirectTo({
        url: '../fnhRchg/fnhRchg'
      })

    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  },

  /**
   *继续使用
   */
  continueUsing: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    //密码
    var responseInfo = that.data.responseInfo;
    responseInfo.map = {};
    responseInfo.map.tradeId = this.data.shareTradeInfoModel.id;
    responseInfo.map.deviceNo = this.data.shareTradeInfoModel.deviceNo;
    responseInfo.map.password = this.data.pwd;
    responseInfo.map.chargerId = this.data.shareTradeInfoModel.chargerId;
    responseInfo.map.custNo = this.data.custNo;

    responseInfo.map.needBluetooth = this.data.needBluetooth;
    responseInfo.map.bleCode = this.data.bleCode;
    responseInfo.map.bleName = this.data.bleName;
    try {
      wx.setStorageSync('responseInfo', responseInfo);
    } catch (e) {
      try {
        wx.setStorageSync('responseInfo', responseInfo);
      } catch (e) {
      }
    }
    //跳转到密码界面或蓝牙充电界面 
    if (that.data.nextPageIndex == 'ReadyToRecharge'){
      wx.redirectTo({
        url: '../rdyToRchg/rdyToRchg'
      })
    }else{
      wx.redirectTo({
        url: '../rdyToBleRchg/rdyToBleRchg'
      })
    }
  }
  , /**
   * 读对充电时间读秒
   */
  readSecondForRecharge() {
    var totalSeconds = parseInt(this.data.haveUsedSeconds) + 1;
    var seconds = totalSeconds;
    var hours = parseInt(seconds / 3600);
    seconds = Math.round(seconds % 3600);
    var minutes = parseInt(seconds / 60);
    seconds = Math.round(seconds % 60);
    var txtForTime = hours + " 小时 " + minutes + " 分 " + seconds + " 秒";
    this.setData({
      haveUsedSeconds: totalSeconds,
      userHaveUsedTimeForSecondTxt: txtForTime
    })
  },
  /**
   * 广告图片点击
   */
  clickAdvertInfo: function () {
    app.clickAdvertInfo(6, this.data.chargerId);
  }
})