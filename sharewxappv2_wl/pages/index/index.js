// pages/index/index.js
//地图首页
const cmmn = require('../../utls/cmmn.js')
const utls = require('../../utls/utls.js')
const app = getApp()

Page({
  //数据集
  data: {
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //1. 其它页面因为要登录，未曾登录而跳转过来的...
    var rfsGetUserInfo = options.rfsGetUserInfo;
    if (!app.isLogined(false) && rfsGetUserInfo != 'TRUE' && !app.glbParam.credentForGetUsrInfo) {
      wx.navigateTo({ url: '/pages/kp/kp' })
      return;
    }
    var that = this;
    //2.注册登录后用户信息后回调方法
    app.refusedGetUserInfoForCallback = function (resquest) {
      if (resquest != null && resquest != undefined) {
        var userInfo = resquest.userInfo;
        var avatar = userInfo.avatarUrl;
        if (avatar != null && avatar != "" && avatar != undefined) {
          that.setData({ hdImgUrl: avatar });
        }
      }
    }
    //3. 注册登录成功后的回调方法...
    app.successLoginEventForCallback = function (resquest) {
      //1.有小程序参数进来，直接跳转付款页面
      if ('wx.getLaunchOptionsSync') {
        let opts = wx.getLaunchOptionsSync();
        if (opts.query && opts.query.q) {
          let sCharger = decodeURIComponent(opts.query.q);
          // 根据扫描的参数，直接进入付费页面
          if (sCharger && sCharger != -1) {
            //获取二维码的携带的链接信息
            app.handleEwmUrl(that, sCharger);
          }
        }
      }
    };
    //4.扫码场景
    console.info(options);
    that.scanCodeToScnRslt(options);
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
    var that = this;
    //1. 结束操作...
    app.endOperate(that);

  },
  /**获取未读消息条数,如果有未读消息显示红点*/
  unrdMsgCount: function () {
    //1.判断是否登录
    var that = this;
    if (app.glbParam.ssn_3rd == null || app.glbParam.ssn_3rd == undefined) {
      return;
    }
    //
    if (this.data.unReadFlag == 1) {
      return;
    }
    if (this.data.unReadFlag == 0) {
      this.data.unReadFlag = 1;
    }
    var keycode = cmmn.getKeyCode([], app.glbParam.code)
    utls.wxRequset("wxapp", "getMyMessageCoutInfo", {
      keycode: keycode,
      id: '',
      session3rd: app.glbParam.ssn_3rd
    }, function (success) {
      that.data.unReadFlag = 0;
      //成功
      var unRead = success.data.unRead;
      if (unRead >= 1) {
        that.setData({
          msgFlag: true,
          unRead: success.data.unRead
        })
      }
    }, function (fail) {
      that.data.unReadFlag = 0;
    }, function (complete) {

    });
  },
  /** 扫码进入小程序，跳转到扫码页面 */
  scanCodeToScnRslt: function (options) {
    try {
      var that = this;
      //1.有小程序参数进来，直接跳转付款页面
      if (options && options.q) {
        let sCharger = decodeURIComponent(options.q);
        if (sCharger && sCharger != -1) {
          app.handleEwmUrl(that, sCharger);
        }
      }
    } catch (e) { }
  },
  //点头像的事件进入个人中心
  usrCtBindtap: function (event) {
    var that = this;
    app.lgnAfterEventCallMethod(function () {
      //防重复点击开始=============
      if (!app.showLoadingForFirstOperate(that, "加载...")) {
        return;
      }
      wx.navigateTo({
        url: '/pages/usrCt/usrCt'
      });
    })
  },

  /**
* 点击地图上的客服图标
*/
  moreHelp: function (e) {
    var phone = app.glbParam.serveiceTelNo;
    wx.showActionSheet({
      itemList: ['拨打客服电话', '常见问题'],
      success: function (res) {
        if (!res.cancel && res.tapIndex == 0) {//拨打客服电话
          wx.makePhoneCall({
            phoneNumber: phone,
            success: function () {
            },
            fail: function () {
            }
          })
        }
        if (res.tapIndex == 1) {//常见问题
          wx.navigateTo({
            url: '/pages/commentPro/commentPro'
          });
        }

      },
      fail: function (res) {
      }
    })
  },
  //扫码充电...
  handleEwmUrl: function () {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    wx.scanCode({
      success: (res) => {
        app.handleEwmUrl(that, res.result);
      },
      complete: (res) => {
        app.endOperate(that);
      }
    })
  },
  //点击帮助
  bindBtnHelp: function(){
    // wx.navigateTo({
    //   url: '/pages/commentPro/commentPro'
    // });
    var that = this;
    that.moreHelp();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

})