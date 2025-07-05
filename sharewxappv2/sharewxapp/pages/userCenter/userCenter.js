// pages/person/index.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo:null,
    dbOperationFlag:true,
    headImgUrl: null,
    nickName:"",
    unRead:0,
    custNo:"",
    availableBalance:0,
    frozenBalance:0,
    orderCount: 0,
    resourceUrl: app.globalData.resourceUrl,
    msgCount:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var useRefused = options.useRefused;
    if (!app.isHaveLogin(false) && !app.globalData.credentialsForGetUserInfo && useRefused != 'TRUE') {
      wx.navigateTo({
        url: '/pages/skip/skip'
      })
      return;
    }
    //返回首页
    app.bindHomePageButton(this,"../../index/index");
    // 
    var headerurl = app.globalData.userInfo.avatarUrl;
    var nickName=app.globalData.userInfo.nickName;
    this.setData({
      headImgUrl: headerurl,
      nickName: nickName,
      custNo: app.globalData.custNo
    });
  },
  //获取未读消息条数,如果有未读消息显示红点
  unreadMessageCount: function () {
    var that = this;
    var keycode = common.getKeyCode([], app.globalData.code)
    if (app.globalData.session_3rd == null || app.globalData.session_3rd == undefined) {
      return;
    }
    util.shareRequest("wxapp", "getMyMessageCoutInfo", {
      session3rd: app.globalData.session_3rd,
      keycode: keycode,
      id: ''
    }, function (success) {
      //成功
      var unRead = success.data.unRead;
      if (unRead >= 1) {
        that.setData({
          msgFlag: true,
          unRead: success.data.unRead
        })
      }
    }, function (fail) {
    }, function (complete) { });
  },
  // 我的钱包
  myWallet: function () {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============

    try {
      //保存formId
      app.saveFormId(e.detail.formId);

    } catch (e) {      
    }

    var url = '../myWallet/myWallet?custNo=' + app.globalData.custNo + "&withdrawalType=1&availableBalance=" + this.data.availableBalance + "&frozenBalance=" + this.data.frozenBalance;
    wx.navigateTo({
      url: url
    });
  }, 
  //我的订单
  myOrders: function (e) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    try {
      //保存formId
      app.saveFormId(e.detail.formId);

    } catch (e) {      
    }

    wx.navigateTo({
      url: '../myOrders/myOrders?custNo=' + app.globalData.custNo
    })
  },

  //进提现
  withdraw: function (e) {
    var that=this;
      //防重复点击开始=============
      if (!app.startOperation(that, "加载...")) {
        return;
      }
      //防重复点击结束=============
      try {
        //保存formId
        app.saveFormId(e.detail.formId);

      } catch (e) { }


      wx.navigateTo({
        url: '../withdrawal/withdrawal',
      })
  },
  //提现明细
  showCashHistory: function (e) {
    var that=this;
      //防重复点击开始=============
      if (!app.startOperation(that, "加载...")) {
        return;
      }

      try {
        //保存formId
        app.saveFormId(e.detail.formId);
      } catch (e) { }

      wx.navigateTo({
        url: '../withdrawalHistory/withdrawalHistory?custNo=' + app.globalData.custNo
      })
  },
  //我的消息
  myMessages:function(e){
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }

    try {
      //保存formId
      app.saveFormId(e.detail.formId);

    } catch (e) {      
    }

    wx.navigateTo({
      url: '../myMessage/myMessage',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
	  var that=this;
    app.finishOperation(that);
    this.waitLoginThenToDo(10);
  },
  /**
   * 登录完后，去查询用户对应的相关数据
   */
  waitLoginThenToDo: function (times) {
    var that = this;
    //1循环等待登录
    if (!app.isHaveLogin(false) && !app.globalData.credentialsForGetUserInfo) {
    	wx.navigateTo({
  	      url: '/pages/skip/skip?jumpFromUserCenterFlag=YES'
  	  })
  	  return;
    }  
    
    if (!app.isHaveLogin(false) && times>0) {
	    //延时1s在试o
	    setTimeout(function () {
	      that.waitLoginToDo(times)
	    }, 500);
	    times = times -1;
	    return;
    }
   //2登陆完进入个人中心，处理个人中心相关业务
    that.unreadMessageCount();
    that.userCenter();
  },


// 个人中心 未处理登录
  userCenter: function (event) {
    var that = this;    
    if (!app.startOperation(that, "加载...")) {
      return;
    }    
    var keycode = common.getKeyCode([], app.globalData.code)
    util.shareRequest("wxapp","getUserCenterInfo",{ //"userCenter.htm", {
          session3rd: app.globalData.session_3rd,
          keyCode: keycode
        },function (rs) {
          // 成功
          var message = rs.data.message;
          if (rs.data.result === 'error') {
            app.finishOperation(that);
            util.alterDialog('提示', message, '确定', null)
            return;
          } else {
            var responseInfo = rs.data.responseInfo;
            var availableBalance = responseInfo.availableBalance;
            var orderCount = responseInfo.orderCount;
            var frozenBalance = responseInfo.frozenBalance;
            that.setData({
              responseInfo: responseInfo,
              availableBalance: availableBalance,
              frozenBalance: frozenBalance,
              orderCount: orderCount
            });
            app.finishOperation(that);
          }
      }, function (msg) {   
        app.finishOperation(that);     
       }, function (msg) {
        //
       })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

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
  onShareAppMessage: function () {}
})