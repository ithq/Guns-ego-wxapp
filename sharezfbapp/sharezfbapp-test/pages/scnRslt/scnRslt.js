// /pages/scnRslt/scnRslt.js
//我要充电页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    serverUrl: app.glbParam.serverUrl, //渲染背景图
    responseInfo:null ,//从扫码过来的数据
    addr: '', //租借地址
    lonY: 0, //经
    latX: 0, //纬
    chargerId: null,
    deviceId: null,
    balanceForCust: 0,//账户余额
    isFeeeByTime: true,
    doubleOperateFlag: true,//处理重复提交
    endOperation: false,
    feeTypebyTime1: 1,
    feeHourbyTime1: 60,
    feeAmountByTime1: 1,
    feeTypebyTime2: 2,
    feeHourbyTime2: 120,
    feeAmountByTime2: 2,
    feeTypebyTime3: 3,
    feeHourbyTime3: 180,
    feeAmountByTime3: 3,
    selectFeeTypeByTime: 0,
    feeType: 26,
    feeYFJ: 5,
    feeAmount: 1,
    firstAmount: 1,
    firstMinutes: 180,
    feeHour: 1,
    feeMaxAmount24Hours: 5,
    payOutTradeNo: ""//支付对应的订单

  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);

  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //取缓存数据
    var response = my.getStorageSync({ key: 'responseInfo' });
    var responseInfo = response.data;
    that.setData({responseInfo:responseInfo})
    //加载数据，渲染视图
    that.loadView();
  },

  /** 加载数据，渲染视图*/
  loadView(){
    var that = this;
    var responseInfo = that.data.responseInfo;
    //1. 用户余额
    var balance = responseInfo.balance;
    //2. 处理费用..
    var isFeeeByTime = true;
    var feeTypebyTime1 = 0;
    var feeHourbyTime1 = 60;
    var feeAmountByTime1 = 0;
    var feeTypebyTime2 = 0;
    var feeHourbyTime2 = 120;
    var feeAmountByTime2 = 0;
    var feeTypebyTime3 = 0;
    var feeHourbyTime3 = 180;
    var feeAmountByTime3 = 0;
    var feeYFJ = 10;
    var feeAmount = 1;
    var feeHour = 1;
    var feeType = 25;
    var firstAmount = 0;
    var firstMinutes = 0;
    var feeMaxAmount24Hours = 10;
    var fees = responseInfo.listForFee;
    if (fees != undefined && fees != null && fees.length > 0) {
      for (var i = 0; i < fees.length; i++) {
        if (fees[i].feeTypeId == 25) {
          feeType = fees[i].feeTypeId;
          //预付费费用模式
          isFeeeByTime = false;
          feeYFJ = fees[i].yfj;
          feeAmount = fees[i].amountPerHour;
          feeHour = 1;
          feeMaxAmount24Hours = fees[i].maxAmountPer24Hours;
          break;
        } else if (fees[i].feeTypeId == 26) {
          feeType = fees[i].feeTypeId;
          //预付费费用模式
          isFeeeByTime = false;
          feeYFJ = fees[i].yfj;
          feeAmount = fees[i].amountPerHour;
          feeHour = 1;
          firstAmount = fees[i].firstAmount;
          firstMinutes = fees[i].firstMinutes;
          feeMaxAmount24Hours = fees[i].maxAmountPer24Hours;
          break;
        } else {
          //按时间控制(1~24)
          if (feeTypebyTime1 == 0) {
            feeTypebyTime1 = fees[i].feeTypeId;
            feeHourbyTime1 = fees[i].useHours;
            feeAmountByTime1 = fees[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime2 == 0) {
            feeTypebyTime2 = fees[i].feeTypeId;
            feeHourbyTime2 = fees[i].useHours;
            feeAmountByTime2 = fees[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime3 == 0) {
            feeTypebyTime3 = fees[i].feeTypeId;
            feeHourbyTime3 = fees[i].useHours;
            feeAmountByTime3 = fees[i].totalAmountForUseHour;
            continue;
          }
        }
      }
    } else {
      //没有获取到费用，可能 是没有设置费用
      isFeeeByTime = false;
    }

    //3.设备..
    var deviceId = responseInfo.shareChargerModel.deviceId;
    var chargerId = responseInfo.shareChargerModel.id;

    //4. 处理订单信息
    var addr = '';
    var latX = app.glbParam.currLatX;
    var lonY = app.glbParam.currLonY;
    //处理参数..
    this.setData({
      serverUrl: app.glbParam.serverUrl,//背景图片需要
      addr: addr,
      latX: latX,
      lonY: lonY,
      balanceForCust: balance,
      deviceId: deviceId,
      chargerId: chargerId,
      isFeeeByTime: isFeeeByTime,
      feeTypebyTime1: feeTypebyTime1,
      feeHourbyTime1: feeHourbyTime1,
      feeAmountByTime1: feeAmountByTime1,
      feeTypebyTime2: feeTypebyTime2,
      feeHourbyTime2: feeHourbyTime2,
      feeAmountByTime2: feeAmountByTime2,
      feeTypebyTime3: feeTypebyTime3,
      feeHourbyTime3: feeHourbyTime3,
      feeAmountByTime3: feeAmountByTime3,
      selectFeeTypeByTime: feeTypebyTime1,
      feeYFJ: feeYFJ,
      feeAmount: feeAmount,
      feeHour: feeHour,
      firstAmount: firstAmount,
      firstMinutes: firstMinutes,
      feeType: feeType,
      feeMaxAmount24Hours: feeMaxAmount24Hours
    })

  },

  //选择充电器费用，一小时1元，二小时2元，三小时3元。。。费用模式
  radioChange(event){
    //用户选择的费用
    var feeTypebyTime = event.detail.value;
  },
  //点击我要充电
  myWantToReCharge(){
    
    var that = this;
    if (!app.firstOperate(that, "租借中...")) {
      return;
    }
    var responseInfo = that.data.responseInfo;
    var balanceForCust = that.data.balanceForCust;
    //得到费用。。
    var yfjAmt = that.data.feeYFJ;
    var custNo = responseInfo.custNo == null ? '' : responseInfo.custNo;
    var feeTypeId = that.data.isFeeeByTime ?
      that.data.selectFeeTypeByTime : that.data.feeType;//如果不是，预付金额模式.
    var chargerId = that.data.chargerId;
    if (feeTypeId < 25) {
      //表示是按时间进行控制的。
      if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime1) {
        yfjAmt = that.data.feeAmountByTime1;
      } else if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime2) {
        yfjAmt = that.data.feeAmountByTime2;
      } else {
        yfjAmt = that.data.feeAmountByTime3;
      }
    }
    var payOutTradeNo = that.data.payOutTradeNo;
    var needFee = yfjAmt - balanceForCust;
    var chargeRslt = 'get_brand_wcpay_request:ok';
    if (needFee > 0) {
      //余额不够，充值再充电
      //needFee:所需费用，feeTypeId：费用类型,custNo:客户编号
      that.recharge(needFee, feeTypeId, custNo);
    } else {
      //余额足够直接扣款充电
      var latX = app.glbParam.currLatX;
      var lonY = app.glbParam.currLonY;
      var addr = that.data.addr;
      that.getPasswordForRecharge(custNo, feeTypeId, chargerId, payOutTradeNo,
        yfjAmt, chargeRslt, latX, lonY, addr);
    }
  },

  /**
   * 余额足够，充电获取密码方法
   */
  getPasswordForRecharge(custNo, feeTypeId, chargerId,payOutTradeNo, needFee, chargeRslt,latX, lonY, addr){
    var that = this;
    //1. 请求后台，生成我要充电的订单
    utls.wxRequsetForPost("zfb", "getPasswordForRecharge",
      {
        custNo: custNo,
        feeTypeId: feeTypeId,
        chargerId: chargerId,
        outTradeNo: payOutTradeNo,
        needFee: needFee,
        chargeRslt: chargerId,
        latitude: latX,
        longitude: lonY,
        zjAddr: addr
      }, function (success) {
        //1. 后台调用成功
        if (success.data.result == 'error') {
          utls.altDialog('操作', success.data.message, '确定', app.moveToIndex)
          return;
        }
        //2. 保存数据,返回设备租借的信息，加到缓存
        my.setStorageSync({
          key: 'responseInfo',
          data: success.data.responseInfo
        });
        //3. 跳转到显示密码界面
        my.redirectTo({
          url: '/pages/rdyToRchg/rdyToRchg'
        })
      }, function (fail) {

      }, function (complete) {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
      }
    )
  },

  /** 余额不够，充值再充电*/
  recharge(needFee, feeTypeId, custNo){
    var that = this;
    //调用支付宝alipay.trade.create接口，获取tradeNO
    utls.wxRequset("zfb", "getPrepayForCust", {
      needFee: needFee,
      feeTypeId: feeTypeId,
      custNo: custNo
    },
    function (success) {
      //1. 生成预订单情况
      var reChargeAmount = needFee;
      //成功
      var responseInfo = success.data.responseInfo;
      that.data.payOutTradeNo = responseInfo.outTradeNo;
      //2. 失败
      if (success.data.result == 'error') {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      //3. 调支付宝支付..
      my.tradePay({
        tradeNO: responseInfo.zfbTradeNo,  
        success: function(res) {
          if(res.resultCode == '9000'){
            //支付成功
            //修改缓存中的余额，重新调用我要充电
            that.setData({
              balanceForCust: that.data.balanceForCust + reChargeAmount,
              endOperation: false
            })
            //4. 重新处理 我要充电的业务逻辑。。。
            that.myWantToReCharge()
          }else{
            //取消重复点击开始=============
            app.endOperate(that);
            //取消重复点击结束=============
          }
          
        },
        fail: function(res) {
              //取消重复点击开始=============
            app.endOperate(that);
            //取消重复点击结束=============
            // fail
            return 'error';
          },
      });
    }, function (fail) {
    }, function (complete) {
      //取消重复点击开始=============
      app.endOperate(that);
      //取消重复点击结束=============
    })

  },

  /**
   *选择充电费用
   */
  radioChange(e){
    this.setData({
      selectFeeTypeByTime: e.detail.value
    })
  }


});