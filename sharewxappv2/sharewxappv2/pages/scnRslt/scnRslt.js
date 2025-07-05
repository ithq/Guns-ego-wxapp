// pages/scnRslt/scnRslt.js
//扫充电器二维码结果
const utls = require('../../utls/utls.js')
const cmmn = require('../../utls/cmmn.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serverUrl: app.glbParam.serverUrl,
    responseInfo: null,//结果集
    addr: '', //租借地址
    lonY: 0, //经度
    latX: 0, //纬度
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
    feeTypebyTime4: 4,
    feeHourbyTime4: 240,
    feeAmountByTime4: 4,
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.HomeBtnOnBind(that, "../index/index");
    //拿到数据
    var responseInfo = wx.getStorageSync('responseInfo')
    if (responseInfo == undefined || responseInfo == null) {
      utls.altDialog('提示', options.data.message, '确定', null)
      return;
    }
    //1. 用户余额
    var balance = responseInfo.balance;
    //2. 处理费用..
    var isFeeeByTime = true;
    var feeTypebyTime1 = null;
    var feeHourbyTime1 = 60;
    var feeAmountByTime1 = 0;
    var feeTypebyTime2 = null;
    var feeHourbyTime2 = 120;
    var feeAmountByTime2 = 0;
    var feeTypebyTime3 = null;
    var feeHourbyTime3 = 180;
    var feeAmountByTime3 = 0;
    var feeTypebyTime4 = null;
    var feeHourbyTime4 = 240;
    var feeAmountByTime4 = 0;
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
          if (feeTypebyTime1 == null) {
            feeTypebyTime1 = fees[i].feeTypeId;
            feeHourbyTime1 = fees[i].useHours;
            feeAmountByTime1 = fees[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime2 == null) {
            feeTypebyTime2 = fees[i].feeTypeId;
            feeHourbyTime2 = fees[i].useHours;
            feeAmountByTime2 = fees[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime3 == null) {
            feeTypebyTime3 = fees[i].feeTypeId;
            feeHourbyTime3 = fees[i].useHours;
            feeAmountByTime3 = fees[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime4 == null) {
            feeTypebyTime4 = fees[i].feeTypeId;
            feeHourbyTime4 = fees[i].useHours;
            feeAmountByTime4 = fees[i].totalAmountForUseHour;
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
    var latX = 0;
    var lonY = 0;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        latX = res.latitude;
        lonY = res.longitude;
      }
    })
    //处理参数..
    this.setData({
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
      feeTypebyTime4: feeTypebyTime4,
      feeHourbyTime4: feeHourbyTime4,
      feeAmountByTime4: feeAmountByTime4,
      selectFeeTypeByTime: feeTypebyTime1,
      feeYFJ: feeYFJ,
      feeAmount: feeAmount,
      feeHour: feeHour,
      firstAmount: firstAmount,
      firstMinutes: firstMinutes,
      feeType: feeType,
      feeMaxAmount24Hours: feeMaxAmount24Hours,
      responseInfo: responseInfo
    })

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
    if (that.data.endOperation) {
      app.endOperate(that);
    }
    that.data.endOperation = true;

    that.onPlayVoice();
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
   * 余额足够，充电获取密码方法
   */
  getPasswordForRecharge: function (custNo, feeTypeId, chargerId,
    payOutTradeNo, needFee, chargeRslt, latX, lonY, addr, code, ssn_3rd) {
    //1. 请求后台，生成我要充电的订单
    var that = this;
    //1.1 参数加密
    var keycode = cmmn.getKeyCode([custNo, feeTypeId, chargerId, payOutTradeNo, needFee, chargeRslt, latX, lonY, addr], code);
    //2. 请求后台处理充电.
    utls.wxRequsetForPost("wxapp", "getPasswordForRecharge",
      {
        custNo: custNo,
        feeTypeId: feeTypeId,
        chargerId: chargerId,
        outTradeNo: payOutTradeNo,
        needFee: needFee,
        chargeRslt: chargeRslt,
        latitude: latX,
        longitude: lonY,
        zjAddr: addr,
        keyCode: keycode,
        session3rd: ssn_3rd
      }, function (success) {
        //1. 后台调用成功
        if (success.data.result == 'error') {
          utls.altDialog('操作', success.data.message, '确定', app.moveToIndex)
          return;
        }
        //2. 保存数据,返回设备租借的信息，加到缓存
        wx.setStorageSync('responseInfo', success.data.responseInfo)
        //3. 把语音停止播放
        that.innerAudioContext.pause();
        //4. 跳转到显示密码界面
        wx.redirectTo({
          url: '../rdyToRchg/rdyToRchg'
        })
      }, function (fail) {

      }, function (complete) {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
      }
    )
  },
  //充值方法
  recharge: function (needFee, feeTypeId, custNo, code, ssn_3rd) {
    console.log("充值")
    var that = this;
    var keycode = cmmn.getKeyCode([needFee, feeTypeId, custNo], code)
    console.log(keycode)
    utls.wxRequset("wxapp", "getPrepayForCust", {
      session3rd: ssn_3rd,
      keyCode: keycode,
      needFee: needFee,
      feeTypeId: feeTypeId,
      custNo: custNo
    },
      function (success) {
        console.log("success")
        try {
          //1. 生成预订单情况
          var reChargeAmount = needFee;
          //成功
          var responseInfo = success.data.responseInfo;
          that.data.payOutTradeNo = responseInfo.outTradeNo;
          //2. 失败
          if (success.data.result == 'error') {
            console.log("error")
            //取消重复点击开始=============
            app.endOperate(that);
            //取消重复点击结束=============
            utls.altDialog('提示', success.data.message, '确定', null)
            return;
          }
          console.log("支付")
          //3. 调微信支付..
          var now = new Date().getTime() + '';
          var nonceStr = cmmn.randomString(32, null);
          var paySignStr = 'appId=' + responseInfo.appid + '&nonceStr=' + nonceStr + '&package=prepay_id=' + responseInfo.prepayId + '&signType=MD5' + '&timeStamp=' + now + '&key=' + responseInfo.key;
          var paySign = cmmn.MD5(paySignStr);
          //支付
          wx.requestPayment({
            'timeStamp': now,
            'nonceStr': nonceStr,
            'package': 'prepay_id=' + responseInfo.prepayId,
            'signType': 'MD5',
            'paySign': paySign,
            'success': function (success) {

              // success
              if (success.errMsg == 'requestPayment:ok') {
                console.log("充值成功")
                //修改缓存中的余额，重新调用我要充电
                that.setData({
                  balanceForCust: that.data.balanceForCust + reChargeAmount,
                  endOperation: false
                })
                //4. 重新处理 我要充电的业务逻辑。。。
                console.log("充电。。。")
                that.myWantToReCharge()
              }
            },
            fail: function (res) {
              //取消重复点击开始=============
              app.endOperate(that);
              //取消重复点击结束=============
              utls.altDialog('提示', res.err_desc, '确定', null)
              // fail
              return 'error';
            }, complete: function (res) {
            }
          })
        }
        catch (eee) {

          //取消重复点击开始=============
          app.endOperate(that);
          //取消重复点击结束=============
        }
      }, function (fail) {
        console.log("fail")
      }, function (complete) {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
      })
  },

  /**
   *我要充电
   */
  myWantToReCharge: function (e) {
    var that = this;
    if (!app.firstOperate(that, "租借中...")) {
      return;
    }
    try {
      var responseInfo = that.data.responseInfo;
      var balanceForCust = that.data.balanceForCust;
      //得到费用。。
      var yfjAmt = that.data.feeYFJ;
      var custNo = responseInfo.custNo == null ? '' : responseInfo.custNo;
      var feeTypeId = that.data.isFeeeByTime ?
        that.data.selectFeeTypeByTime : that.data.feeType;//如果不是，预付金额模式.
      var chargerId = that.data.chargerId;
      var deviceId = that.data.deviceId;
      if (feeTypeId < 25) {
        //表示是按时间进行控制的。
        if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime1) {
          yfjAmt = that.data.feeAmountByTime1;
        } else if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime2) {
          yfjAmt = that.data.feeAmountByTime2;
        } else if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime3) {
          yfjAmt = that.data.feeAmountByTime3;
        } else {
          yfjAmt = that.data.feeAmountByTime4;
        }
      }
      var payOutTradeNo = that.data.payOutTradeNo;
      var needFee = yfjAmt - that.data.balanceForCust;
      var chargeRslt = 'get_brand_wcpay_request:ok';
      if (needFee > 0) {
        //余额不够，充值再充电
        var code = app.glbParam.code;
        var ssn_3rd = app.glbParam.ssn_3rd;
        //needFee:所需费用，feeTypeId：费用类型,custNo:客户编号
        that.recharge(needFee, feeTypeId, custNo, code, ssn_3rd);
      } else {
        //余额足够直接扣款充电
        var code = app.glbParam.code;
        var ssn_3rd = app.glbParam.ssn_3rd;
        var latX = app.glbParam.currLatX;
        var lonY = app.glbParam.currLonY;
        var addr = that.data.addr;

        that.getPasswordForRecharge(custNo, feeTypeId, chargerId, payOutTradeNo,
          yfjAmt, chargeRslt, latX, lonY, addr, code, ssn_3rd);
      }
    } catch (eee) {
    }
  },
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    that.innerAudioContext = wx.createInnerAudioContext();
    that.innerAudioContext.autoplay = true;
    that.innerAudioContext.src = "/img/voice/recharger1.mp3";

    that.innerAudioContext.onPlay(() => {
    });
    that.innerAudioContext.onError((res) => {

    });
  },/**
   *选择充电费用
   */
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      selectFeeTypeByTime: e.detail.value
    })
  }
})