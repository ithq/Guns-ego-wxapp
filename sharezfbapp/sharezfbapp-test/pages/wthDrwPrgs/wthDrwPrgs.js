// /pages/wthDrwPrgs/wthDrwPrgs.js
//我的订单页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    responseInfo: null,
    serveiceTelNo: app.glbParam.serveiceTelNo,
    recordId:null
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
    var recordId = that.data.recordId;
    utls.wxRequset("zfb", "getWithdrawalProcessInfo", {
      recordId: recordId
    }, function (success) {
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo.withdrawProgress;
      that.setData({
        responseInfo: responseInfo
      });
    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  }

  

});