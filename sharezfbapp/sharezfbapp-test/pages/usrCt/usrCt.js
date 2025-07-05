// /pages/usrCt/usrCt.js
//个人中心
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data: {
    nickName:'',
    custNo:''
  },
  onLoad(query){
    //返回首页按钮
    app.homeBtnOnBind(this);
  },

  onShow(){
    var that = this;
    app.endOperate(that);
    //加载个人头像，昵称
    that.loadBaseUserInfo();
    //加载个人中心信息
    that.usrCt();
    //获取未读消息条数
    that.getMessageCount();
  },

  /**加载个人头像，昵称 */
  loadBaseUserInfo(){
    this.setData({
      avatarUrl:app.glbParam.custInfoModel.headImgUrl,
      nickName:app.glbParam.custInfoModel.nickName,
      custNo:app.glbParam.custInfoModel.custNo
    })

  },
  /**获取未读消息条数 */
  getMessageCount(){
    var that = this;
    utls.wxRequset("zfb", "getMyMessageCoutInfo", {
     custNo:app.glbParam.custNo,
      id: ''
    }, function (success) {
      var unRd = success.data.unRead;
      if (unRd >= 1) {
        that.setData({
          unRd: unRd
        })
      }
    });

  },
  /**加载个人中心信息 */
  usrCt(){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    utls.wxRequset("zfb", "getUserCenterInfo", {
      custNo: app.glbParam.custNo
    }, function (success) {
      var message = success.data.message;
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', message, '确定', null)
        return;
      } else {
        var responseInfo = success.data.responseInfo;
        var currentBalance = responseInfo.availableBalance;
        var frozenBalance = responseInfo.frozenBalance;
        var ordersCnt = responseInfo.orderCount;
        that.setData({
          responseInfo: responseInfo,
          currentBalance: currentBalance,
          frozenBalance: frozenBalance,
          ordersCnt: ordersCnt
        });
        app.endOperate(that);
      }
    }, function (msg) {
      app.endOperate(that);
    }, function (msg) {
    })

  },

  //点击我的钱包
  wallet(event){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    my.navigateTo({
      url: '/pages/myWlt/myWlt'
    });

  },
  //点击我的订单
  orders(event){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    my.navigateTo({
      url: '/pages/myOrds/myOrds'
    });

  },
  //点击我的消息
  messages(event){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    my.navigateTo({
      url: '/pages/myMsg/myMsg'
    });
  }

  
});