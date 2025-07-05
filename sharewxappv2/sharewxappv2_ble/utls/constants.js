/**
 *  match config
 *  过滤蓝牙名称 如果你不需要可以改下代码 如果需要获取更多的名称也要改下代码 就一个if没什么难度 过滤方法是startsWith
 *  我这里测试用了两个条件 代表我只要设备名称开头是TL 或TK的设备才能显示出来 只支持大写 因为在过滤中我将设备名称转为大写后再对比的
 *  如果需要根据服务UUID过滤可以考虑改一下我的代码 只需要在扫描中添加一些参数就可以了 这个比较简单了
 * 
 *  CONNECTTIME 连接超时时间 单位ms  但是我测试了 好像没啥用啊.... 有瑕疵
 *  SCANTIME  扫描超时时间 单位ms 默认5秒
 *  
 */
module.exports = {
  // string ble config
  'NOT_BLE': '您的蓝牙未打开，请打开手机蓝牙和GPS位置定位才能使用充电器。',
  'NOT_PERMISSION1': '您的系统版本过低,不支持蓝牙的使用',
  'NOT_PERMISSION2': '您的微信版本过低,不支持蓝牙的使用',
  'OPEN_BLE_TIP': '',
  'SCANING': '设备扫描中...',
  'SCANED': '已停止扫描',
  'ALARM_TITLE': '告警提示',
  // uuid config
  'SERUUID': '0000ffe0-0000-1000-8000-00805f9b34fb',
  'NOTIFYUUID': '0000ffe2-0000-1000-8000-00805f9b34fb',
  'WRITEUUID': '0000ffe1-0000-1000-8000-00805f9b34fb',
  //test data config
  'testData1': [0x01, 0x00, 0xff],
  // var config
  'STATE_DISCONNECTED': 0,
  'STATE_SCANNING': 1,
  'STATE_SCANNED': 2,
  'STATE_SCANNEND': 3,
  'STATE_CONNECTING': 4,
  'STATE_CONNECTED': 5,
  'STATE_CONNECTING_ERROR': 6,
  'STATE_NOTIFY_SUCCESS': 7,
  'STATE_NOTIFY_FAIL': 8,
  'STATE_CLOSE_BLE': 9,
  'STATE_NOTBLE_SYSTEM_VERSION': 10,
  'STATE_NOTBLE_WCHAT_VERSION': 11,
  'STATE_OPEN_SUCCESS': 12,
  'STATE_OPEN_FAIL': 13,
  // match config
  'CONDITION': 'EGO_{0}_01',
  // scan connect config  unit:ms
  'CONNECTTIME': 5000,
  'RECONNECTTIME': 8000,
  'SCANTIME': 10000,
}



