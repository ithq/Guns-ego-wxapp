// pages/wthDrwl/wthDrwl.js
//提现页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    willTakeMoney: 0, //将提现的金额 
    canTakeMoney: 0, //能提现金额  
    totalBalance: 0,//余额总和
    withdrawalType: null,
    custNo: '',
    doubleOperateFlag:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //绑定返回地图小按键
    app.HomeBtnOnBind(that, "../../index/index");
    var withdrawalType = options.withdrawalType;
    var custNo = options.custNo;
    var canTakeMoney = options.availableBalance;

    if (canTakeMoney == undefined || canTakeMoney == null || canTakeMoney == 'undefined'){
      canTakeMoney = 0;
    }
    if (withdrawalType == 1) {//账户余额
      that.setData({
        withdrawalType: withdrawalType,
        custNo: custNo,
        canTakeMoney: canTakeMoney
      })
    }


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
    app.endOperate(this);
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
  //输入提现费用
  setTakeAmount: function (num) {
    var that = this;
    var oldPayAmount = that.data.willTakeMoney;
    var willTakeMoney = that.data.willTakeMoney + num;
    var amount = parseFloat(willTakeMoney);
    //判断金额...
    if (amount > that.data.canTakeMoney) {
      utls.altDialog("提示", "输入金额不能大于可提现金额！", "确定",
        function (e) {
          that.setData({
            willTakeMoney: oldPayAmount
          })
        });
      return;
    }
    if (amount == 0) {
      utls.altDialog("提示", "输入金额不能为0元！", "确定",
        function (e) {
          that.setData({
            willTakeMoney: oldPayAmount
          })
        });
      return;
    }
    //设置交易金额..
    this.setData({ willTakeMoney: willTakeMoney });
  },
   /**
   * 输入1
   */
  bindtapNum1: function () {
    this.setTakeAmount("1");
  },
  /**
   * 输入2
   */
  bindtapNum2: function () {
    this.setTakeAmount("2");
  },
  /**
   * 输入3
   */
  bindtapNum3: function () {
    this.setTakeAmount("3");
  },
  /**
   * 输入4
   */
  bindtapNum4: function () {
    this.setTakeAmount("4");
  },
  /**
   * 输入5
   */
  bindtapNum5: function () {
    this.setTakeAmount("5");
  },
  /**
   * 输入6
   */
  bindtapNum6: function () {
    this.setTakeAmount("6");
  },
  /**
   * 输入7
   */
  bindtapNum7: function () {
    this.setTakeAmount("7");
  },
  /**
   * 输入8
   */
  bindtapNum8: function () {
    this.setTakeAmount("8");
  },
  /**
   * 输入9
   */
  bindtapNum9: function () {
    this.setTakeAmount("9");
  },
  /**
   * 输入0
   */
  bindtapNum0: function () {
    this.setTakeAmount("0");
  },
  /**
   * 删除
   */
  bindtapNumDel: function () {
    var that = this;
    var willTakeMoney = that.data.willTakeMoney.toString();
    var length = willTakeMoney.length;
    if (length > 0) {
      willTakeMoney = willTakeMoney.substr(0, length - 1);
      that.setData({ willTakeMoney: willTakeMoney });
    }
  },
  //点击全部提现，显示全部金额
  takeAllMoney: function () {
    var canTakeMoney = this.data.canTakeMoney;
    if (canTakeMoney <= 0) {
      utls.altDialog('提示', '没有可提现金额', '确定', null)
      return;
    } else {
      this.setData({
        willTakeMoney: canTakeMoney
      })
    }
  },
  //点击提现，执行提现操作
  takeMoney: function (e) {
    var that = this;
    var willTakeMoney = that.data.willTakeMoney
    if (willTakeMoney <= 0) {
      utls.altDialog('提示', '提现金额不能小于1元!', '确定', null)
      return;
    }
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    // 只能提现整数倍的余额
    if (!utls.isInteger(willTakeMoney)) {
      utls.altDialog('提示', '只能提现整数倍的金额!', '确定', null)
      app.endOperate(that);
      return;
    }
    var keycode = cmmn.getKeyCode([willTakeMoney], app.glbParam.code);
    utls.wxRequset("wxapp", "doWeiXinAppWithraw", {
      session3rd: app.glbParam.ssn_3rd,
      withdrawAmount: willTakeMoney,
      keycode: keycode
    }, function (success) {
      if (success.data.result == 'success') {
        utls.altDialog('提示', '提现申请成功!', '确定', that.wallet)
      } else {
        var msg = success.data.msg;
        if (msg == undefined) {
          msg = success.data.message;
        }
        utls.altDialog('提示', msg, '确定', null)
      }
    }, function (fail) { }, function (complete) {
      app.endOperate(that);
    })

  },
  wallet: function () {
    app.endOperate(this);
    wx.navigateTo({
      url: '/pages/myWlt/myWlt?custNo=' + this.data.custNo
    });
  }
})