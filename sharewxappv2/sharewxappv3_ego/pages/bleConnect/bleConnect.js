// pages/bleConnect/bleConnect.js
const utls = require('../../utls/utls.js')
var bletools = require('../../utls/bletools.js');
var constants = require('../../utls/constants.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    audioContext: null, // 音频播放
    advertImage: '', //广告图片
    getLocationFlag: false, //是否启用位置
    needBluetooth: false, //是否必须开启蓝牙
    bleName: '', // 蓝牙名称
    bleInitFlag: false, //蓝牙初始化
    bleOpenFlag: false, //是否已开启蓝牙
    bleScaning: false, // 蓝牙是否在搜索
    bleConnected: false, // 蓝牙设备连接状态
    hTimeToRchg: null, //蓝牙连接超时时间
    scanBleCount: 0, //蓝牙搜索次数
    jumpRdyToBleRchgFlag: false, //跳到蓝牙充电器界面
    progressNum: 0, //蓝牙连接进度条
    hTimeProgress: null, //进度条Timer
    posTitle: "请在手机的设置，打开手机GPS位置信息。", //位置信息提示
    bleTitle: "请在手机的设置，打开手机蓝牙。", //蓝牙信息提示
    bleStatus: "等待初始化蓝牙。", //蓝牙连接状态
    fromPage: 'scnRslt', //从那个页面跳转过来的
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options && options.fromPage){
      this.setData({
        fromPage: options.fromPage
      })
    }
    // 创建前景音上下文对象
    if(wx.createInnerAudioContext){
      this.setData({
        audioContext: wx.createInnerAudioContext() 
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
    //取缓存数据
    var responseInfo = wx.getStorageSync('responseInfo');
    that.setData({responseInfo:responseInfo})
    //加载数据，渲染视图
    that.loadView();
    // 语音播放
    that.onPlayVoice();

    that.startProgress();
  },

  loadView: function () {
    var that = this;
    var responseInfo = that.data.responseInfo;
    // 1.加载广告图 
    var advertImage = '/img/img/rdyToBleRchgBg.jpg';
    var advertInfo = app.getAdvertInfo(5);
    if(advertInfo){
      advertImage = advertInfo.images;
    }

    //2.蓝牙信息
    var needBluetooth = (responseInfo.needBluetooth?true:false);
    var bleName = responseInfo.bleName!=undefined?responseInfo.bleName:'';

    //3.开启位置
    that.locationInit();

    //处理参数..
    this.setData({
      advertImage: advertImage,//背景图片需要
      needBluetooth: needBluetooth,
      bleName: bleName,
      bleOpenFlag: false,
      bleScaning: false,
      bleConnected: false,
      jumpRdyToBleRchgFlag: false,
      isInit: true
    })
    // 6.蓝牙设备打开蓝牙
    if (needBluetooth){
      that.bleInit();
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
    // 页面被关闭
    var that = this;
    // 1.关闭蓝牙连接
    if (that.data.needBluetooth) {
      if(!that.data.jumpRdyToBleRchgFlag){
        bletools.disconnect();
        bletools.clear();
      }
    }
    // 2.把语音停止播放
    that.data.audioContext.pause();
    // 3.关闭定时器
    that.data.hTimeProgress && clearInterval(that.data.hTimeProgress);
  },

  /**
   * 初始化位置
   */
  locationInit: function(){
    var that = this;
    wx.getLocation({
      type: 'gcj02', //默认，获取经纬度
      success: (res) => {
        that.setData({
          getLocationFlag: true,
          posTitle: "GPS位置信息初始化成功。"
        })
      },
      fail: (res) => {
        that.setData({
          getLocationFlag: false,
          posTitle: "在手机的设置，打开手机GPS位置信息。"
        })
      }
    })
  },
  /**
   * 开启蓝牙进度条
   */
  startProgress: function(){
    var that = this;
    that.data.hTimeProgress && clearInterval(that.data.hTimeProgress);
    let hTimeProgress = setInterval(function(){
        // 蓝牙连接进度条
        let progressNum = that.data.progressNum + 1;
        if(progressNum >= 100){
          clearInterval(that.data.hTimeProgress);
          that.setData({
            progressNum: 100,
            hTimeProgress: null
          })
          return;
        }
        that.setData({
          progressNum: progressNum
        })
      }, 125);
      that.setData({
        hTimeProgress: hTimeProgress
      })
  },
  /**
   * 蓝牙初始化
   */
  bleInit: function(){
    bletools.initBle(this);
    this.setData({
      bleInitFlag: true,
      bleOpenFlag: false,
      bleScaning: false,
      bleConnected: false
    });
  },

  /**
   * 蓝牙开启结果回调
   * @param res 蓝牙开启结果
   */
  bleOpenBluetoothEvent: function (res) {
    let that = this;
    if(!that.data.needBluetooth){
      return;
    }
    // 重新获取位置
    if(!that.data.getLocationFlag){
      that.locationInit();
    }
    // 开始蓝牙搜索
    let bleTitle = "";
    let bleStatus = "";
    let hTimeToRchg = that.data.hTimeToRchg;
    if (res) {
      console.info('进度条显示连接进度')
      // 进度条显示连接进度
      that.startProgress();
      //这里有一个坑：IOS里面蓝牙状态变化以后不能马上开始搜索，否则会搜索不到设备，必须要等待2秒以上。
      hTimeToRchg = setTimeout(function () {
        that.bleConnectBluetooth();
      }, 2000);
      bleTitle = "蓝牙初始化成功。"
      bleStatus = "正在连接设备..."
    } else {
      bleTitle = "请在手机的设置，打开手机蓝牙。"
      bleStatus = "等待初始化蓝牙。"
    }
    
    that.setData({ 
      bleOpenFlag: res, 
      hTimeToRchg: hTimeToRchg,
      bleTitle: bleTitle,
      bleStatus: bleStatus
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
        that.setData({
          bleScaning: false
        })
        console.log('设备扫描结束')
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
          progressNum: 100,
          bleConnected: true,
          jumpRdyToBleRchgFlag: true,
          bleStatus: "设备连接成功，现在可以付款充电了。"
        });
        utls.alert('提示', '设备连接成功，现在可以付款充电了。', '确定', function(){
          wx.setStorageSync('bleConnected', true);
          wx.redirectTo({
            url: '/pages/scnRslt/scnRslt'
          })
        });
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
        this.data.hTimeProgress && clearInterval(that.data.hTimeProgress);
        // 必须使用蓝牙时，只能是提示用户开启蓝牙，靠近设备重试了
        utls.alert('提示', '连接充电器失败，请打开手机蓝牙和GPS位置定位，靠近充电器重试', '我知道了', function () {
          that.setData({
            progressNum: 0,
            hTimeProgress: null
          })
          // 进度条显示连接进度
          that.startProgress();
          that.bleConnectBluetooth();
        })
      } else {
        // 搜索2次再进行提示
        that.bleConnectBluetooth();
      }
    }
  },
  /**一进入时进行语音播报*/
  onPlayVoice: function () {
    var that = this;
    if (!that.data.audioContext) {
      let audioContext = wx.createInnerAudioContext();
      that.setData({
        audioContext: audioContext
      })
    }
    that.data.audioContext.autoplay = true;
    that.data.audioContext.src = "/img/voice/reblecharger.mp3";
      that.data.audioContext.onPlay(() => {
    });
    that.data.audioContext.onError((res) => {

    });
  },
  /**
   * 打开定位
   */
  openLocation: function(e){
    let that = this;
    if (!app.showLoadingForFirstOperate(that, "加载中...")) {
      return;
    }
    utls.alert(
        '开启地理位置权限',
        '请开启手机定位服务',
        '我知道了',
        function() {
          // 确定
        },
        function (){
          app.endOperate(that);
        }
    );
  },
  /**
   * 开启蓝牙
   */
  openBluetooth: function(e){
    let that = this;
    if (!app.showLoadingForFirstOperate(that, "加载中...")) {
      return;
    }
    utls.alert(
      '温馨提醒',
      '请打开手机蓝牙，并授权给本应用。',
      '我知道了',
      function (){
        // 确定
      },
      function() {
        app.endOperate(that);
      }
    );
  }

})