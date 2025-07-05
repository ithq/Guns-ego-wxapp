const api = require("../config/api.js");

const common = require("../language/common.js");

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const setLanguage = () => {
  try {
    const res = wx.getSystemInfoSync();
    const lang = res.language;

    switch (lang) {
      case 'zh_CN':
        wx.setStorageSync('zhengdeLanguage', 'zh-CN');
        break;
      case 'zh_TW':
        wx.setStorageSync('zhengdeLanguage', 'zh-TW');
        break;
      case 'en':
        wx.setStorageSync('zhengdeLanguage', 'en-US');
        break;
      default:
        wx.setStorageSync('zhengdeLanguage', 'zh-CN');
        break;
    }
  } catch (e) {
    wx.setStorageSync('zhengdeLanguage', 'zh-CN');
  }
}

// 语言类型
const getLanguageType = () => {
  let type = wx.getStorageSync('zhengdeLanguage') || "zh_CN";
  let language = 0;
  switch (type) {
    case 'zh_CN':
      language = 0;
      break;
    case 'en':
      language = 1;
      break;
    case 'zh_TW':
      language = 2;
      break;
    default:
      language = 0;
      break;
  }
  return language;
}

// 获取语言
const getLanguage = (LanguagePack) => {
  return LanguagePack.language[getLanguageType()];
}

const commonLg = getLanguage(common);

