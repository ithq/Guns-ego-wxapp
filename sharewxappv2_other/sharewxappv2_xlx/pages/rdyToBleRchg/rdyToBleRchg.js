// pages/rdyToRchg/rdyToRchg.js
//显示充电密码页面
const utls = require('../../utls/utls.js')
const cmmn = require('../../utls/cmmn.js')
var bletools = require('../../utls/bletools.js');
var constants = require('../../utls/constants.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    tradeId: "",
    deviceNo: "",
    custNo: '',
    resourceUrl: app.glbParam.serverUrl,
    chargerId: '',
    messageShowView: true, //展示蓝牙开启蓝牙model
    needBluetooth: false, //是否必须开启蓝牙
    bleOpenFlag: false, //是否已开启蓝牙
    bleName: '', //蓝牙名称
    bleCode: '', //蓝牙解锁数据
    bleCodeResult: '', //蓝牙回复数据
    bleCharging: false, //蓝牙充电结果
    bleScaning: false, // 蓝牙扫描状态
    hTimeSecond: null, //使用时长定时器
    haveUsedSeconds: 0, //使用时长计时秒
    countHours: "00", //使用时长小时
    countMinutes: "00", //使用时长分钟
    countSeconds: "00", //使用时长秒
    showTitle: '请打开手机蓝牙和GPS位置定位，靠近充电器解锁充电',
    hTimeToRchg: null, //跳转密码充电定时器
    faultTorefund: false, // 故障上报开关
    bleReportTimeOut: null, //蓝牙上报程序
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.HomeBtnOnBind(this, "/pages/index/index");
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo');
    var chargerId = "";
    var deviceNo = "";
    var tradeId = "";
    var custNo = '';
    var needBluetooth = false;
    var bleCode = '';
    var bleName = '';
    if (responseInfo != null && responseInfo != undefined &&
      responseInfo.map != null && responseInfo.map != undefined) {
      chargerId = responseInfo.map.chargerId;
      deviceNo = responseInfo.map.deviceNo;
      tradeId = responseInfo.map.tradeId;
      custNo = responseInfo.map.custNo;
      // 蓝牙数据
      needBluetooth = responseInfo.map.needBluetooth ? true : false;
      bleCode = responseInfo.map.bleCode;
      bleName = responseInfo.map.bleName;
    }
    var faultTorefund = false;
    if (responseInfo && responseInfo.config) {
      faultTorefund = responseInfo.config.faultTorefund;
    }
    this.setData({
      responseInfo: responseInfo,
      tradeId: tradeId,
      deviceNo: deviceNo,
      chargerId: chargerId,
      custNo: custNo,
      bleCode: bleCode,
      needBluetooth: needBluetooth,
      bleName: bleName,
      faultTorefund: faultTorefund
    });

    // 开启蓝牙
    this.openBluetooth();
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
    let that = this;
    // 蓝牙没有充电，继续语音提示，打开手机蓝牙
    if (!that.data.bleCharging){
      that.onPlayVoice();
    }
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
    let that = this;
    // 1.卸载蓝牙模块
    bletools.clear();
    // 2.把语音停止播放
    that.innerAudioContext.pause();
    // 3.清空定时器
    if (that.data.hTimeToRchg) {
      clearTimeout(that.data.hTimeToRchg);
    }
    if (that.data.hTimeSecond) {
      clearInterval(that.data.hTimeSecond)
    }
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
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    that.innerAudioContext = wx.createInnerAudioContext();
    that.innerAudioContext.autoplay = true;
    that.innerAudioContext.src = "/img/voice/reblecharger.mp3";
    that.innerAudioContext.onPlay(() => { });
    that.innerAudioContext.onError((res) => { });
  },
  /**
   * 用户点击底边的故障上报
   */
  faultOption: function (e) {
    // 蓝牙版故障上报不能回退
    wx.redirectTo({
      url: '/pages/faultOption/faultOption'
    });
  },

  /**
   * 蓝牙版本先校验开启蓝牙
   * @return boolean
   */
  openBluetooth: function () {
    // 如果付款页面，蓝牙已经连接，直接获取特征
    let currentBle = wx.getStorageSync('currentBle');
    if (currentBle){
      wx.removeStorageSync('currentBle');
      // 初始化蓝牙
      bletools.setCurrentBle(this, currentBle);
    }else{
      bletools.initBle(this);
    }
  },
  /**
   * 蓝牙开启结果回调
   * @param boolean 蓝牙开启结果
   */
  bleOpenBluetoothEvent: function (res) {
    let that = this;
    if (res) {
      that.setData({
        bleOpenFlag: true,
        messageShowView: false,
        showTitle: '蓝牙启用成功，正在解锁充电...'
      });
      // 已经连接设备，不再连接
      if (bletools.getCurrentBle()) {
        return;
      }
      //这里有一个坑：IOS里面蓝牙状态变化以后不能马上开始搜索，否则会搜索不到设备，必须要等待2秒以上。
      setTimeout(function () {
        that.bleConnectBluetooth();
      }, 2000);
    } else {
      // 是否可以使用密码
      /*
      if (that.data.needBluetooth) {
        utls.altDialog('提示', '请手工开启蓝牙，才能进行充电', '确定', null)
      } else {
        utls.cnfmDialogForText('提示', '蓝牙连接失败，是否使用打开蓝牙解锁充电', function () {
          // 蓝牙解锁充电

        }, '蓝牙解锁', function () {
          // 密码解锁充电，跳到密码充电页面
          wx.redirectTo({
            url: '/pages/rdyToRchg/rdyToRchg'
          });
        }, '密码解锁', false);
      }
      */
    }
  },
  /**
   * 蓝牙扫描，匹配，连接
   */
  bleConnectBluetooth: function () {
    let that = this;
    let deviceName = that.data.bleName;
    //1.扫描蓝牙 
    bletools.startScanBle({
      deviceName: deviceName,
      success: device => {
        // 2.停止蓝牙扫描
        console.info('2.停止蓝牙扫描');
        bletools.stopBluetoothDevicesDiscovery();
        // 3.连接蓝牙
        setTimeout(function () {
          console.info('3.连接蓝牙');
          bletools.connectBle(device);
        }, 2000)

        //4.发送蓝牙开锁命令 
        //5.接受蓝牙数据
        //6.上报后台
        //7.关闭蓝牙连接
      }
    })
  },
  /**
   * 蓝牙写入数据
   */
  bleWriteCode: function () {
    let that = this;
    var datas = bletools.hexString2Bytes(that.data.bleCode);
    bletools.write(datas)
    console.info('4.发送蓝牙开锁命令 ');
  },
  /**
   * 发送数据结果 true or false
   * 如果为false msg是失败原因
   */
  writeListener: function (result, msg) {
    let that = this;
    //此处可以执行自己的逻辑 比如一些提示
    console.log(result ? '发送数据成功' : msg)
    console.info('4.发送蓝牙开锁命令成功');

    // 发送数据成功，基本上已经成功充电
    var hTimeSecond = that.data.hTimeSecond;
    if (null == hTimeSecond){
      hTimeSecond = setInterval(function () {
        that.readSecondForRecharge();
      }, 1000);
    }
    that.setData({
      bleCharging: true,
      showTitle: '充电器已解锁，请充电...',
      hTimeSecond: hTimeSecond,
      haveUsedSeconds: 0,
      countHours: "00",
      countMinutes: "00",
      countSeconds: "00"
    });
  },
  /**
   * 接收数据 
   */
  notifyListener: function (data) {
    let that = this;
    // 接收到蓝牙数据
    console.info('5.接受蓝牙数据');
    var bleCodeResult = bletools.bytes2HexString(data);
    that.setData({
      bleCodeResult: that.data.bleCodeResult + bleCodeResult
    });
    // 微信蓝牙会分包接收，第一次接收数据5秒钟之内，才开始上报后台
    if(that.data.bleReportTimeOut){
      return;
    }
    //接收数据上报到后台
    console.info('6.上报后台');
    var timeOut = setTimeout(function(){
      that.bleReportRsp();

      console.info('7.关闭蓝牙连接');
      bletools.disconnect();
    }, 5000);
    that.setData({bleReportTimeOut: timeOut});
  },

  /**
   * 蓝牙回调上报后台服务
   */
  bleReportRsp: function () {
    let that = this;
    //1.1 参数加密
    var code = app.glbParam.code;
    var custNo = that.data.custNo;
    var chargerId = that.data.chargerId;
    var tradeId = that.data.tradeId;
    var bleCode = that.data.bleCode;
    var bleCodeRslt = that.data.bleCodeResult;
    var keycode = cmmn.getKeyCode([custNo, chargerId, tradeId, bleCode, bleCodeRslt], code);
    //2. 请求后台处理充电.
    utls.wxRequsetForPost("wxapp", "reportForRecharge", {
      custNo: custNo,
      chargerId: chargerId,
      tradeId: tradeId,
      bleCode: bleCode,
      bleCodeRslt: bleCodeRslt,
      keyCode: keycode,
      session3rd: app.glbParam.ssn_3rd
    }, function (success) {
      //1. 后台调用成功
      that.setData({
        bleCharging: true,
        showTitle: '充电器已解锁，请充电...'
      });
      //取消重复点击结束=============
      app.endOperate(that);
    }, function (fail) {

    }, function (complete) {
      //取消重复点击开始=============
      app.endOperate(that);
      //取消重复点击结束=============
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
      case constants.STATE_DISCONNECTED: //设备连接断开
        console.log('设备连接断开')
        // 充电中不在提示
        if (that.data.bleCharging) {
          return;
        }
        that.setData({
          bleOpenFlag: false,
          messageShowView: true,
          showTitle: '请打开手机蓝牙和GPS位置定位，靠近充电器解锁充电'
        });
        break;
      case constants.STATE_SCANNING: //设备正在扫描
        that.setData({
          bleScaning: true
        })
        console.log('设备正在扫描')
        break;
      case constants.STATE_SCANNED: //设备扫描结束
        console.log('设备扫描结束')
        if (that.data.bleScaning) {
          that._autoJumpRdyToRchg();
          that.setData({
            bleScaning: false
          })
        }
        break;
      case constants.STATE_CONNECTING: //设备正在连接
        console.log('设备正在连接')
        break;
      case constants.STATE_CONNECTED: //设备连接成功
        console.log('设备连接成功')
        // 发送蓝牙解锁数据
        // that.bleWriteCode();
        break;
      case constants.STATE_CONNECTING_ERROR: //连接失败
        console.log('连接失败')
        break;
      case constants.STATE_NOTIFY_SUCCESS: //开启notify成功
        console.log('开启notify成功')
        // 蓝牙特征获取成功后，发送解锁数据
        that.bleWriteCode();
        break;
      case constants.STATE_NOTIFY_FAIL: //开启notify失败
        console.log('开启notify失败')
        break;
      case constants.STATE_CLOSE_BLE: //蓝牙未打开 关闭状态
        //utls.altDialog('提示', constants.NOT_BLE, '确定', null)
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
    // 蓝牙扫描结束后，15秒没有充电成功跳转到密码界面
    if (that.data.hTimeToRchg){
      clearTimeout(that.data.hTimeToRchg);
    }
    let hTimeToRchg = setTimeout(function () {
      if (that.data.bleCharging || that.data.bleScaning || bletools.getCurrentBle()) {
        return;
      }
      if (that.data.needBluetooth) {
        // 必须使用蓝牙时，只能是提示用户开启蓝牙，靠近设备重试了
        // 这里多次重试之后，是否提示用户走退款通道
        utls.altDialog('提示', '解锁充电器失败，请打开手机蓝牙和GPS位置定位，靠近充电器重试', '确定', function () {
          that.bleConnectBluetooth();
        })
      } else {
        // 此时已然没有充电成功，跳转到密码界面进行充电
        that.fnGetPassWord();
      }
    }, 15000);
    that.setData({ hTimeToRchg: hTimeToRchg })
  },
  /**
   * 点击获取密码按钮
   */
  fnGetPassWord: function () {
    let that = this;
    //1. 把语音停止播放
    that.innerAudioContext.pause();
    //2. 跳转输入密码界面
    wx.redirectTo({
      url: '/pages/rdyToRchg/rdyToRchg'
    });
  },
  /**
   * 点击开启蓝牙
   */
  fnOpenBluetooth: function () {
    //开启蓝牙
    utls.altDialog('提示', '请打开手机蓝牙和GPS位置定位，靠近充电器重试', '确定', null);
  },
  /**
   * 读对充电时间读秒
   */
  readSecondForRecharge: function() {
    var haveUsedSeconds = parseInt(this.data.haveUsedSeconds) + 1;
    var seconds = haveUsedSeconds;
    var hours = parseInt(seconds / 3600);
    seconds = Math.round(seconds % 3600);
    var minutes = parseInt(seconds / 60);
    seconds = Math.round(seconds % 60);
    var countHours = this.pad(hours, 2);
    var countMinutes = this.pad(minutes, 2); 
    var countSeconds = this.pad(seconds, 2);
    this.setData({
      haveUsedSeconds: haveUsedSeconds,
      countHours: countHours,
      countMinutes: countMinutes,
      countSeconds: countSeconds
    })
  },
  /**
   * 右边截取
   */
  pad: function(num, n){
    return ("00"+num).substr(-n);
  }
})