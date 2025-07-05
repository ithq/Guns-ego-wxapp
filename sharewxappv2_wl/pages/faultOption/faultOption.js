// pages/faultOption/faultOption.js
// 上报异常选择页面
const cmmn = require('../../utls/cmmn.js')
const utls = require('../../utls/utls.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    replacePassWdHid: true,
    replacePassWdText: "如果输入密码无法开机,请点击此按钮,更换新的密码",
    replaceDeviceText: "如果设备出现故障,请联系客房服务,更换新的设备。请点击此按钮，重新扫描设备二维码,即可使用",
    faultReportText: "如果设备无法使用,请点击此按钮上报故障", //,自动退款(5分钟内有效)
    tradeId: "",
    deviceNo: "",
    chargerId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo');
    var chargerId = "";
    var deviceNo = "";
    var tradeId = "";
    var replacePassWdHid = that.data.replacePassWdHid;
    if (responseInfo != null && responseInfo != undefined
      && responseInfo.map != null && responseInfo.map != undefined) {
      chargerId = responseInfo.map.chargerId;
      deviceNo = responseInfo.map.deviceNo;
      tradeId = responseInfo.map.tradeId;
    }
    // 只有万能版展示更新密码
    var pwdType = responseInfo.pwdType;
    if (pwdType == '1004'){
      replacePassWdHid = false;
    }
    that.setData({
      chargerId: chargerId,
      deviceNo: deviceNo,
      tradeId: tradeId,
      replacePassWdHid: replacePassWdHid
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
    var that = this;
    app.endOperate(that);
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
   * 密码无法开机，更新密码
   */
  replacePassWd: function(e){
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
          wx.navigateTo({
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          wx.navigateTo({
            url: '/pages/cntuAndFnsh/cntuAndFnsh'
          })
        } else if (pageIndex === 'ReadyToRecharge') {
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
          wx.navigateTo({
            url: '/pages/rdyToRchg/rdyToRchg'
          })
        } else {
          app.finishOperation(that);
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
   * 设备故障更换设备
   */
  replaceDevice: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.scanCode({
      success: (res) => {
        that.handleEwmUrl(that, res.result);
      },
      complete: (res) => {
        app.endOperate(that);
      }
    })
  },

  //处理微信扫一扫后得到的二维码结果..
  handleEwmUrl: function (obj, ewmUrlContext) {
    var that = obj;
    var schargerId = app.getChargerIdByScanResult(ewmUrlContext);//扫描的充电器号  
    //处理扫码服务..
    that.scanDeviceForTrade(obj, schargerId, null);
  },
  /**
   * 处理扫码服务..
   * isPay:确定是否从聚合支付界面过来..
   */
  scanDeviceForTrade: function (obj, scanResult, confirmFun) {
    //得到扫码结果，请求服务器
    var that = this;
    var tradeId = that.data.tradeId;
    var chargerId = that.data.chargerId;
    var deviceNo = that.data.deviceNo;
    var keycode = cmmn.getKeyCode([scanResult, tradeId, chargerId, deviceNo], app.glbParam.code)
    utls.wxRequset("wxapp", "scanDeviceForTrade", {
      scanResult: scanResult,
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      tradeId: tradeId,
      chargerId: chargerId,
      deviceNo, deviceNo,
      currLatitude: app.glbParam.currLatitude,
      currLongitude: app.glbParam.currLongitude
    }, function (rs) {
      if (rs.data.responseInfo) {
        //成功,返回设备租借的信息，加到缓存
        try {
          wx.setStorageSync('responseInfo', rs.data.responseInfo);
        } catch (e) {
          try {
            wx.setStorageSync('responseInfo', rs.data.responseInfo);
          } catch (e) {
          }
        }

        var pageIndex = rs.data.responseInfo.pageIndex; //ContinueAndFinishedPage
        if (pageIndex === 'MyRechargerPage') {
          //跳转到我要充电的界面
          wx.navigateTo({
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          wx.navigateTo({
            url: '/pages/cntuAndFnsh/cntuAndFnsh'
          })
        } else if (pageIndex === 'ReadyToRecharge') {
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
          wx.navigateTo({
            url: '/pages/rdyToRchg/rdyToRchg'
          })
        } else {
          app.endOperate(that);
          utls.altDialog('提示', '处理二维码信息异常，请确定扫码正确!', '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        }

      } else {
        app.endOperate(that);
        if (rs.data.result == 'error') {
          utls.altDialog('提示', rs.data.message, '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        } else {
          utls.altDialog('提示', '系统异常，请确认扫码正确，重新尝试!', '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        }
      }
    },
      function (msg) {
        app.endOperate(that);
        utls.altDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', function () {
          if (confirmFun) {
            confirmFun();
          }
        })
        //失败
        app.endOperate(that);
      },
      function (msg) {
        //完成
      })
  },

   /**
   * 设备无法使用，跳转到上报故障，5分钟内退款
   */
  faultReport: function (e) {
    wx.redirectTo({
      url: '../faultReport/faultReport'
    })
  }
})