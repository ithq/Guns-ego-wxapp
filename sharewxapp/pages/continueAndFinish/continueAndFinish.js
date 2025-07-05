// pages/index/index.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    haveUsedSeconds: "0",
    haveUsedSecondsTxt: "0 秒",
    useAmount: "0",
    shareTradeInfoModel: null,
    shareDeviceInfoModelForTrade: null,
    resourceUrl: app.globalData.resourceUrl,
    pwd:" ",
    responseInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //1.绑定首页按钮
    app.bindHomePageButton(this, "../../index/index");
    //2.从缓存取服务端面返回的数据
    var responseInfoTmp = wx.getStorageSync('responseInfo')
    var haveUsedSecondsTmp =0;
    if (responseInfoTmp != null && responseInfoTmp != undefined && responseInfoTmp != ""){
      haveUsedSecondsTmp = responseInfoTmp.haveUsedSeconds;
    } 
    var useAmountTmp ="0";
    if (responseInfoTmp != null && responseInfoTmp != undefined && responseInfoTmp != "") {
      useAmountTmp = responseInfoTmp.useAmount;
    } 
    var shareTradeInfoModelTmp =  null;
    if (responseInfoTmp != null && responseInfoTmp != undefined && responseInfoTmp != "") {
      shareTradeInfoModelTmp = responseInfoTmp.shareTradeInfoModel;
    } 
    var shareDeviceInfoModelForTradeTmp = null;
    if (responseInfoTmp != null && responseInfoTmp != undefined && responseInfoTmp != "") {
      shareDeviceInfoModelForTradeTmp = responseInfoTmp.shareDeviceInfoModelForTrade;
    }
    var pwdTmp =  "";
    if (responseInfoTmp != null && responseInfoTmp != undefined && responseInfoTmp != "") {
      pwdTmp = responseInfoTmp.pwd;
    }
    this.setData({
      haveUsedSeconds: haveUsedSecondsTmp,
      useAmount: useAmountTmp,
      shareTradeInfoModel: shareTradeInfoModelTmp,
      shareDeviceInfoModelForTrade: shareDeviceInfoModelForTradeTmp,
      pwd: pwdTmp,
      responseInfo: responseInfoTmp
    });
  },
  /**
   *继续使用充电
   */
  continueReCharge:function(e){
    var that = this;
    //0. 防重复点..
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    //1. 保存fromId
    try {
        // 保存formId
        app.saveFormId(e.detail.formId);

    } catch (e) { 

    }
    //2. 生成跳转到密码界面的参数对应...
    var responseInfo = that.data.responseInfo;
    responseInfo.map={};
    responseInfo.map.chargerId = this.data.shareTradeInfoModel.chargerId;
    responseInfo.map.deviceNo = this.data.shareTradeInfoModel.deviceNo;
    responseInfo.map.tradeId = this.data.shareTradeInfoModel.id;
    responseInfo.map.password=this.data.pwd;
    try {
      wx.setStorageSync('responseInfo', responseInfo);
    } catch (e) {
      try {
        wx.setStorageSync('responseInfo', responseInfo);
      } catch (e) {
      }
    }
    //3. 跳转到密码界面...
    wx.redirectTo({
      url: '../readyToRecharge/readyToRecharge'
    })
  },
  /**
   * 读对充电时间读秒
   */
  readSecondForRecharge(){
    var totalSeconds=parseInt(this.data.haveUsedSeconds)+1;
    var seconds=totalSeconds;
    var hours = parseInt(seconds/3600);
    seconds=Math.round(seconds%3600);
    var minutes = parseInt(seconds/60);
    seconds = Math.round(seconds%60);
    var txtForTime = hours + " 小时 " + minutes + " 分 " + seconds+" 秒";
    this.setData({
      haveUsedSeconds: totalSeconds,
      haveUsedSecondsTxt: txtForTime
    })
  },
  /**
   * 结束使用
   */
  overReCharge:function(e){
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    var formId = e.detail.formId; //用于发消息模板
    //保存formId
    app.saveFormId(formId);

    var responseInfo = that.data.responseInfo;
    var chargerId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.chargerId != null) ? responseInfo.shareTradeInfoModel.chargerId:"";
    var custNo = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.custId != null) ? responseInfo.shareTradeInfoModel.custId:"";
    var tradeId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.id != null) ? responseInfo.shareTradeInfoModel.id : "";
    var params = [chargerId, custNo, tradeId];
    var keycode = common.getKeyCode(params, app.globalData.code);
    util.shareRequestPost("wxapp", "finishRecharge", {
      session3rd: app.globalData.session_3rd,
      keyCode: keycode,
      chargerId: chargerId,
      custNo, custNo,
      tradeId: tradeId
    },function(success){
        if (success.data.result == "error"){
          util.alterDialog('提示', success.data.message, '确定', null);
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
          url: '../finishRecharge/finishRecharge'
        })
      
    },function(error){},function(complete){
      //取消重复点击开始=============
      app.finishOperation(that);
      //取消重复点击结束=============
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
    app.finishOperation(this);
    //处理充电时长读秒
    setInterval(this.readSecondForRecharge,1000)
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