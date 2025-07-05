// pages/usrCt/usrCt.js
//个人中心
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "", 
    nickName:"",
    custNo:"",
    currentBalance: 0, 
    ordersCnt: 0, 
    unRd: 0,
    doubleOperateFlag:false,
    responseInfo: null,
    frozenBalance: 0,
    msgCount: 0


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //如果用户未授权，则去跳转页面授权再回来
    var rfsGetUserInfo = options.rfsGetUserInfo;
    if (!app.isLogined(false) && !app.glbParam.credentForGetUsrInfo && rfsGetUserInfo != 'TRUE') {
      wx.navigateTo({
        url: '/pages/kp/kp?jumpFromUserCenter=true'
      })
      return;
    }
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
    //用户昵称
    var nickName = app.glbParam.currentUserInfo.nickName;
    //用户头像
    var avatarUrl = app.glbParam.currentUserInfo.avatarUrl;
    this.setData({
      avatarUrl: avatarUrl,
      nickName: nickName,
      custNo: app.glbParam.custNo
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
    that.afterLoginData(10); 
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
   * 获取登录后用户数据
   */
  afterLoginData: function (times) {
    var that = this;
    //递归登录
    if (!app.isLogined(false) && !app.glbParam.credentForGetUsrInfo) {
      wx.navigateTo({
        url: '/pages/kp/kp?jumpFromUserCenter=true'
      })
      return;
    }

    if (!app.isLogined(false) && times > 0) {
      //延时1s再调用此方法
      setTimeout(function () {
        that.afterLoginData(times)
      }, 500);
      times = times - 1;
      return;
    }
    //登陆成功后进入个人中心，处理个人中心相关业务
    that.getMessageCount();
    that.usrCt();
  },
  //得到未读消息条数
  getMessageCount: function () {
    var that = this;
    if (app.glbParam.ssn_3rd == null || app.glbParam.ssn_3rd == undefined) {
      return;
    }
    var keycode = cmmn.getKeyCode([], app.glbParam.code)
    utls.wxRequset("wxapp", "getMyMessageCoutInfo", {
      session3rd: app.glbParam.ssn_3rd,
      keycode: keycode,
      id: ''
    }, function (success) {
      var unRd = success.data.unRead;
      if (unRd >= 1) {
        that.setData({
          msgFlag: true,
          unRd: unRd
        })
      }
    }, function (fail) {
    }, function (complete) { });
  },
  // 个人中心
  usrCt: function (event) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var keycode = cmmn.getKeyCode([], app.glbParam.code)
    utls.wxRequset("wxapp", "getUserCenterInfo", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode
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
  // 钱包
  wallet: function () {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var url = '/pages/myWlt/myWlt?custNo=' + app.glbParam.custNo + "&withdrawalType=1&availableBalance=" + that.data.availableBalance + "&frozenBalance=" + that.data.frozenBalance;
    //去钱包页面
    wx.navigateTo({
      url: url
    });
  }
  ,
  //订单列表
  orders: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.navigateTo({
      url: '/pages/myOrds/myOrds?custNo=' + app.glbParam.custNo
    })
  },
  //消息列表
  messages: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.navigateTo({
      url: '/pages/myMsg/myMsg',
    })
  },
  // 帮助列表
  help: function(e){
    var phone = app.glbParam.serveiceTelNo;
    wx.showActionSheet({
      itemList: ['拨打客服电话', '常见问题'],
      success: function (res) {
        if (!res.cancel && res.tapIndex == 0) {//拨打客服电话
          wx.makePhoneCall({
            phoneNumber: phone,
            success: function () {
            },
            fail: function () {
            }
          })
        }
        if (res.tapIndex == 1) {//常见问题
          wx.navigateTo({
            url: '/pages/commentPro/commentPro'
          });
        }
      },
      fail: function (res) {
      }
    })
  }
})