//request合法域名 请求服务器的根目录...
var rqstBaseUrl = "https://api.shandianba.cn/rest/"

function Base64(strValue) {
  // private property
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  // public method for decoding
  function decode(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  }

  // private method for UTF-8 encoding
  function _utf8_encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  }

  // private method for UTF-8 decoding
  function _utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }


  var outputStr = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  strValue = _utf8_encode(strValue);
  while (i < strValue.length) {
    chr1 = strValue.charCodeAt(i++);
    chr2 = strValue.charCodeAt(i++);
    chr3 = strValue.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    outputStr = outputStr +
      _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
      _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
  }
  return outputStr;
}
/**start md5  */
function MD5(str) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }

  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function ConvertToWordArray(str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  };

  function Utf8Encode(str) {
    if (str == null) {
      str = "";
    }
    str = str.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < str.length; n++) {

      var c = str.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  str = Utf8Encode(str);

  x = ConvertToWordArray(str);

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}
/**
 * 返因jwt过行加密码后的参数..
 */
function translateToJWTParam(randomKey, params) {
  //1、params json数据改换为raw字符串..
  var str = JSON.stringify(params);
  //2. base64位加密码
  var base64Str = Base64(str);
  //3. md5生成sign..
  str = base64Str + randomKey;
  str = MD5(str);
  //构建新的param.. 
  var resultJson = { "object": base64Str, "sign": str };
  return resultJson;
}
/**
 * 得到session Id...
 */
function getSessionId() {
  var sessionId = null;
  try {
    sessionId = wx.getStorageSync('JSESSIONID')
  } catch (e) {
  }
  return sessionId;
}

function confirmDialog(title, content, cnfmFun, cancelFun) {
  cnfmDialogForText(title, content, cnfmFun, "确定", cancelFun, "取消", false)
}
/**
 * 判断值是否合法
 * validateType:判断类型 Email－邮箱地址, Mobile－手机号, Tel－电话, Name-合法用户名
 * reutrn true:正确，　false:失败
 */
function validateValue(validateType, value) {
  var regBox = {
    regEmail: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,//邮箱
    regName: /^[a-z0-9_-]{3,16}$/,//用户名
    regMobile: /^0?1[3|4|5|7|8|9][0-9]\d{8}$/,//手机
    regTel: /^0[\d]{2,3}-[\d]{7,8}$/
  }
  if (validateType == "Email") {
    return regBox.regEmail.test(value);
  }
  if (validateType == "Mobile") {
    return regBox.regMobile.test(value);
  }
  if (validateType == "Tel") {
    return regBox.regTel.test(value);
  }
  if (validateType == "Name") {
    return regBox.regName.test(value);
  }
  return true;
}

/**
 * 判断是否是一个正整数
 * 
 */
function isInteger(obj) {
  var r = /^\+?[1-9][0-9]*$/;　　//正整数  
  var flag = r.test(obj);
  return r.test(obj);
}
//队列
/**
 * [Queue]
 * @param {[Int]} size [队列大小]
 */
function Queue(size) {
  var list = [];

  //向队列中添加数据
  this.push = function (data) {
    if (data == null) {
      return false;
    }
    //如果传递了size参数就设置了队列的大小
    if (size != null && !isNaN(size)) {
      if (list.length == size) {
        this.pop();
      }
    }
    list.unshift(data);
    return true;
  }

  //从队列中取出数据
  this.pop = function () {
    return list.pop();
  }

  //返回队列的大小
  this.size = function () {
    return list.length;
  }

  //返回队列的内容
  this.quere = function () {
    return list;
  }

  //删除队列中的值
  this.remove = function (value) {
    for (var i = 0; i < list.length; i++) {
      if (list[i] == value) {
        list.splice(i, 1);
        break;
      }
    }
  }
}
function newQueue(size) {
  //初始化没有参数的队列
  var queue = new Queue(size);
  return queue;
}

//获取当前的日期时间 格式“yyyy-MM-dd HH:MM:SS”
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}
/////////////////////////////////////////////////////////////////////// 已处理的方法


/**
 * 确定取消dialog
 * ttle:标题
 * contnt:内容
 * cancelTxt:取消按钮内容
 * cancelFun:取消按钮回调函数
 * defaulFlag:true点空白表示是，false:点空白表示否
 * cnfmTxt：确定按钮名
 * cnfmFun:确定的回调函数
 */
function cnfmDialogForText(ttle, contnt, cnfmFun, cnfmTxt, cancelFun, cancelTxt, defaulFlag) {
  wx.showModal({
    title: ttle,
    content: contnt,
    cancelText: cancelTxt,
    confirmText: cnfmTxt,
    success: function (res) {
      if (res.confirm) {
        if (cnfmFun != null && cnfmFun != undefined) {
          cnfmFun(res);
        }
      } else if (res.cancel) {
        if (cancelFun != null && cancelFun != undefined) {
          cancelFun(res);
        }
      } else {
        if (defaulFlag && cancelFun != null && cancelFun != undefined) {
          cancelFun(res);
        }
        if (!defaulFlag && cnfmFun != null && cnfmFun != undefined) {
          cnfmFun(res);
        }
      }
    }
  })
}
/**
 * 进示信息窗口
 * btnTxt:按钮名称
 * btnFun:按钮事件
 * ttl:标题
 * contnt:提示内容
 */
