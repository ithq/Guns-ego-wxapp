// /pages/wthDrwl/wthDrwl.js
//提现页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    withdrawalType: 1,//提现类型默认1
    custNo: null,
    canTakeMoney: 0, //总共能提现的额度
    willTakeMoney:0, //将要提现的额度
    custAccount:null
  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);

  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //缓存中取账户数据
    var response = my.getStorageSync({ key: 'custAccount' });
    var custAccount = response.data;
    that.setData({"custAccount":custAccount});
    //获取并加载上个页面的钱包信息
    that.loadWltInfo();

  },

  /**获取并加载上个页面的钱包信息 */
  loadWltInfo(){
    var that = this;
    var custAccount = that.data.custAccount;
    var withdrawalType = 1; //提现类型
    var custNo = custAccount.custNo;
    var canTakeMoney = parseInt(custAccount.availableBalance); //可提现余额

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


  //点击全部提现
  takeAllMoney(){
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

  //点击提现
  takeMoney(){
    var that = this;
    var willTakeMoney = that.data.willTakeMoney
     if (!app.firstOperate(that, "加载...")) {
      return;
    }
    if (willTakeMoney <= 0) {
      utls.altDialog('提示', '提现金额不能小于1元!', '确定', null)
      app.endOperate(that);
      return;
    }
    // 只能提现整数倍的余额
    if (!utls.isInteger(willTakeMoney)) {
      utls.altDialog('提示', '只能提现整数倍的金额!', '确定', null)
      app.endOperate(that);
      return;
    }
    var keyCode = cmmn.getKeyCode([willTakeMoney, app.glbParam.custNo], app.glbParam.authCode)
    utls.wxRequset("zfb", "doZfbAppWithraw", {
      withdrawAmount: willTakeMoney,
      custNo: app.glbParam.custNo,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (success) {
      if (success.data.result == 'success') {
        utls.altDialog('提示', '提现申请成功!', '确定', that.wallet())
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
  //返回我的钱包
  wallet() {
    app.endOperate(this);
    my.navigateTo({
      url: '/pages/myWlt/myWlt?custNo=' + app.glbParam.custNo
    });
  },

  /**
   * 输入1
   */
  bindtapNum1() {
    this.setTakeAmount("1");
  },
  /**
   * 输入2
   */
  bindtapNum2() {
    this.setTakeAmount("2");
  },
  /**
   * 输入3
   */
  bindtapNum3 () {
    this.setTakeAmount("3");
  },
  /**
   * 输入4
   */
  bindtapNum4() {
    this.setTakeAmount("4");
  },
  /**
   * 输入5
   */
  bindtapNum5() {
    this.setTakeAmount("5");
  },
  /**
   * 输入6
   */
  bindtapNum6() {
    this.setTakeAmount("6");
  },
  /**
   * 输入7
   */
  bindtapNum7 () {
    this.setTakeAmount("7");
  },
  /**
   * 输入8
   */
  bindtapNum8 () {
    this.setTakeAmount("8");
  },
  /**
   * 输入9
   */
  bindtapNum9() {
    this.setTakeAmount("9");
  },
  /**
   * 输入0
   */
  bindtapNum0 () {
    this.setTakeAmount("0");
  },
  /**
   * 删除
   */
  bindtapNumDel() {
    var that = this;
    var willTakeMoney = that.data.willTakeMoney.toString();
    var length = willTakeMoney.length;
    if (length > 0) {
      willTakeMoney = willTakeMoney.substr(0, length - 1);
      that.setData({ willTakeMoney: willTakeMoney });
    }
  },
//输入提现费用
  setTakeAmount(num) {
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
  }

});