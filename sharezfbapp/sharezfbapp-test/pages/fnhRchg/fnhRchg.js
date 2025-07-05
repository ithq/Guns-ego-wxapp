// /pages/fnhRchg/fnhRchg.js
//我的订单页面
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
    //加载页面数据
    that.loadPageInfo();

  },
  /**加载页面数据 */
  loadPageInfo(){
     //取缓存数据
    var response = my.getStorageSync({ key: 'responseInfo' });
    var responseInfo = response.data;
    var yfjAmount = 0;
    var userHaveUsedTimeForSecond = 0;
    var currentUseAmt = 0;
    if (responseInfo != undefined && responseInfo != null && responseInfo != "") {
      currentUseAmt = responseInfo.amount;
      yfjAmount = responseInfo.yfj;
      userHaveUsedTimeForSecond = responseInfo.haveUseTimesForSecond;
    }
    var hours = parseInt(userHaveUsedTimeForSecond / 3600);
    userHaveUsedTimeForSecond = Math.round(userHaveUsedTimeForSecond % 3600);
    var minutes = parseInt(userHaveUsedTimeForSecond / 60);
    userHaveUsedTimeForSecond = Math.round(userHaveUsedTimeForSecond % 60);
    var userHaveUsedTimeForSecondTxt = "";
    if (hours > 0) {
      userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + hours + " 小时";
    }
    if (minutes > 0) {
      userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + minutes + " 分";
    }
    userHaveUsedTimeForSecondTxt = userHaveUsedTimeForSecondTxt + userHaveUsedTimeForSecond + " 秒";
    this.setData({
      responseInfo: responseInfo,
      currentUseAmt: currentUseAmt,
      userHaveUsedTimeForSecondTxt: userHaveUsedTimeForSecondTxt,
      yfjAmount: yfjAmount
    })


  },
  //去个人中心提现
  goToUsrCt(){
     var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
     my.redirectTo({
      url: '/pages/usrCt/usrCt'
    });
  }
  

});