// 延时函数
const throttle = (fn, gapTime) => {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  // 返回新的函数
  let _lastTime = null
  return function () {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

// 返回键
const goBack = (delta = 1) => {
  const pages = getCurrentPages();
  if (pages.length >= 2) {
    wx.navigateBack({
      delta: delta
    });
  } else {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  }
}

//弹框提示
const showToast = (msg, icon = 'none', duration = 2000) => {
  wx.showToast({
    title: msg,
    icon: icon,
    duration: duration
  })
}

// 去除字符串内所有的空格
const removeSpaces = (str) => {
  return str.replace(/\s*/g, "");
}

// 去除字符串内两头的空格
const removeTwoSpaces = (str) => {
  return str.replace(/^\s*|\s*$/g, "");
}

// 对金额的处理（保留两位小数位， 每隔三位添加‘，’）
const moneyFormato = (value, num) => {
  num = num > 0 && num <= 20 ? num : 2;
  value = parseFloat((value + "").replace(/[^\d\.-]/g, "")).toFixed(num) + ""; //将金额转成比如 123.45的字符串
  var valueArr = value.split(".")[0].split("").reverse() //将字符串的数变成数组
  const valueFloat = value.split(".")[1]; // 取到 小数点后的值
  let valueString = "";
  for (let i = 0; i < valueArr.length; i++) {
    valueString += valueArr[i] + ((i + 1) % 3 == 0 && (i + 1) != valueArr.length ? "," : ""); //循环 取数值并在每三位加个','
  }
  const money = valueString.split("").reverse().join("") + "." + valueFloat; //拼接上小数位
  return money
}

// 隐藏中间手机号码4位
const telFormat = (tel) => {
  var reg = /^(\d{3})\d{4}(\d{4})$/;
  return tel.replace(reg, "$1****$2");
}

// 米-公里单位换算
const lengthUnitFormat = (distance) => {
  if (distance < 1000) {
    return distance + "m"
  } else if (distance > 1000) {
    return (Math.round(distance / 100) / 10).toFixed(1) + "km"
  } else {
    return distance
  }
}

// 租借状态
const borrowState = (state, language) => {
  switch (state) {
    case 0:
      return language['noRented']
      break;
    case 1:
      return language['requesting']
      break;
    case 2:
      return language['leased']
      break;
    case 3:
      return language['revoked']
      break;
    case 4:
      return language['trouble']
      break;
    case 5:
      return language['returned']
      break;
    case 6:
      return language['purchase']
      break;
    case 8:
      return language['timeout']
      break;
    case 9:
      return language['deleted']
      break;
    default:
      return state
      break;
  }
}

// 时间差，默认结束时间为当前时间， 返回时间差 秒数
const diffTime = (begintime, endtime) => {
  let dateBegin = new Date(begintime.replace(/-/g, "/"));//将-转化为/，使用new Date
  let dateEnd = new Date();//获取当前时间
  if (endtime) {
    dateEnd = new Date(endtime.replace(/-/g, "/")); 
  }
  return (dateEnd.getTime() - dateBegin.getTime()) / 1000 //时间差 秒数
}

// 时间差格式
const diffTimeFormat = (dateDiff) => {
  if(dateDiff <= 0){
    return ["00", "00", "00"].map(formatNumber).join(':')
  };
  let days = parseInt(dateDiff / (60 * 60 * 24 ));     //计算天数
  let hours = parseInt((dateDiff - (days * 60 * 60 * 24)) / (60 * 60));   //计算小时
  let minutes = parseInt((dateDiff - (days * 60 * 60 * 24) - (hours * 60 * 60)) / (60));    //计算分钟
  let seconds = parseInt((dateDiff - (days * 60 * 60 * 24) - (hours * 60 * 60) - (minutes * 60)));  //计算秒数
  let allHours = days > 0 ? 24 * days + hours : hours;
  return [allHours, minutes, seconds].map(formatNumber).join(':')
}

// 分钟 => 00:00:00
const leaseUseTime = (useTime) => {
  let day, hour, hours, minutes, seconds;
  day = parseInt(useTime / (60 * 24));
  hour = parseInt((useTime % (60 * 24)) / 60);
  minutes = parseInt(useTime % 60);  
  seconds = 0;
  hours = day > 0 ? day * 24 + hour : hour;
  return [hours, minutes, seconds].map(formatNumber).join(':')
}

// 打开扫描
const scanCode = () => {
  wx.scanCode({
    onlyFromCamera: true,
    success: (res) => {
      if (res.errMsg == "scanCode:ok") {
        console.log(res.result)
        var qrCodeUrl = res.result;
        var qrCodeArr = qrCodeUrl.split("/");
        var type = qrCodeArr[qrCodeArr.length - 3];
        var qrcode = qrCodeArr[qrCodeArr.length - 1];

        var externalCode = {
          type: type,
          qrcode: qrcode
        };
        wx.setStorageSync('externalCode', JSON.stringify(externalCode));
        
        // 域名对比
        // if (api.apiRootUrl.indexOf(qrCodeArr[2]) == -1) {
        //   showToast(commonLg.correspond);
        //   return false;
        // }

        switch (type) {
          case 'cdb':
            wx.navigateTo({
              url: '/pages/rental/rental?qrcode=' + qrcode,
            });
            break;
          case 'mmx':
            wx.navigateTo({
              url: '/pages/line/lease/lease?qrcode=' + qrcode,
            });
            break;
          case 'bluetooth': 
            // 为了不影响原有的蓝牙线，使用新的page
            if (qrcode.startsWith('70')){
              wx.navigateTo({
                url: '/pages/ble/lease/lease?qrcode=' + qrcode,
              });
            } else {
              wx.navigateTo({
                url: '/pages/bluetooth/lease/lease?qrcode=' + qrcode,
              });
            }
            break;
          default:
            showToast(commonLg.correspond);
            break;
        }
      } else {
        console.log("扫码失败");
      }
    },
    fail: (err) => {
      // showToast(errMsg);
      console.log("取消扫码");
    }
  })
}

 // 订阅消息
 const sendDYMsg = (e) => {
  return new Promise((resolve) => {
    wx.requestSubscribeMessage({  // 只能通过点击事件触发
      tmplIds: ['x-saO36wymuDfZKE3cbl1f5s8VFLgUm7U_EHLbEkByg', 'I92SHNYPP25bNv7UJq8S6ES6W73NnHnCnRQg_0DmUPs', 'x-RWZ_sa7svuo4YaN2WneKoe37ft2ftWv_tp8UmqRRwPw'],
      complete(res) {
        console.log(res);
        resolve(res);
      }
    })
  })
};

const myShowToast = (msg) => {
  msg = msg || 'error';
  wx.showToast({
    title: msg,
    icon: 'none'
  });
}

module.exports = {
  formatTime: formatTime,
  setLanguage: setLanguage,
  getLanguage: getLanguage,
  throttle: throttle,
  goBack: goBack,
  showToast: showToast,
  removeSpaces: removeSpaces,
  removeTwoSpaces: removeTwoSpaces,
  moneyFormato: moneyFormato,
  telFormat: telFormat,
  lengthUnitFormat: lengthUnitFormat,
  borrowState: borrowState,
  diffTime: diffTime,
  diffTimeFormat: diffTimeFormat,
  leaseUseTime: leaseUseTime,
  scanCode: scanCode,
  sendDYMsg: sendDYMsg,
  myShowToast: myShowToast
}
