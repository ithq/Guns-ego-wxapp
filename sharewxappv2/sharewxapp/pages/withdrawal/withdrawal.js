const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    resourceUrl: app.globalData.resourceUrl,
    withdrawalMoney: '', //将要提现的金额
    canWithdrawalMoney: 0, //可提现金额
    totalBalance:0,//余额总和
    withdrawalType:null,
    custNo:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.bindHomePageButton(this, "../index/index");
    var withdrawalType = options.withdrawalType;
    var custNo = options.custNo;
    var availableBalance = options.availableBalance;
    var that = this;
    //绑定返回首页
    if (withdrawalType == 1){//账户余额
      that.setData({
        withdrawalType:withdrawalType,
        custNo: custNo,
        canWithdrawalMoney: availableBalance
      })
    } 
  },
  //点击全部提现，显示全部金额
  allAmt: function () {  
    var availableBalance = this.data.canWithdrawalMoney;
    if (availableBalance <= 0) {
      util.alterDialog('提示', '没有可提现金额', '确定', null)
      return;
    } else {
      this.setData({
        withdrawalMoney: availableBalance
      })
    }
  },
  //点击提现，执行提现操作
  withdraw: function (e) {
    var that = this;
    var withdrawalMoney = that.data.withdrawalMoney
    if (withdrawalMoney <= 0) {
      util.alterDialog('提示', '提现金额不能小于1元!', '确定', null)
      return;
    }
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    try {
        // 保存formId
        app.saveFormId(e.detail.formId);

    } catch (e) { 
      
    }

   // 只能提现整数倍的余额
    if (!util.isInteger(withdrawalMoney)){
       util.alterDialog('提示', '只能提现整数倍的金额!', '确定',null)
       //取消重复点击开始=============
        app.finishOperation(that);
        //取消重复点击结束=============
       return;
    }
    var keycode = common.getKeyCode([withdrawalMoney], app.globalData.code);
    util.shareRequest("wxapp", "doWeiXinAppWithraw", {
      session3rd: app.globalData.session_3rd,
      withdrawAmount: withdrawalMoney,
      keycode: keycode
    }, function (success) {
      if (success.data.result == 'success') {
        util.alterDialog('提示', '提现申请成功!', '确定', that.myWallet)
      } else {
        var msg=success.data.msg;
        if (msg==undefined){
          msg=success.data.message;
        }
        util.alterDialog('提示', msg, '确定', null)
      }
    }, function (fail) { }, function (complete) { 
      //取消重复点击开始=============
      app.finishOperation(that);
      //取消重复点击结束=============
    })
   
  },
  myWallet: function () {
    //取消重复点击开始=============
    app.finishOperation(this);
    //取消重复点击结束=============
    wx.navigateTo({
      url: '/pages/myWallet/myWallet?custNo=' + this.data.custNo
    });     
  },
  setPayAmount: function (num) {
    var that = this;
    var oldPayAmount = that.data.withdrawalMoney;
    var withdrawalMoney = that.data.withdrawalMoney + num;
    var amount = parseFloat(withdrawalMoney);
    //判断金额...
    if (amount > that.data.canWithdrawalMoney) {
      util.alterDialog("提示", "输入金额不能大于可提现金额！", "确定",
        function (e) {
          that.setData({
            withdrawalMoney: oldPayAmount
          })
        });
      return;
    }
    //设置交易金额..
    this.setData({ withdrawalMoney: withdrawalMoney });
  },
  /**
   * 输入1
   */
  bindtapNum1: function () {
    this.setPayAmount("1");
  },
  /**
   * 输入2
   */
  bindtapNum2: function () {
    this.setPayAmount("2");
  },
  /**
   * 输入3
   */
  bindtapNum3: function () {
    this.setPayAmount("3");
  },
  /**
   * 输入4
   */
  bindtapNum4: function () {
    this.setPayAmount("4");
  },
  /**
   * 输入5
   */
  bindtapNum5: function () {
    this.setPayAmount("5");
  },
  /**
   * 输入6
   */
  bindtapNum6: function () {
    this.setPayAmount("6");
  },
  /**
   * 输入7
   */
  bindtapNum7: function () {
    this.setPayAmount("7");
  },
  /**
   * 输入8
   */
  bindtapNum8: function () {
    this.setPayAmount("8");
  },
  /**
   * 输入9
   */
  bindtapNum9: function () {
    this.setPayAmount("9");
  },
  /**
   * 输入0
   */
  bindtapNum0: function () {
    this.setPayAmount("0");
  },
  /**
   * 删除
   */
  bindtapNumDel: function () {
    var that = this;
    var withdrawalMoney = that.data.withdrawalMoney.toString();
    var length = withdrawalMoney.length;
    if (length > 0) {
      withdrawalMoney = withdrawalMoney.substr(0, length - 1);
      that.setData({ withdrawalMoney: withdrawalMoney });
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
    app.finishOperation(this);
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
  }
})