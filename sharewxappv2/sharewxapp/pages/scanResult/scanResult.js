// pages/index/index.js
const util = require('../../utils/util.js')
const common = require('../../utils/common.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    latitude:0,
    longitude:0,
    zjAddr:'',
    custBlance: 0,
    deviceNo:0,
    chargerId:0,
    isFeeeByTime:false,
    feeTypebyTime1:1,
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
    selectFeeTypeByTime:0,
    feeType:26,
    feeYFJ: 5,
    feeAmount: 1,
    firstAmount: 1,
    firstMinutes:180,
    feeHour: 1,
    feeMaxAmount24Hours:5,
    resourceUrl:app.globalData.resourceUrl,
    isFinishOperation:false,
    dbOperationFlag:true,//处理重新的问题
    isFirst:0, //第一次需要保存formid
    payOutTradeNo:""//支付对应的订单
  },
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.autoplay = true;
    this.innerAudioContext.src = "/images/voice/recharger1.mp3";
    
    this.innerAudioContext.onPlay(() => {
    });
    this.innerAudioContext.onError((res) => {

    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定首页按钮
    app.bindHomePageButton(this, "../index/index");
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo')
    if (responseInfo == null || responseInfo == undefined) {
      util.alterDialog('提示', options.data.message, '确定', null)
      return;
    }
    //1. 用户余额
    var balance = responseInfo.balance;
    //2. 处理费用..
    var isFeeeByTime=true;
    var feeTypebyTime1=null;
    var feeHourbyTime1=60;
    var feeAmountByTime1=0;
    var feeTypebyTime2=null;
    var feeHourbyTime2=120;
    var feeAmountByTime2=0;
    var feeTypebyTime3 = null;
    var feeHourbyTime3=180;
    var feeAmountByTime3=0;
    var feeTypebyTime4 = null;
    var feeHourbyTime4 = 180;
    var feeAmountByTime4 = 0;
    var feeYFJ=10;
    var feeAmount=1;
    var feeHour=1;
    var feeType=25;
    var firstAmount=0;
    var firstMinutes=0;
    var feeMaxAmount24Hours=10;
    var listForFee = responseInfo.listForFee;
    if (listForFee != null && listForFee!=undefined&&listForFee.length>0){
      for(var i=0;i<listForFee.length;i++){
        if (listForFee[i].feeTypeId==25){
          feeType = listForFee[i].feeTypeId;
           //预付费费用模式
          isFeeeByTime=false;
          feeYFJ = listForFee[i].yfj;
          feeAmount = listForFee[i].amountPerHour;
          feeHour =1;
          feeMaxAmount24Hours = listForFee[i].maxAmountPer24Hours;
          break;
        } else if (listForFee[i].feeTypeId == 26) {
          feeType = listForFee[i].feeTypeId;
          //预付费费用模式
          isFeeeByTime = false;
          feeYFJ = listForFee[i].yfj;
          feeAmount = listForFee[i].amountPerHour;
          feeHour =1;
          firstAmount = listForFee[i].firstAmount;
          firstMinutes = listForFee[i].firstMinutes;
          feeMaxAmount24Hours = listForFee[i].maxAmountPer24Hours;
          break;
        } else{
          //按时间控制(0~24)
          if (feeTypebyTime1 == null) {
            feeTypebyTime1 = listForFee[i].feeTypeId;
            feeHourbyTime1 = listForFee[i].useHours;
            feeAmountByTime1 = listForFee[i].totalAmountForUseHour;
            continue;              
          } else if (feeTypebyTime2 == null) {
            feeTypebyTime2 = listForFee[i].feeTypeId;
            feeHourbyTime2 = listForFee[i].useHours;
            feeAmountByTime2 = listForFee[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime3 == null){
            feeTypebyTime3 = listForFee[i].feeTypeId;
            feeHourbyTime3 = listForFee[i].useHours;
            feeAmountByTime3 = listForFee[i].totalAmountForUseHour;
            continue;
          } else if (feeTypebyTime4 == null) {
            feeTypebyTime4 = listForFee[i].feeTypeId;
            feeHourbyTime4 = listForFee[i].useHours;
            feeAmountByTime4 = listForFee[i].totalAmountForUseHour;
            continue;
          }
          
        }
      }
    }else{
      //没有获取到费用，可能 是没有设置费用
      isFeeeByTime=false;
    }

    //3.设备..
    var deviceNo = responseInfo.shareChargerModel.deviceId;
    var chargerId = responseInfo.shareChargerModel.id;

    //4. 处理订单信息
    var addr = '';
    var latitude = 0;
    var longitude = 0;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        latitude = res.latitude;
        longitude = res.longitude;
      }
    })  
    //处理参数..
    this.setData({
      zjAddr: addr,
      latitude: latitude,
      longitude: longitude,
      custBlance: balance,
      deviceNo: deviceNo,
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
   *选择充电费用
   */
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      selectFeeTypeByTime: e.detail.value
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
    if (this.data.isFinishOperation){
      app.finishOperation(this);
    }
    this.data.isFinishOperation=true;

    this.onPlayVoice();   
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
   *我要充电
   */
  myWantToReCharge:function(e){
    //防重复点击开始=============
    if (!app.startOperation(this, "租借中...")) {
      return;
    }
    try{
      //防重复点击结束=============
      var responseInfo = this.data.responseInfo;
      var balance = this.data.custBlance;
      //如果第一次进来，设置余额，非第一次进来，在充值后设置余额
      if (this.data.isFirst == 0) {
        try {
          var formId = e.detail.formId; //用于发消息模板
          //保存formId
          app.saveFormId(formId, false);
        } catch (e) {
        }
      }
      //得到费用。。
      var yfjAmt =this.data.feeYFJ;
      var custNo = responseInfo.custNo == null ? '' : responseInfo.custNo;
      var feeTypeId = this.data.isFeeeByTime ? 
            this.data.selectFeeTypeByTime : this.data.feeType;//如果不是，预付金额模式.
      var chargerId =this.data.chargerId;
      var deviceNo=this.data.deviceNo;
      if(feeTypeId<25){
        //表示是按时间进行控制的。
        if (this.data.selectFeeTypeByTime==this.data.feeTypebyTime1){
           yfjAmt=this.data.feeAmountByTime1;
        } else if (this.data.selectFeeTypeByTime == this.data.feeTypebyTime2){
          yfjAmt = this.data.feeAmountByTime2;
        } else if (this.data.selectFeeTypeByTime == this.data.feeTypebyTime3) {
          yfjAmt = this.data.feeAmountByTime3;
        }else{
          yfjAmt=this.data.feeAmountByTime4;
        }
      }
      var payOutTradeNo = this.data.payOutTradeNo;
      var needFee = yfjAmt- this.data.custBlance;
      var chargeRslt = 'get_brand_wcpay_request:ok';
      if (needFee > 0){
        //余额不够，充值再充电
        var code = app.globalData.code;
        var session_3rd = app.globalData.session_3rd;
        //needFee:所需费用，feeTypeId：费用类型,custNo:客户编号
        this.recharge(needFee, feeTypeId, custNo, code, session_3rd);         
      }else{
        //余额足够直接扣款充电
        var code = app.globalData.code;
        var session_3rd = app.globalData.session_3rd;
        var latitude = app.globalData.currLatitude;
        var longitude = app.globalData.currLongitude;
        var addr = this.data.zjAddr;

        this.getPasswordForRecharge(custNo, feeTypeId, chargerId, payOutTradeNo,
            yfjAmt, chargeRslt, latitude, longitude, addr, code, session_3rd);      
      }
    } catch (eee) {
    }
  },
  //充值方法
  recharge: function (needFee, feeTypeId, custNo, code, session3rd){
    var that = this;
    var keycode = common.getKeyCode([needFee, feeTypeId, custNo], code)
    util.shareRequest("wxapp", "getPrepayForCust", {
      session3rd: session3rd,
      keyCode: keycode,
      needFee: needFee,
      feeTypeId: feeTypeId,
      custNo: custNo
    },
      function (success) {
        try
        {
            //1. 生成预订单情况
            var reChargeAmount = needFee;
            //成功
            var responseInfo = success.data.responseInfo;
            that.data.outTradeNo = responseInfo.outTradeNo;
            //2. 失败
            if (success.data.result == 'error') {
              //取消重复点击开始=============
              app.finishOperation(that);
              //取消重复点击结束=============
              util.alterDialog('提示', success.data.message, '确定', null)
              return;
            }
            //3. 调微信支付..
            var now = new Date().getTime() + '';
            var nonceStr = common.randomString(32, null);
            var paySignStr = 'appId=' + responseInfo.appid + '&nonceStr=' + nonceStr + '&package=prepay_id=' + responseInfo.prepayId + '&signType=MD5' + '&timeStamp=' + now + '&key=' + responseInfo.key;
            var paySign = common.MD5(paySignStr);
            //支付
            wx.requestPayment({
              'timeStamp': now,
              'nonceStr': nonceStr,
              'package': 'prepay_id=' + responseInfo.prepayId,
              'signType': 'MD5',
              'paySign': paySign,
              'success': function (success) {
                //1. 保存formId, 以便下一步发信息.
                  try {
                    var prepayOrderId = responseInfo.prepayId; 
                    if (prepayOrderId != undefined && prepayOrderId != null && prepayOrderId != '') {
                      app.saveFormId(prepayOrderId,true);
                    }
                  } catch (exception) { 

                  }
                // success
                if (success.errMsg == 'requestPayment:ok'){
                  //修改缓存中的余额，重新调用我要充电
                  that.setData({
                    custBlance: that.data.custBlance + reChargeAmount,
                    isFirst:1,
                    isFinishOperation:false
                  })
                  //4. 重新处理 我要充电的业务逻辑。。。
                  that.myWantToReCharge()
                }
              },
              fail: function (res) {
                //取消重复点击开始=============
                app.finishOperation(that);
                //取消重复点击结束=============
                util.alterDialog('提示', res.err_desc, '确定', null)
                // fail
                return 'error';
              }, complete: function (res) {
              }
            })
          }
          catch (eee) {

            //取消重复点击开始=============
            app.finishOperation(that);
            //取消重复点击结束=============
          }
        },function (fail) {

        }, function (complete) {
            //取消重复点击开始=============
            app.finishOperation(that);
            //取消重复点击结束=============
        })
  },
  /**
   * 余额足够，充电获取密码方法
   */
  getPasswordForRecharge: function (custNo, feeTypeId, chargerId, 
        payOutTradeNo, needFee, chargeRslt, latitude, longitude, zjAddr, code, session3rd){
    //1. 请求后台，生成我要充电的订单
    var that = this;
    //1.1 参数加密
    var keycode = common.getKeyCode([custNo, feeTypeId, chargerId, payOutTradeNo, needFee, chargeRslt, latitude, longitude, zjAddr], code);
    //2. 请求后台处理充电.
    util.shareRequestPost("wxapp", "getPasswordForRecharge",//"getPwdWithYFJ.htm",
     {
       custNo: custNo,
       feeTypeId: feeTypeId,
       chargerId: chargerId,
       outTradeNo: payOutTradeNo,
       needFee: needFee,
       chargeRslt: chargeRslt,
       latitude: latitude,
       longitude: longitude,
       zjAddr: zjAddr,
       keyCode: keycode,
       session3rd: session3rd
      },function (success) {
        //1. 后台调用成功
        if (success.data.result == 'error') {
           util.alterDialog('操作', success.data.message, '确定', app.moveToIndex)
          return;
        }
        //2. 保存数据,返回设备租借的信息，加到缓存
        wx.setStorageSync('responseInfo', success.data.responseInfo)
        //3. 把语音停止播放
        that.innerAudioContext.pause();
        //4. 跳转到显示密码界面
        wx.redirectTo({
          url: '../readyToRecharge/readyToRecharge'
        })
       }, function (fail) { 

       }, function (complete) {
         //取消重复点击开始=============
         app.finishOperation(that);
         //取消重复点击结束=============
      }
     )
  }
})