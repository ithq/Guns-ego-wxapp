// /pages/myOrds/myOrds.js
//我的订单页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    nodatashowHide:false,
    responseFlah:true,
    isEmpty: false,
    items:[],
    totalCount: 6,
    totalCountStar: 0,
    onScrollLowerFlag: true, //分页标识
    heightToTop:app.glbParam.heightToTop, //用于分页固定高度。。
    orderStatus: 10, //订单状态：10进行中，12已完成
    currentBalance: 0,
  },
  onLoad(query){
    //绑定首页 
    app.homeBtnOnBind(this);
  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    // 是否需要登录
    if(app.glbParam.isAuth == -1){
      app.afterLogin().then(
        isAuth => {
            //已经授权过
          if(isAuth ==1){
            //我的订单列表
            that.ordersList(0, 5);
          }else{
            console.log("myOrds ....跳kp")
            //未注册用户跳到kp页面授权注册
            that.redirectPage();
          }
        }
      );
    } else{
      //我的订单列表 
      that.ordersList(0, 5, 10);
    }
  },

  /** 如果用户已经注册过，不用跳转页面，否则跳到注册页面*/
  redirectPage(){
    //如果发现用户未授权，跳转到kp/kp页面授权
    if(app.glbParam.isAuth == -1){
       my.reLaunch({
          url: '/pages/kp/kp?fromWhere=myOrds'
        });
    }else{
      //我的订单列表 
      that.ordersList(0, 5);
    }
  },
   //点击选择消息类型，1为进行中的订单，2为已完成的订单
  myOrderByOrderStatus(event){
    var that = this;
    var orderStatus = event.target.dataset.orderStatus;
    //清除原集合的数据
    that.setData({
      totalCount: 11,
      isEmpty: false,
      items:[],
      responseFlah: true,
      totalCountStar: 0,
      onScrollLowerFlag: true,
      loadingHidden: false,
      nodatashowHide: false,
      orderStatus: orderStatus
    })
    //获取订单信息
    that.ordersList(0, 10, orderStatus, orderStatus);

  },
  //分页
  onScrollLower: function (event) {
    var that = this;
    if (that.data.totalCountStar != that.data.totalCount && that.data.onScrollLowerFlag == true) {
      that.data.onScrollLowerFlag = false;
      if (that.data.responseFlah == true) {
        that.setData({
          loadingHidden: true
        });
        //分页获取记录
        that.ordersList(that.data.totalCount, 10, that.data.orderStatus);
      } else {
        return;
      }
    }
  },

  /** 我的订单列表 */
  ordersList: function (start, count, orderStatus) {
    var that = this;
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    var keyCode = cmmn.getKeyCode([app.glbParam.custNo, start, count, orderStatus], app.glbParam.authCode)
    utls.wxRequset("zfb", "getMyOrderWithPages", {
      custNo: app.glbParam.custNo,
      start: start,
      rows: count,
      status: orderStatus,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', rs.data.message, '确定', null)
        return;
      }

      var responseInfo = rs.data.myOrderRecordInfoBOs;
      //第一次进来
      if (start == 0) {
        if (responseInfo.length <= 0) {
          that.setData({
            nodatashowHide: true
          })
          return;
        }
        if (responseInfo.length < 5) {
          that.data.responseFlah = false;
        }
        that.setData({
          items: responseInfo
        })
        app.endOperate(that);
      } else {
        //分页进来
        app.endOperate(that);
        if (responseInfo == null) {
          that.setData({
            responseFlah: false,
            loadingHidden: false
          });
          return;
        }
        var tempList = [];
        if (!that.data.isEmpty) {
          tempList = that.data.items.concat(rs.data.myOrderRecordInfoBOs);
        } else {
          tempList = that.data.items;
          that.data.isEmpty = false;
        }
        that.data.items = tempList;
        that.setData({
          items: tempList,
          loadingHidden: false,
          totalCountStar: that.data.totalCount,
          totalCount: that.data.totalCount + 5,
          onScrollLowerFlag: true
        });
      }
    }, function (fail) {
      app.endOperate(that);
    }, function (complete) {
      app.endOperate(that);
      //
    })
  },
  /**获取用户信息 */
  getUserInfo(succFun){
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "加载中...")) {
      return;
    }
    var keyCode = cmmn.getKeyCode([app.glbParam.custNo], app.glbParam.authCode)
    utls.wxRequset("zfb", "getUserCenterInfo", {
      custNo: app.glbParam.custNo,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (success) {
      var message = success.data.message;
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', message, '确定', null)
        return;
      } else {
        var responseInfo = success.data.responseInfo;
        var currentBalance = responseInfo.availableBalance;
        that.setData({
          currentBalance: currentBalance
        });
        app.endOperate(that);
        succFun && succFun();
      }
    }, function (msg) {
      app.endOperate(that);
    }, function (msg) {
    })
  },
  // 支付订单
  payOrder(){
    utls.altDialog('友情提示', '请在支付宝的芝麻信用完成守约。');
    //getUserInfo();
  }

});