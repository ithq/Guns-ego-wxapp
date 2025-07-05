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
/**格式化数据,不足二位前加0 */
function formatNumber2(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function toString2(n) {
  if (n == null || n == undefined) {
    return "";
  }
  n = n.toString()
  return n;
}
/**格式化数据，保存二位小数点. */
function toFixedNumber(val, digit) {
  if (val == null || val == undefined) {
    return "";
  }
  var fl = parseFloat(val);
  if (!isNaN(fl)) {
    return fl.toFixed(digit);
  }
  return "";
}
/**格式化时间，用/分隔 */
function formatTime(date, isShortFormat) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber2).join('/') + ' ' + [hour, minute, second].map(formatNumber2).join(':')
}

//地球直径
var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;
/**得到 */
function getRad(d) {
  return d * PI / 180.0;
}
/**
 * 根据二个座标返回距离
 */
function getDistanceByTude(lng1, lat1, lng2, lat2) {
  lng1 = parseFloat(lng1);
  lat1 = parseFloat(lat1);
  lng2 = parseFloat(lng2);
  lat2 = parseFloat(lat2);
  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);
  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);
  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;
  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;
  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;
  if (c == 0 || w == 0 || s == 0) {
    return 0;
  }
  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;
  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}
/**
 *根据座标反向解析地址, 此方法异步调用，所以需求在回调函数中怎么你的相关事务...
 *longitude, latitude 经伟度
 *distince:范围
 *funSuccess:成功回调
 *funError：失败回调
 */
function getAddressByLocation(latitude, longitude, distince, funSuccess, funError) {
  var key = "7NFBZ-SOEWX-V2T45-Z42PA-HSJKS-GKFL2";//固定的hwx申请的，是企业号..
  var url = "https://apis.map.qq.com/ws/place/v1/search?boundary=nearby(" + latitude + "," + longitude + "," + distince + ")";
  var key1 = "NQGBZ-SLUCV-KE7PX-UVEM4-WEQIH-5PBZ2"
  var key2 = "KS7BZ-RWQKP-7KYDB-LIGTT-GTNWS-UEBV2"
  var key3 = "TQXBZ-ZPEKQ-JQB5R-GCCNG-Q3DBS-WNBJQ"
  var minutes = new Date().getMinutes();
  if (minutes % 4 == 1) {
    key = key1
  }
  if (minutes % 4 == 2) {
    key = key2
  }
  if (minutes % 4 == 3) {
    key = key3
  }
  wx.request({
    url: url,
    data: { key: key },
    method: 'GET',
    success: (res) => {
      if (res.statusCode == 200) {
        if (funSuccess != null) {
          var item = null;
          var distance = null;  //res.data[i]._distance
          var data = res.data;
          if (data != null && data.count > 0) {
            data = data.data;
            for (var i = 0; i < data.length; i++) {
              if (distance == null) {
                item = data[i];
                distance = data[i]._distance;
                continue;
              }
              if (distance > data[i]._distance) {
                item = data[i];
                distance = data[i]._distance;
                continue;
              }
              if (distance == data[i]._distance && item.address.length < data[i].address.length) {
                item = data[i];
                distance = data[i]._distance;
                continue;
              }
            }
            res.data.data = [item];
            funSuccess(res.data);
          } else {
            funSuccess(null);
          }
        }
      } else {
        if (funError != null) {
          funError(e);
        }
      }
    },
    fail: function (e) {
      if (funError != null) {
        funError(e);
      }
    }
  });
}
/**
 *根据地址反向解析坐标
 *address:地址
 */
function getLocationByAddress(address, funSuccess, funError) {
  var key = "7NFBZ-SOEWX-V2T45-Z42PA-HSJKS-GKFL2"//是企业号KEY..
  var url = "https://apis.map.qq.com/ws/geocoder/v1/?address=" + address
  var key1 = "NQGBZ-SLUCV-KE7PX-UVEM4-WEQIH-5PBZ2"
  var key2 = "KS7BZ-RWQKP-7KYDB-LIGTT-GTNWS-UEBV2"
  var key3 = "TQXBZ-ZPEKQ-JQB5R-GCCNG-Q3DBS-WNBJQ"
  var minutes = new Date().getMinutes();
  if (minutes % 4 == 1) {
    key = key1
  }
  if (minutes % 4 == 2) {
    key = key2
  }
  if (minutes % 4 == 3) {
    key = key3
  }
  wx.request({
    url: url,
    data: { key: key },
    method: 'GET',
    success: (res) => {
      if (res.statusCode == 200) {
        if (funSuccess != null) {
          funSuccess(res.data);
        } else {
          funSuccess(null);
        }
      } else {
        if (funError != null) {
          funError(e);
        }
      }
    },
    fail: function (e) {
      if (funError != null) {
        funError(e);
      }
    }
  });
}
//获取随机字符串，可自定义长度和自定义特征字符
function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
    var randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}
/**生成服务器的ke */
function getKeyCode(param, code) {
  var keyCode = (param != null && param.length > 0) ? param.map(toString2).join("") + code : code;
  return MD5(keyCode);
}

/**接口向外传.. */
module.exports = {
  getKeyCode: getKeyCode,
  MD5: MD5,
  formatTime: formatTime,
  toFixedNumber: toFixedNumber,//格式化数字，保存二位小数点...
  getDistanceByTude: getDistanceByTude,
  getAddressByLocation: getAddressByLocation,
  getLocationByAddress: getLocationByAddress,
  randomString: randomString
}