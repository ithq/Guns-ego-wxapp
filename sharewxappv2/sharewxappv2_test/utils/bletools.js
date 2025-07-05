var constants = require('/constants.js');
//当前连接设备
var currentBle = null
// page的实例对象 用来回调处理结果回去 
var _this = null
// 扫描超时TimeHandle
var timeOut= null
// 重新连接定时器
var connHandle = null
// 连接成功标记
var connectFlag = null;

/**
 * 写入数据至设备 
 * data 16进制数组
 */
function write(data) {
  let buffer = new ArrayBuffer(data.length)
  let dataView = new DataView(buffer)
  for (var i = 0; i < data.length; i++) {
    dataView.setUint8(i, data[i])
  }
  //写数据
  wx.writeBLECharacteristicValue({
    deviceId: currentBle,
    serviceId: constants.SERUUID,
    characteristicId: constants.WRITEUUID,
    value: buffer,
    success: res => {
      _this.writeListener(true)
    },
    fail: res => {
      _this.writeListener(false, getErrorInfo(res.errCode))
    }
  })
}
/**
 * 写入数据至设备 
 * data 16进制数组
 * timeOut 延时发送数据
 */
function write_delay(data, timeOut) {
  setTimeout(function () {
    let buffer = new ArrayBuffer(data.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < data.length; i++) {
      dataView.setUint8(i, data[i])
    }
    //写数据
    wx.writeBLECharacteristicValue({
      deviceId: currentBle,
      serviceId: constants.SERUUID,
      characteristicId: constants.WRITEUUID,
      value: buffer,
      success: res => {
        _this.writeListener(true)
      },
      fail: res => {
        _this.writeListener(false, getErrorInfo(res.errCode))
      }
    })
  }, timeOut)
}

/**
 * 写入数据至设备，分包20字节
 * data 16进制数组
 */
function write2(data) {
  for(var i = 0; i < data.length; i += 20){
    var toIndex = (i + 20) > data.length ? data.length : (i + 20);
    var temp = data.slice(i, toIndex);
    //发送蓝牙数据，每个数据之间延迟200ms
    write_delay(temp, i * 200);
  }
}

/**
 * 扫描蓝牙  扫描时先断开连接 避免在连接时同时扫描 因为他们都比较消耗性能 容易导致卡顿等不良体验
 */
function startScanBle(obj) {
  disconnect()
  //监听寻找到新设备的事件
  wx.onBluetoothDeviceFound((devices) => {
    var bleDevice = devices.devices[0]
    //获取名称 效验名称
    var deviceName = bleDevice.name;
    // 过滤 
    console.log(bleDevice.deviceId + ' / ' + deviceName); //打印扫描到的mac地址
    constants.CONDITION = obj.deviceName;
    if (deviceName.toUpperCase().startsWith(constants.CONDITION)) {
      // 扫描结果暴露出去 
      obj.success(bleDevice)
    }
  })
    //扫描附近的外围设备
  wx.startBluetoothDevicesDiscovery({})
  if (timeOut != null){
    console.log('有扫描任务在进行 先清除任务')
    clearTimeout(timeOut)
  }
  //时间到停止扫描
  timeOut = setTimeout(function() {
    //停止搜寻附近的蓝牙外围设备
    wx.stopBluetoothDevicesDiscovery({})
    timeOut= null
    _this.bleStateListener(constants.STATE_SCANNEND)
  }, constants.SCANTIME)
}

/**
 * 初始化蓝牙适配器
 */
