/**
 * 微信的request
 * code
 * 1  成功
 * 0  失败
 * 2 租借正在请求中
 * -1 登录过期
 */

const api = require("./api.js");

const common = require("../language/common.js");

const util = require("../utils/util.js");

const commonLg = util.getLanguage(common);

const showModal = (content, fn, title = commonLg.modalTitle, showCancel = false) => {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    confirmText: commonLg.confirm,
    cancelText: commonLg.cancel,
    success (res) {
      if (res.confirm) {
        fn && fn()
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

const request = (url, data = {}, method = "POST", noRefetch = false) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: data,
      header: {
        'content-type': 'application/json', // 默认值
        'token': wx.getStorageSync('token') || '',
        'lang': wx.getStorageSync('language') || 'zh-CN'
      },
      method: method,
      dataType: 'json',
      responseType: 'text',
      success: res => {
        if (res.statusCode == 200) {  // 请求正常200
          if (res.data.code == 1) { //正常
            resolve(res.data);
          } else if(res.data.code == -1) { // 登录过期
            let expiredData = res.data
            
            if (!noRefetch) { // 重新登录
              loginInit( url, data, method).then((res) => { // 已授权默认登录
                resolve(res);
              }).catch(res => { // 未授权去登录
                reject(expiredData);
              });
            } else { // 默认登录失败
              reject(expiredData);
              showModal(expiredData.msg, () => {
                wx.redirectTo({
                  url: '../login/login'
                })
              })
            }
          } else if(res.data.code == 0) {
            console.log(res.data)
            reject(res.data);
          } else {
            //错误
            console.log(res.data)
            reject(res.data);

            // let strArray = url.split("/");
            // let strs = strArray[strArray.length - 1];
            // showModal(strs + '  ' + JSON.stringify(res.data.code));
          }
        } else {
          //请求失败
          console.log(res.statusCode);
          reject(res.statusCode)

          // let errStrArray = url.split("/");
          // let errstrs = errStrArray[errStrArray.length - 1];
          // showModal(errstrs + '  ' + JSON.stringify(res.statusCode));
        }
      },
      fail: err => {
        console.log(err)
        reject('requestFailed')
        showModal(err.errMsg)
      },
      complete: res => {
        clearLoadingTimer();
      }
    })
  });
}

/**
 * GET请求封装
 */
const get = (url, data = {}) => {
  return request(url, data, 'GET')
}

/**
 * POST请求封装
 */
const post = (url, data = {}) => {
  return request(url, data, 'POST')
}

// 登录
const loginInit = (...param) => {
  return new Promise((resolve, reject) => {
    login().then(res => { // code
      let code = res.code;
      getUserInfo().then(res => { // encryptedData, iv 
        let { encryptedData, iv } = res;
        getSessionKey(code).then(res => { // sessionKey
            getToken(encryptedData, iv, res.data.sessionKey).then((res) => { // token
              wx.setStorageSync('token', res.data.token);
              // 再次请求接口
              request(...param, true).then((res) => {
                resolve(res)
              });
            })
        })
      }).catch(res => {
        reject(res)
      })
    })
  })
}

// 登录
const login = () => {
  return new Promise((resolve) => {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        resolve(res);
      }
    })
  })
}

const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              resolve(res);
            }
          })
        } else {
          reject(res)
        }
      }
    })
  })
}

const getSessionKey = (code) => {
  return post(api.getSessionKey, {
    code: code
  });
}

const getToken = (encryptedData, iv, sessionKey) => {
  // 获取token
  return post(api.login, { 
    encryptedData: encryptedData,
    iv: iv,
    sessionKey: sessionKey,
    mobile: wx.getStorageSync("mobile"),
    type: 7,
    latitude: wx.getStorageSync("lng"),
    longitude: wx.getStorageSync("lat")
  })
}

// loading定时器
const  loadingTimer = (func, wait) => {
  var pages = getCurrentPages();  // 当前页面栈
  var thisPage = pages[pages.length - 1]; // 当前页面
  // var timeOut = setTimeout(func, wait)
  // thisPage.setData({
  //   timeOut: timeOut
  // })
}

// 清除loading定时器
const clearLoadingTimer = () => { 
  var pages = getCurrentPages();
  var thisPage = pages[pages.length - 1];
  // var timeOut = thisPage.data.timeOut;
  thisPage.setData({
    showLoading: false
  })
  // clearTimeout(timeOut)
}


module.exports = {
  request,
  get,
  post,
  login,
  getSessionKey,
  getToken,
  loadingTimer,
  clearLoadingTimer,
  showModal
}
