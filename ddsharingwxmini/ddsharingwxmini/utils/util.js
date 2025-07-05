var api = require('../config/api.js');
var app = getApp();

// promise的prototype上新增该方法
Promise.prototype.complete = function (callback) {
  let p = this.constructor;
  return this.then(
    value => p.resolve(callback()).then(() => value),
    reson => p.resolve(callback()).then(() => {
      throw reson
    })
  )
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 封封微信的的request
 */
function request(url, data = {}, method = "GET") {
  data.timestamp = new Date().getTime();
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        'client': 'wechatmini',
        'X-Litemall-Token': wx.getStorageSync('sessionId')
      },
      success: function (res) {

        if (res.statusCode == 200) {

          if (res.data.errno == 501) {
            // 清除登录相关内容
            try {
              wx.removeStorageSync('sessionId');
            } catch (e) {
              // Do something when catch error
            }
            // 切换到登录页面
            wx.navigateTo({
              url: '/pages/auth/login/login'
            });
          } else {
            resolve(res.data);
          }
        } else {
          reject(res.data);
        }

      },
      fail: function (err) {
        reject(err)
      }
    })
  });
}

function redirect(url) {

  //判断页面是否需要登录
  if (false) {
    wx.redirectTo({
      url: '/pages/auth/login/login'
    });
    return false;
  } else {
    wx.redirectTo({
      url: url
    });
  }
}

function showErrorToast(msg) {
  wx.showToast({
    title: msg,
    image: '/static/images/icon_error.png'
  })
}

function showLoading(message) {
  if (wx.showLoading) { // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else { // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) { // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}

/**
 * 确定取消信息提示框
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {function} confirmFun 确认回调函数
 * @param {function} cancelFun 取消回调函数
 */
function confirmDialogForText(title, content, confirmFun, cancelFun) {
  confirmDialog({
    title: title,
    content: content,
    confirmFun: confirmFun,
    cancelFun: cancelFun
  })
}

/**
 * 确定取消信息提示框
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {string} confirmText 确认按钮内容
 * @param {string} cancelText 取消按钮内容
 * @param {function} success 确认回调函数
 * @param {function} cancelFun 取消回调函数
 */
function confirmDialog(option) {
  wx.showModal({
    title: option.title,
    content: option.content,
    confirmText: option.confirmText || '确定',
    cancelText: option.calcelText || '取消',
    success: function (res) {
      if (res.confirm) {
        option.confirmFun && option.confirmFun(res);
      } else {
        option.cancelFun && option.cancelFun(res);
      }
    }
  })
}

/**
 * 提示信息窗口
 * @param {string} title 
 * @param {string} content 
 * @param {string} confirmText 
 * @param {function} completeFun 
 */
function alertDialog(title, content, confirmText = '确定', completeFun) {
  wx.showModal({
    showCancel: false,
    title: title,
    content: content,
    confirmText: confirmText,
    success: (res) => {
      completeFun && completeFun();
    },
    complete: (res) => {
      if (!res.confirm && !res.cancel) {
        completeFun && completeFun();
      }
    }
  })
}

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

module.exports = {
  formatTime,
  request,
  redirect,
  showErrorToast,
  showLoading,
  hideLoading,
  alertDialog,
  confirmDialog,
  confirmDialogForText,
  throttle
}