function _initBleTools() {
  //初始化蓝牙适配器
  wx.openBluetoothAdapter({
    success: function(res) {
      console.log("初始化蓝牙适配器成功")
      // 蓝牙开启成功回调事件
      _this.bleStateListener(constants.STATE_OPEN_SUCCESS);
    },
    fail: function(err) {
      //在用户蓝牙开关未开启或者手机不支持蓝牙功能的情况下，调用 wx.openBluetoothAdapter 会返回错误（errCode=10001），表示手机蓝牙功能不可用
      if (err.errCode == 10001) {
        _this.bleStateListener(constants.STATE_CLOSE_BLE)
        _this.bleStateListener(constants.STATE_OPEN_FAIL);
      }
    },
    complete(res) {
      //监听蓝牙适配器状态变化事件
      wx.onBluetoothAdapterStateChange(res => {
        if (res.available) {
          // 蓝牙模块是否可用回调事件
          _this.bleStateListener(constants.STATE_OPEN_SUCCESS);
          // 蓝牙模块是否处于搜索状态
          if (res.discovering) {
            _this.bleStateListener(constants.STATE_SCANNING)
          } else {
            _this.bleStateListener(constants.STATE_SCANNED)
          }
        }
      })
    }
  })
  
}

/**
 * 连接设备的函数 传入对象device即可 在该函数中连接成功后 就会启动监听特征变化用来获取数据
 */
function connectBle(device) {
  disconnect()
  //获取到设备的deviceId地址
  var deviceId = device.deviceId
  //连接时停止扫描 避免连接与扫描在同时进行消耗性能 可能会导致卡顿等影响 如果你需要扫描请注释此代码 对逻辑不会有影响
  wx.stopBluetoothDevicesDiscovery({})
  //记录本次连接的设备 当再次扫描时 本次连接就需要断开 因为蓝牙的扫描和连接都需要高消耗 避免两个操作同时进行
  currentBle = deviceId
  //开始本次连接
  _this.bleStateListener(constants.STATE_CONNECTING)
  wx.createBLEConnection({
    deviceId: deviceId,
    timeOut: constants.CONNECTTIME,
    success: function (res) {
      // 连接蓝牙成功
      if (!connectFlag){
        connectFlag = true
        _this.bleStateListener(constants.STATE_CONNECTED)
        //获取所有的服务 不获取不影响Android的蓝牙通信 但是官方文档说会影响ios 所以按照文档来 
        _getDevices(deviceId)
      }
    },
    fail: err => {
      //蓝牙已经断开连接了  那么当前连接设备要取消掉
      currentBle = null
      console.log('连接失败 下面是连接失败原因')
      console_dir(err)
      //10003 手机有些需要等10秒左右才能连接
      if (err.errCode == 10003 && connHandle == null) {
        var connHandle = setTimeout(function () {
          connectBle(device);
        }, constants.RECONNECTTIME);
      }else{
        _this.bleStateListener(constants.STATE_CONNECTING_ERROR)
      }
    },
    complete: function () {
      // 无论蓝牙是否连接成功都会进事件
      //监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
      wx.onBLEConnectionStateChange(res => {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        if (res.connected) {
          if (!connectFlag){
            connectFlag = true
            _this.bleStateListener(constants.STATE_CONNECTED)
            //获取所有的服务 不获取不影响Android的蓝牙通信 但是官方文档说会影响ios 所以按照文档来 
            _getDevices(deviceId)
          }
        } else {
          _this.bleStateListener(constants.STATE_DISCONNECTED)
          //蓝牙已经断开连接了  那么当前连接设备要取消掉
          currentBle = null
          connectFlag = null
        }
      })
    }
  })
  
}

/**
 * 获取已连接设备的所有服务
 */
function _getDevices(deviceId) {
  wx.getBLEDeviceServices({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    success: res => {
      var servicesArray = res.services
      for (var i = 0; i < servicesArray.length; i++) {
        var services = servicesArray[i].uuid
        if (constants.SERUUID.toUpperCase() === services) {
          console.log('查找服务成功')
          constants.SERUUID = services
          _getCharacteristic(deviceId, services)
          break;
        }
      }
    },
    fail(err) {
      console.log("没有找到服务")
    }
  })
}

