// /pages/rdyToRchg/rdyToRchg.js
//充电密码页面
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
    //加载显示密码
    that.loadPassword();

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
      chargerId: chargerId
    });

  },

  

});