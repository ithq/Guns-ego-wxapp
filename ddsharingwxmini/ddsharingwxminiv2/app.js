//app.js

const request = require("/config/request.js");  // 接口请求
const api = require("/config/api.js");
const util = require("/utils/util.js");

App({
  onLaunch: function () {
    util.setLanguage();
    // wx.getSystemInfo({
    //   success: (result) => {
    //     console.log("系统信息："+JSON.stringify(result));
    //   },
    // });
  },

  onShow: function(res) {
    // 1038：从另一个小程序返回
    // console.log(res)

    if (res.scene === 1038 && res.query.qrcode && wx.getStorageSync('isOpenMiniProgram') == 1) { 
        this.globalData.userTouch = 1;
    } else {
      this.globalData.userTouch = 0;
    }
  },
  
  // loading定时器
  loadingTimer: function (func, wait) {
    var pages = getCurrentPages();  // 当前页面栈
    var thisPage = pages[pages.length - 1]; // 当前页面
    var timeOut = setTimeout(func, wait)
    thisPage.setData({
      timeOut: timeOut
    })
  },

  // 清除loading定时器
  clearLoadingTimer: function () { 
    var pages = getCurrentPages();
    var thisPage = pages[pages.length - 1];
    var timeOut = thisPage.data.timeOut
    clearTimeout(timeOut)
  },

  globalData: {
    userInfo: null,
    userTouch: 0, 
    openId: '',
    request: request,
    api: api,
    imgUrl: "https://bluetooth.qzsinotec.com/public/wechat_applet/miniprogramicon/",
    imgUrlAgent: "https://bluetooth.qzsinotec.com/public/wechat_applet/agent/",
    baseUrl: "http://bluetooth.qzsinotec.com:8098" //请求接口公共路径;  正式服
  }
})