//服务uuid已经找到  
//获取蓝牙设备某个服务中所有特征值(characteristic)。
function _getCharacteristic(deviceId, services) {
  wx.getBLEDeviceCharacteristics({
    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
    deviceId: deviceId,
    // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
    serviceId: services,
    success: (res) => {
      var characteristicsArray = res.characteristics
      for (var i = 0; i < characteristicsArray.length; i++) {
        var characteristics = characteristicsArray[i].uuid
        //这里有两种情况 1.同一个uuid具备写和通知通过 2.通知和写是两个uuid
        if (constants.NOTIFYUUID.toUpperCase() === characteristics) {
          console.log('查找通知服务成功')
          constants.NOTIFYUUID = characteristics
        }
        if (constants.WRITEUUID.toUpperCase() === characteristics) {
          console.log('查找写服务成功')
          constants.WRITEUUID = characteristics
        }
      }
      _startNotifyListener(deviceId)
    }
  })
}

//启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
function _startNotifyListener(deviceId) {
  wx.notifyBLECharacteristicValueChange({
    deviceId: deviceId,
    serviceId: constants.SERUUID,
    characteristicId: constants.NOTIFYUUID,
    state: true,
    success: res => {
      //启动成功后 监听数据变化
      _onNotifyListener()
      _this.bleStateListener(constants.STATE_NOTIFY_SUCCESS)
    },
    fail: res => {
      _this.bleStateListener(constants.STATE_NOTIFY_FAIL)
      console.log("开启监听失败 下面是开启监听失败的原因")
      console_dir(res)
    }
  })
}

//监听低功耗蓝牙设备的特征值变化。必须先启用 notifyBLECharacteristicValueChange 接口才能接收到设备推送的 notification。
function _onNotifyListener() {
  wx.onBLECharacteristicValueChange(res => {
    //转换数据
    let buffer = res.value
    let dataView = new DataView(buffer)
    let dataResult = []
    for (let i = 0; i < dataView.byteLength; i++) {
      dataResult.push(dataView.getUint8(i).toString(16))
    }
    const result = dataResult
    _this.notifyListener(result)
  })
}

//停止搜寻附近的蓝牙外围设备
function stopBluetoothDevicesDiscovery() {
  wx.stopBluetoothDevicesDiscovery({})
}

/**
 * 释放资源
 */
function clear() {
  if (connHandle){
    clearTimeout(connHandle);
    connHandle = null;
  }
  if (timeOut){
    clearTimeout(timeOut);
    timeOut = null;
  }
  wx.closeBluetoothAdapter({
    success: function(res) {
      console.log("销毁页面 释放适配器资源")
    }
  })
}

/**
 * 获取系统及系统版本及微信版本
 *   iOS 微信客户端 6.5.6 版本开始支持，Android 6.5.7 版本开始支持  ble
 *    Android 8.0.0 -> res.system
 *    6.7.3 -> res.version
 *    android -> res.platform
 */
function initBle(that) {
  _this = that
  try {
    // 同步获取系统信息 反之有异步 自己根据情况使用
    const res = wx.getSystemInfoSync()
    var tempPlatform = res.platform
    var tempVersion = res.version
    var tempSystem = res.system
    //判断用户当前的微信版本是否支持ble
    _checkPermission(tempPlatform, tempVersion, tempSystem)
  } catch (e) {
    // Do something when catch error
  }
}

/**
 * 判断微信客户端是否支持使用蓝牙API
 */
function _checkPermission(platform, version, tempSystem) {
  if (wx.openBluetoothAdapter){
    //支持ble 初始化蓝牙适配器
    _initBleTools()
  }else{
    //不支持ble  微信版本过低
    _this.bleStateListener(constants.STATE_NOTBLE_WCHAT_VERSION)
  }
}
/**
 * 断开当前连接
 */
function disconnect(){
  // 1.断开连接(如果有连接的话) 
  connectFlag = null
  //当前正在连接的设备 当前也可能没有设备连接
  var ble = currentBle
  if (ble != null) {
    console.log("有设备在连接中")
    //说明当前有设备在连接 需要执行断开操作
    wx.closeBLEConnection({
      deviceId: ble
    })
  } else {
    console.log("没有设备在连接中")
  }
}

