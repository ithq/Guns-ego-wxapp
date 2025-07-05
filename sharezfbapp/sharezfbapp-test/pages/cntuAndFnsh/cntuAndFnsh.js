// /pages/cntuAndFnsh/cntuAndFnsh.js
//正在充电中页面，选择继续或结充电
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    userHaveUsedTimeForSecondTxt:'', //用户已使用时间长
    haveUsedSeconds: "0",
    yfjAmount:'',  //预付费
    currentUseAmt:'', //当前消费
    shareTradeInfoModel: null,
    responseInfo: null,
    pwd: " ",
    shareDeviceInfoModelForTrade: null,
    doubleOperateFlag:false,
    timer:null

  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);

  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //显示当前使用信息
    that.loadUsedInfo();
     //处理充电时长读秒
    var timer = setInterval(that.readSecondForRecharge.bind(that), 1000);
    that.data.timer = timer;


  },
   onUnload() {
    // 页面被关闭
    var that = this;
    clearInterval(that.data.timer);
  },
  /**显示当前使用信息 */
  loadUsedInfo(){
    //拿到当前消费的数据
    var yfjAmount = 0;
     //取缓存数据
    var response = my.getStorageSync({ key: 'responseInfo' });
    var responseInfo = response.data;

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

    this.setData({
      pwd:pwdTmp,
      currentUseAmt: useAmountTmp,
      shareDeviceInfoModelForTrade: shareDeviceInfoModelForTradeTmp,
      yfjAmount: yfjAmount,
      haveUsedSeconds: haveUsedSecondsTmp,
      shareTradeInfoModel: shareTradeInfoModelTmp,
      responseInfo: responseInfo
    });
  },

  //点击继续获取密码使用
  continueUsing(){
    var that = this;
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    //密码
    var responseInfo = that.data.responseInfo;
    responseInfo.map = {};
    responseInfo.map.tradeId = that.data.shareTradeInfoModel.id;
    responseInfo.map.deviceNo = that.data.shareTradeInfoModel.deviceNo;
    responseInfo.map.password = that.data.pwd;
    responseInfo.map.chargerId = that.data.shareTradeInfoModel.chargerId;
    
    //保存数据,返回设备租借的信息，加到缓存
    my.setStorageSync({
      key: 'responseInfo',
      data: responseInfo
    });
    //跳转到密码界面
    my.redirectTo({
      url: '/pages/rdyToRchg/rdyToRchg'
    })
  },
  //点击结束使用
  overUsing(){
     var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var responseInfo = that.data.responseInfo;
    var chargerId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.chargerId != null) ? responseInfo.shareTradeInfoModel.chargerId : "";
    var custNo = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.custId != null) ? responseInfo.shareTradeInfoModel.custId : "";
    var tradeId = (responseInfo != null && responseInfo.shareTradeInfoModel != null && responseInfo.shareTradeInfoModel.id != null) ? responseInfo.shareTradeInfoModel.id : "";
    utls.wxRequsetForPost("zfb", "finishRecharge", {
      chargerId: chargerId,
      custNo, custNo,
      tradeId: tradeId
    }, function (success) {
      if (success.data.result == "error") {
        utls.altDialog('提示', success.data.message, '确定', null);
        return;
      }
     
       //保存数据,返回设备租借的信息，加到缓存
      my.setStorageSync({
        key: 'responseInfo',
        data: success.data.responseInfo
      });
      my.redirectTo({
        url: '/pages/fnhRchg/fnhRchg'
      })

    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  
  },
    /**使用时长 */
   readSecondForRecharge:function(){
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
  }

});