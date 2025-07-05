// /pages/myWlt/myWlt.js
//我的钱包
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{

  },
  onLoad(query){
      //绑定首页
     app.homeBtnOnBind(this);

  },

  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //加载我的钱包基本信息
    that.walletInfo();
  },



  /** 加载我的钱包基本信息*/
  walletInfo(){
    var that = this;
    utls.wxRequset("zfb", "geMyWallet", {custNo:app.glbParam.custNo}, function (success) {
      if (success.data.result == 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo;
      //结果保存到缓存
      my.setStorageSync({
        key: 'custAccount',
        data: responseInfo
      });
      var frozenBalance = 0;
      var custNo = "";
      var currentBalance = 0;
      if (responseInfo != null && responseInfo != undefined && responseInfo != "") {
        frozenBalance = parseInt(responseInfo.frozenBalance);
        custNo = responseInfo.custNo;
        currentBalance = parseInt(responseInfo.availableBalance);
      }
      that.setData({
        responseInfo: responseInfo,
        custNo: custNo,
        currentBalance: currentBalance,
        frozenBalance: frozenBalance
      });
    }, function (fail) {
      app.endOperate(that);
    })

  },

  //点击提现
  takeMoney(event){
    //防重复点击开始=============
    if (!app.firstOperate(this, "加载中...")) {
      return;
    }
    my.navigateTo({
      url:  "/pages/wthDrwl/wthDrwl"
    });
  },

  //点击流水记录
  takeMoneyRecord(event){
    //防重复点击开始=============
    if (!app.firstOperate(this, "加载中...")) {
      return;
    }
    my.navigateTo({
      url:  "/pages/flwRcd/flwRcd"
    });
  }
 
});