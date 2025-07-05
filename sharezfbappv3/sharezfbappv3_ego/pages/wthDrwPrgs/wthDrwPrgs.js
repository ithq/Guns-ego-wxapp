// /pages/wthDrwPrgs/wthDrwPrgs.js
//我的订单页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    responseInfo: null,
    serveiceTelNo: app.glbParam.serveiceTelNo,
    recordId:null,
    withdrawAmt:null
  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);
    this.setData({
      recordId: query.recordId
    })

  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    this.handlePrgs();

  },
  //单笔流水处理进度
  handlePrgs(e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var custNo = app.glbParam.custNo;
    var recordId = that.data.recordId;
    var keyCode = cmmn.getKeyCode([custNo, recordId], app.glbParam.authCode)
    utls.wxRequset("zfb", "getWithdrawalProcessInfo", {
      custNo: custNo,
      recordId: recordId,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (success) {
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo.withdrawProgress;
      var withdrawAmt = utls.toMoney(responseInfo.withdrawAmt);
      that.setData({
        responseInfo: responseInfo,
        withdrawAmt: withdrawAmt
      });
    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  },
  //客服电话
  callService: function () {
    var telNo = this.data.serveiceTelNo;
    my.makePhoneCall({
      number: telNo,
      success: function () {
      },
      fail: function () {
      }
    })
  }
  

});