function altDialog(ttl, contnt, btnTxt, btnFun) {
  wx.showModal({
    showCancel: false,
    content: contnt, //
    title: ttl,
    confirmText: btnTxt,
    complete: function (res) {
      //有些android手机处理屏蔽层关闭
      if (!res.confirm && !res.cancel) {
        try {
          if (btnFun != null) {
            btnFun(res);
          }
        } catch (e) { 

        }
      }
    }, 
    success: function (res) {
      try {
        if (btnFun != null) {
          btnFun(res);
        }
      } catch (e) { 
        
      }
    }
  })
}
/**封装显示加载框*/
function hideLoading() {
  try {
    if (wx.canIUse("hideLoading")) {
      wx.hideLoading();
    }
  } catch (eee) { }
}
/**
 * 得到系统根路径...
 */
function getRqstBaseUrl() {
  return rqstBaseUrl;
}

/**
 * 请求service服务端服务.get请求...
 */
function wxRequset(ctrlMapping, rqstMapping, params, successFun, failFun, completeFun) {
  var sss_3id = "";
  try {
    sss_3id = wx.getStorageSync('ssn_3rd');
  } catch (e) {
    try {
      sss_3id = wx.getStorageSync('ssn_3rd');
    } catch (e) {
      // Do something when catch error
    }
  }
  //处理header
  var hdr = { 'content-type': 'application/json' }
  //如果不是通过whitelist访问的，说明要进行jwt验证

  var stmp = new Date().getTime();
  if (params == null) {
    params = { timestamp: stmp }
  } else {
    params.timestamp = stmp;
  }
  var uri = rqstBaseUrl + ctrlMapping + "/" + rqstMapping
  wx.request({
    data: params,
    url: uri,
    dataType: "json",
    header: hdr,
    success: function (res) {
      if (typeof successFun == "function") {
        successFun(res);
      }
    },
    fail: function (e) {
      if (typeof failFun == "function") {
        failFun(e);
      }
    },
    complete: function (e) {
      if (typeof completeFun == "function") {
        completeFun(e);
      }
    }
  })
}
/**
 * 封装wx.request中的post请求.
 * ctrlMapping: 服务器controller类对应的mapping
 * methodMapping:controller中方法对应的mapping
 * params:参数
 * scsFun:成功回调方法, 
 * failFun：失败回调方法, 
 * completeFun:完成处理回调方法
 */
function wxRequsetForPost(ctrlMapping, methodMapping, params, scsFun, failFun, completeFun) {
  var ssnId = "";
  var rqstOk = null;
  //处理header
  var hd = { 'content-type': 'application/x-www-form-urlencoded' };
  //1 加时间截
  var stampTime = new Date().getTime();
  if (params == null) {
    params = { timestamp: stampTime }
  } else {
    params.timestamp = stampTime;
  }
  //2 处理路径
  var uri = rqstBaseUrl + ctrlMapping + "/" + methodMapping;
  try {
    ssnId = wx.getStorageSync('ssnId');
  } catch (e) {
    try {
      ssnId = wx.getStorageSync('ssnId');
    } catch (e) {}
  }

  //如果不是通过whitelist访问的，说明要进行jwt验证
  wx.request({
    url: uri,
    method: "POST",
    dataType: "json",
    data: params,
    header: hd,
    success: function (res) {
      rqstOk = 1;
      if (typeof scsFun == "function") {
        scsFun(res);
      }
    },
    fail: function (e) {
      rqstOk = 2;
      if (typeof failFun == "function") {
        failFun(e);
      }
    },
    complete: function (e) {
      if (e != null && rqstOk == null) {
        if (e.errMsg == "request:ok") {
          if (typeof scsFun == "function") {
            scsFun(res);
          }
        } else {
          if (typeof failFun == "function") {
            failFun(e);
          }
        }
      }
      if (typeof completeFun == "function") {
        completeFun(e);
      }
    }
  })
}
/**
 * 显示加载框
 */
function showLoading(msg) {
  try {
    if (wx.canIUse("showLoading")) {
      wx.showLoading({title: msg});
    }
  } catch (eee) { }
}

//发布接口
module.exports = {
  wxRequset: wxRequset,
  getRqstBaseUrl: getRqstBaseUrl,
  wxRequsetForPost: wxRequsetForPost,
  getSessionId: getSessionId,
  altDialog: altDialog,
  hideLoading: hideLoading,
  showLoading: showLoading,
  confirmDialog: confirmDialog,
  cnfmDialogForText: cnfmDialogForText,
  validateValue: validateValue,
  isInteger: isInteger,
  newQueue: newQueue,
  getNowFormatDate: getNowFormatDate,
  translateToJWTParam: translateToJWTParam
}