/**
 * 获取当前的蓝牙连接
 */
function getCurrentBle(){
  return currentBle;
}
/**
 * 设置当前蓝牙连接
 */
function setCurrentBle(that,deviceId){
  _this = that
  console.log('----连接状态'+ connectFlag)
  console.log('----' + JSON.stringify(currentBle))
  // 设置当前的连接
  currentBle = deviceId;
  if (connectFlag) {
    connectFlag = true;
    // 蓝牙开启成功回调事件
    _this.bleStateListener(constants.STATE_OPEN_SUCCESS);
    console.log('----获取所有的服务')
    //获取所有的服务 不获取不影响Android的蓝牙通信 但是官方文档说会影响ios 所以按照文档来 
    _getDevices(deviceId)
  }
}

/**
 * 十六进制字符串转字节数组，跟网上demo一样
 */
function hexString2Bytes(str) {
  var pos = 0;
  var len = str.length;
  if (len % 2 != 0) {
    return null;
  }
  len /= 2;
  var arrBytes = new Array();
  for (var i = 0; i < len; i++) {
    var s = str.substr(pos, 2);
    var v = parseInt(s, 16);
    arrBytes.push(v);
    pos += 2;
  }
  return arrBytes;
}

/**
 * 字节数组转十六进制字符串，对负值填坑
 */
function bytes2HexString(arrBytes) {
  var str = "";
  for (var i = 0; i < arrBytes.length; i++) {
    var tmp;
    var num = arrBytes[i];
    if (num < 0) {
      //此处填坑，当byte因为符合位导致数值为负时候，需要对数据进行处理
      tmp = (255 + num + 1).toString(16);
    } else {
      tmp = num.toString(16);
    }
    if (tmp.length == 1) {
      tmp = "0" + tmp;
    }
    str += tmp;
  }
  return str;
}
/**
 * 有些设备不支持console.dir输入，在这里trycatch
 */
function console_dir(info) {
  try {
    console.dir(info);
    console.log(info);
  } catch (e) {
    console.log(info);
  }
}
/**
 *错误码定义
 */
function getErrorInfo(code) {
  var errorInfo = ''
  switch (code) {
    case 0:
      errorInfo = '正常'
      break;
    case 10000:
      errorInfo = '未初始化蓝牙适配器'
      break;
    case 10001:
      errorInfo = '当前蓝牙适配器不可用 未初始化蓝牙适配器？ 或是你的手机蓝牙处于关闭状态'
      break;
    case 10002:
      errorInfo = '没有找到指定设备'
      break;
    case 10003:
      errorInfo = '连接失败'
      break;
    case 10004:
      errorInfo = '没有找到指定服务'
      break;
    case 10005:
      errorInfo = '没有找到指定特征值'
      break;
    case 10006:
      errorInfo = '当前连接已断开'
      break;
    case 10007:
      errorInfo = '当前特征值不支持此操作'
      break;
    case 10008:
      errorInfo = '其余所有系统上报的异常'
      break;
    case 10009:
      errorInfo = 'Android 系统特有，系统版本低于 4.3 不支持 BLE'
      break;
    default:
      errorInfo = '其他错误 可能本方法定义的错误码已更新不上官方的错误码 也可能是未知错误'
      break;
  }
  return errorInfo
}
module.exports = {
  write,//写数据
  write2,//写数据,支持分包
  startScanBle,//开始扫描
  clear,//退出释放资源
  stopBluetoothDevicesDiscovery,//停止扫描
  connectBle,//连接设备
  initBle,//初始化蓝牙模块
  disconnect,//断开连接
  getCurrentBle, // 获取当前的蓝牙连接
  setCurrentBle, // 设置当前的蓝牙连接
  hexString2Bytes, //十六进制字符串转字节数组
  bytes2HexString //字节数组转十六进制字符串
}