// /pages/scnRslt/scnRslt.js
//我要充电页面
const utls = require('/utls/utls.js')
const cmmn = require('/utls/cmmn.js')
var bletools = require('/utls/bletools.js');
var constants = require('/utls/constants.js');
const app = getApp()

Page({
  data:{
    audioContext: null, // 音频播放
    advertImage: '', // 广告图片
    responseInfo:null ,//从扫码过来的数据
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
    maxFeeAmount: 5,
    maxFeeHour: 24,
    payOutTradeNo: "", //支付对应的订单
    needBluetooth: false, //是否必须开启蓝牙
    bleName: '', // 蓝牙名称
    bleInitFlag: false, //蓝牙初始化
    bleOpenFlag: false, //是否已开启蓝牙
    bleScaning: false, // 蓝牙是否在搜索
    bleConnected: false, // 蓝牙设备连接状态
    hTimeToRchg: null, //蓝牙连接超时时间
    scanBleCount: 0, //蓝牙搜索次数
    jumpRdyToBleRchgFlag: false, //跳到蓝牙充电器界面
    payScoreFlag: false, //是否免押租借 
    payScoreOrderCount: 0, //使用中的免押订单
    authCheckFlag: true, //免押租借授权
    isInit: false,  //是否初始化标记
    isDestroy: false, //是否销毁标记
    formId: null, //表单的formId
  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);
    // 创建前景音上下文对象
    if(my.createInnerAudioContext){
      this.setData({
        audioContext: my.createInnerAudioContext() 
      })
    }
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
    // 蓝牙设备打开蓝牙
    if (that.data.needBluetooth){
      if(!that.bleInit()){
        return;
      }
    }
    // 语音播放
    that.onPlayVoice();
  },
  onUnload() {
    // 页面被关闭
    var that = this;
    // 2.把语音停止播放
    that.data.audioContext.pause();
  },
  /** 加载数据，渲染视图*/
  loadView(){
    var that = this;
    var responseInfo = that.data.responseInfo;
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
    var maxFeeAmount = 10;
    var maxFeeHour = 24;
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
          maxFeeAmount = fees[i].maxFeeAmount;
          maxFeeHour = fees[i].maxFeeHour;
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
          maxFeeAmount = fees[i].maxFeeAmount;
          maxFeeHour = fees[i].maxFeeHour;
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
    var latX = app.glbParam.currLatX;
    var lonY = app.glbParam.currLonY;
    my.getLocation({
      type: 0, //默认，获取经纬度
      success: (res) => {
        latX = res.latitude;
        lonY = res.longitude;
      }
    })
    
    //5.基础信息
    var needBluetooth = (responseInfo.needBluetooth?true:false);
    var bleName = responseInfo.bleName!=undefined?responseInfo.bleName:'';
    var payScoreFlag = (responseInfo.payScoreFlag?true:false);
    var payScoreOrderCount = (responseInfo.payScoreOrderCount || 0);

    //5.处理广告图片
    var advertImage = '/assets/img/bar1.png';
    var advertInfo = app.getAdvertInfo(3); 
    if(advertInfo){
      advertImage = advertInfo.images;
    }

    //处理参数..
    this.setData({
      advertImage: advertImage,//背景图片需要
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
      maxFeeAmount: maxFeeAmount,
      maxFeeHour: maxFeeHour,
      needBluetooth: needBluetooth,
      bleName: bleName,
      payScoreFlag: payScoreFlag,
      payScoreOrderCount: payScoreOrderCount,
      bleOpenFlag: false,
      bleScaning: false,
      bleConnected: false,
      jumpRdyToBleRchgFlag: false,
      isInit: true
    })
  },
  /**
   * 蓝牙初始化
   */
  bleInit1: function(){
    bletools.initBle(this);
    this.setData({
      bleInitFlag: true,
      bleOpenFlag: false,
      bleScaning: false,
      bleConnected: false
    });
  },
  /**
   * 蓝牙初始化
   */
  bleInit: function(){
    let that = this;
    // 从缓存读取连接状态
    let res = my.getStorageSync({
      key: 'bleConnected',
    });
    if(res && res.data === true){
      my.removeStorageSync({
        key: 'bleConnected'
      });
      that.setData({
        bleConnected: true
      })
      return true;
    } else {
      my.redirectTo({
        url: '/pages/bleConnect/bleConnect?fromPage=scnRslt'
      })
      return false;
    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let that = this;
    // 1.关闭蓝牙连接
    if (that.data.needBluetooth) {
      if(!that.data.jumpRdyToBleRchgFlag){
        bletools.disconnect();
        bletools.clear();
      }
    }
    // 2.把语音停止播放
    that.data.audioContext.pause();
    // 3.清空数据
    if (that.data.hTimeToRchg) {
      clearTimeout(that.data.hTimeToRchg);
    }
    that.setData({
      bleOpenFlag: false,
      bleScaning: false,
      bleConnected: false,
      jumpRdyToBleRchgFlag: false,
      isDestroy: true,
      hTimeToRchg: null
    });
  },
  //选择充电器费用，一小时1元，二小时2元，三小时3元。。。费用模式
  radioChange(event){
    //用户选择的费用
    var feeTypebyTime = event.detail.value;
  },
  /**
   * 余额足够，充电获取密码方法
   */
  getPasswordForRecharge(custNo, feeTypeId, chargerId,payOutTradeNo, needFee, chargeRslt,latX, lonY, addr, e){
    var that = this;
    // 获取表单id 
    var formId = e.detail.formId;
    var keyCode = cmmn.getKeyCode([custNo, feeTypeId, chargerId, payOutTradeNo, needFee, chargeRslt, latX, lonY, addr], app.glbParam.authCode)
    //1. 请求后台，生成我要充电的订单
    utls.wxRequsetForPost("zfb", "getPasswordForRecharge",
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
        session3rd: app.glbParam.ssnId,
        keyCode: keyCode,
        formId: formId
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
        //3. 把语音停止播放
        that.data.audioContext.pause();
        //4. 跳转到显示密码界面
        if (success.data.responseInfo.pageIndex == "ReadyToBleRecharge"){
          that.setData({
            jumpRdyToBleRchgFlag: true
          });
          my.setStorageSync({
            key: 'currentBle', 
            data: bletools.getCurrentBle()
          });
          my.redirectTo({
            url: '../rdyToBleRchg/rdyToBleRchg'
          })
        } else {
          my.redirectTo({
            url: '/pages/rdyToRchg/rdyToRchg'
          })
        }
      }, function (fail) {

      }, function (complete) {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
      }
    )
  },

  /** 余额不够，充值再充电*/
  recharge(needFee, feeTypeId, custNo, e){
    var that = this;
    // 获取表单id 
    var formId = e.detail.formId;
    var keyCode = cmmn.getKeyCode([needFee, feeTypeId, custNo], app.glbParam.authCode)
    //调用支付宝alipay.trade.create接口，获取tradeNO
    utls.wxRequset("zfb", "getPrepayForCust", {
      needFee: needFee,
      feeTypeId: feeTypeId,
      custNo: custNo,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode,
      formId: formId
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
            that.myWantToReCharge(e)
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
   * 点击我要充电
   */
  myWantToReCharge(e){
    var that = this;
    //蓝牙版本必须先开启蓝牙才能付款，保证付款后能充电
    if (that.data.needBluetooth && !that.data.bleConnected) {
      that.bleInit();
      return;
    }
    // if (that.data.needBluetooth) {
    //   if (that.data.bleOpenFlag == false){
    //     utls.altDialog('提示', constants.NOT_BLE, '确定', null);
    //     return;
    //   }
    //   if(that.data.bleConnected == false){
    //     utls.altDialog('提示', '请将手机靠近充电器，等待设备连接蓝牙后，即可付款充电', '确定', function(){
    //       if (that.data.bleInitFlag == false){
    //         that.bleInit();
    //       }
    //     });
    //     return;
    //   }
    // }
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
      } else if (that.data.selectFeeTypeByTime == that.data.feeTypebyTime3) {
        yfjAmt = that.data.feeAmountByTime3;
      } else { 
        yfjAmt = that.data.feeAmountByTime4;
      }
    }
    var payOutTradeNo = that.data.payOutTradeNo;
    var needFee = yfjAmt - balanceForCust;
    var chargeRslt = 'get_brand_wcpay_request:ok';
    if (needFee > 0) {
      //余额不够，充值再充电
      //needFee:所需费用，feeTypeId：费用类型,custNo:客户编号
      that.recharge(needFee, feeTypeId, custNo, e);
    } else {
      //余额足够直接扣款充电
      var latX = app.glbParam.currLatX;
      var lonY = app.glbParam.currLonY;
      var addr = that.data.addr;
      that.getPasswordForRecharge(custNo, feeTypeId, chargerId, payOutTradeNo,
        yfjAmt, chargeRslt, latX, lonY, addr, e);
    }
  },
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    if (!that.data.audioContext) {
      let audioContext = my.createInnerAudioContext();
      that.setData({
        audioContext: audioContext
      })
    }
    that.data.audioContext.autoplay = true;
    // 这里要用优酷的src=/assets/voice/recharger.mp3
    that.data.audioContext.src = "XNDc3MjIwNzY4MA==";
      that.data.audioContext.onPlay(() => {
    });
    that.data.audioContext.onError((res) => {

    });
  },
  /**
   *选择充电费用
   */
  radioChange(e){
    this.setData({
      selectFeeTypeByTime: e.detail.value
    })
  },
  /**
   * 蓝牙开启结果回调
   * @param res 蓝牙开启结果
   */
  bleOpenBluetoothEvent: function (res) {
    let that = this;
    let hTimeToRchg = that.data.hTimeToRchg;
    if (res && that.data.needBluetooth) {
      //这里有一个坑：IOS里面蓝牙状态变化以后不能马上开始搜索，否则会搜索不到设备，必须要等待2秒以上。
      hTimeToRchg = setTimeout(function () {
        that.bleConnectBluetooth();
      }, 2000);
    } 
    that.setData({ 
      bleOpenFlag: res, 
      hTimeToRchg: hTimeToRchg
    });
  },
  /**
   * 蓝牙扫描，匹配，连接
   */
  bleConnectBluetooth: function () {
    let that = this;
    let deviceName = that.data.bleName;
    that.setData({
      scanBleCount: that.data.scanBleCount + 1
    })
    //1.扫描蓝牙 
    console.info('1.开始第' + that.data.scanBleCount + '次，搜索蓝牙...')
    bletools.startScanBle({
      deviceName: deviceName,
      success: device => {
        // 2.停止蓝牙扫描
        console.info('2.停止蓝牙扫描');
        bletools.stopBluetoothDevicesDiscovery();
        // 3.连接蓝牙
        setTimeout(function () {
          console.info('3.连接蓝牙');
          bletools.connectBle({
            device: device,
            success: res => {
              console.info('3.连接蓝牙结果：成功')
            },
            fail: err => {
              console.info('3.连接蓝牙结果：失败')
              that._autoJumpRdyToRchg();
            }
          });
        }, 2000)
        //4.等待连接结果
      },
      fail: res => {
        that._autoJumpRdyToRchg();
      }
    })
  },
  /**
   * ble状态监听
   */
  bleStateListener: function (state) {
    let that = this;
    switch (state) {
      case constants.STATE_OPEN_SUCCESS: //蓝牙打开成功
        console.log("蓝牙开启成功回调");
        if (false == that.data.bleOpenFlag) {
          that.bleOpenBluetoothEvent(true);
        }
        break;
      case constants.STATE_OPEN_FAIL: //蓝牙打开失败
        console.log("蓝牙开启失败回调");
        that.bleOpenBluetoothEvent(false);
        break;
      case constants.STATE_CLOSE_BLE: //蓝牙未打开 关闭状态
        that.bleOpenBluetoothEvent(false);
        utls.altDialog('提示', constants.NOT_BLE, '确定', null)
        break;
      case constants.STATE_DISCONNECTED: //设备连接断开
        console.log('设备连接断开')
        bletools.clear();
        that.setData({ 
          bleConnected: false, 
          bleInitFlag: false
        });
        break;
      case constants.STATE_SCANNING: //设备正在扫描
        console.log('设备正在扫描')
        that.setData({
          bleScaning: true
        })
        break;
      case constants.STATE_SCANNEND: //设备扫描结束
        console.log('设备扫描结束')
        that.setData({
          bleScaning: false
        })
        break;
      case constants.STATE_CONNECTING: //设备正在连接
        console.log('设备正在连接')
        break;
      case constants.STATE_CONNECTED: //设备连接成功
        console.log('设备连接成功')
        break;
      case constants.STATE_CONNECTING_ERROR: //连接失败
        console.log('连接失败')
        break;
      case constants.STATE_NOTIFY_SUCCESS: //开启notify成功
        console.log('开启notify成功')
        // 蓝牙特征获取成功后，发送解锁数据
        that.setData({
          bleConnected: true
        });
        utls.altDialog('提示', '恭喜充电器连接成功，现在可以付款充电了。', '确定', null);
        break;
      case constants.STATE_NOTIFY_FAIL: //开启notify失败
        console.log('开启notify失败')
        break;
      case constants.STATE_NOTBLE_WCHAT_VERSION: //微信版本过低 不支持ble
        utls.altDialog('提示', constants.NOT_PERMISSION2, '确定', null)
        break;
      case constants.STATE_NOTBLE_SYSTEM_VERSION: //系统版本过低 不支持ble
        utls.altDialog('提示', constants.NOT_PERMISSION1, '确定', null)
        break;
    }
  },
  /**
   * 蓝牙没有扫描到设备，自动跳转到密码界面
   */
  _autoJumpRdyToRchg: function () {
    let that = this;
    // 蓝牙扫描结束后，没有充电成功跳转到密码界面
    if (that.data.bleConnected || that.data.bleScaning || bletools.getCurrentBle()) {
      return;
    }
    if (that.data.needBluetooth) {
      if((that.data.scanBleCount % 2) == 0){
        // 必须使用蓝牙时，只能是提示用户开启蓝牙，靠近设备重试了
        utls.altDialog('提示', '连接充电器失败，请打开手机蓝牙和GPS位置定位，靠近充电器重试', '重试', function () {
          that.bleConnectBluetooth();
        })
      } else {
        // 搜索2次再进行提示
        that.bleConnectBluetooth();
      }
      
    }
  },
  /**
   * 广告图片点击
   */
  clickAdvertInfo(e){
    app.clickAdvertInfo(3, this.data.chargerId);
  },

  // 免押租借
  payScoreToReCharge(e){
    var that = this;
    if (!app.firstOperate(that, "租借中...")) {
      return;
    }
    console.info('免押租借中...')
    // 有免押订单提示免押租借
    if(that.data.payScoreOrderCount > 0){
      //取消重复点击结束=============
      app.endOperate(that);
      utls.confirmDialog('提示', '您有免押订单在使用，是否使用押金租借。', function(){
        console.info('使用押金租借');
        that.myWantToReCharge();
      }, function(){
        console.info('取消免押租借');
      })
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
      var needFee = yfjAmt; //- balanceForCust;
      var chargeRslt = 'get_brand_wcpay_request:ok';
      if (null == payOutTradeNo || '' == payOutTradeNo) {
        //没有免押订单，免押充电
        needFee = yfjAmt;
        //needFee:所需费用，feeTypeId：费用类型,custNo:客户编号
        that.payScoreRecharge(chargerId, needFee, feeTypeId, custNo);
      } else {
        //创建免押订单后，开始充电
        var latX = app.glbParam.currLatX;
        var lonY = app.glbParam.currLonY;
        var addr = that.data.addr;
        // 
        that.getPasswordForPayScore(custNo, feeTypeId, chargerId, payOutTradeNo,
          yfjAmt, chargeRslt, latX, lonY, addr);
      }
    } catch (eee) {
    }
  },
  //免押租借方法
  payScoreRecharge(chargerId, needFee, feeTypeId, custNo) {
    console.log("免押租借")
    var that = this;
    var keyCode = cmmn.getKeyCode([chargerId, needFee, feeTypeId, custNo], app.glbParam.authCode)
    utls.wxRequset("zfb", "getPrepayForPayScore", {
      keyCode: keyCode,
      chargerId: chargerId,
      needFee: needFee,
      feeTypeId: feeTypeId,
      custNo: custNo,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    },
      function (success) {
        console.log("success")
        try {
          //1. 生成预订单情况
          var reChargeAmount = needFee;
          //成功
          var responseInfo = success.data.responseInfo;
          //2. 失败
          if (success.data.result == 'error') {
            console.log("error=" + success.data.message);
            //取消重复点击结束=============
            app.endOperate(that);
            utls.altDialog('提示', success.data.message, '确定', null)
            return;
          }
          console.log("免押支付")
          //3. 调微信免押支付..
          if (my.tradePay) {
            //取消重复点击结束============= test test start
            app.endOperate(that); 
            //============= test test end
            my.tradePay({
              orderStr: responseInfo.body,
              success: (res) => {
                if(res.resultCode == '9000'){
                  console.info('租借成功,订单号=' + responseInfo.outTradeNo)
                  //保存全局订单号，重新调用我要充电
                  that.setData({payOutTradeNo: responseInfo.outTradeNo});
                  //2. 调用免押支付功能 我要免押充电的业务逻辑。。。提高成功率，在这里延迟500ms
                  setTimeout(() => {
                    //取消重复点击结束=============
                    app.showLoadingEndOperate(that, false);
                    console.log("免押充电。。。")
                    that.payScoreToReCharge();
                  }, 0);
                } else{
                  //取消重复点击结束=============
                  app.endOperate(that);
                  utls.confirmDialog('提示', '免押租借失败，是否使用押金租借。', function(){
                    console.info('使用押金租借');
                    that.myWantToReCharge();
                  }, function(){
                    console.info('取消租借');
                    that.setData({
                      payOutTradeNo: ''
                    })
                  })
                }
              },
              fail: (res) => {
                console.info('租借失败')
                //取消重复点击结束=============
                app.endOperate(that);
              }
            });
          }else{
            //取消重复点击结束=============
            app.endOperate(that);
            //引导用户升级微信版本
            utls.altDialog('提示', '您使用的支付宝版本过低，不支持免押支付，请升级版本。', '确定', null);
            return 'error';
          }
        }
        catch (eee) {
          //取消重复点击结束=============
          app.endOperate(that);
        }
      }, function (fail) {
        console.log("fail")
        //取消重复点击结束=============
        app.endOperate(that);
      }, function (complete) {
        
      })
  },
  /**
   * 免押订单，充电获取密码方法
   */
  getPasswordForPayScore(custNo, feeTypeId, chargerId,
    payOutTradeNo, needFee, chargeRslt, latX, lonY, addr) {
    //1. 请求后台，生成我要充电的订单
    var that = this;
    //1.1 参数加密
    var keyCode = cmmn.getKeyCode([custNo, feeTypeId, chargerId, payOutTradeNo, needFee, chargeRslt, latX, lonY, addr], app.glbParam.authCode)
    //2. 请求后台处理充电.
    utls.wxRequsetForPost("zfb", "getPasswordForPayScore",
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
        session3rd: app.glbParam.ssnId,
        keyCode: keyCode
      }, function (success) {
        //取消重复点击结束=============
        app.endOperate(that);
        //1. 后台调用成功
        if (success.data.result == 'error') {
          // 清空免押订单
          that.setData({payOutTradeNo: ''});
          utls.altDialog('操作', success.data.message, '确定', app.moveToIndex)
          return;
        }
        //2. 保存数据,返回设备租借的信息，加到缓存
        my.setStorageSync({
          key: 'responseInfo',
          data: success.data.responseInfo
        });
        //3. 把语音停止播放
        that.data.audioContext.pause();
        //4. 跳转到显示密码界面或者蓝牙充电界面
        if (success.data.responseInfo.pageIndex == "ReadyToBleRecharge"){
          that.setData({
            jumpRdyToBleRchgFlag: true
          });
          my.setStorageSync({
            key: 'currentBle',
            data: bletools.getCurrentBle()
          });
          my.redirectTo({
            url: '../rdyToBleRchg/rdyToBleRchg'
          })
        }else{
          my.redirectTo({
            url: '../rdyToRchg/rdyToRchg'
          })
        }
      }, function (fail) {
        //取消重复点击结束=============
        app.endOperate(that);
      }, function (complete) {
      }
    )
  },
});