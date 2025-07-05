// page/kp/kp.js
//中转页面，微信扫码，个人中心，公众号菜单进入此页面
const util = require('../../utls/utls.js')
const app = getApp()
Page({
  data:{
    delayedTime: 0, //延迟时间
    catNotJumpFromWx: false,//微信执行跳转控制
    ScanByWXParam: "",//微信扫码进小程序携带的参数
    isFromWX: 0, //是否从微信扫码进来，再onshow去跑定时器，跳转首页，0不是，1是
    canGetUserInfo: false,//获取用户信息微信接口，是否能正常调用
    jumpFromUserCenter: null,
    loginCount: 0 ,//登陆次数
    needUserAuth: 0,
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //从微信扫码进来（带参数q）-开始
    //that.data.ScanByWXParam = options.q + "";
    console.info(options);
    try{
      if (wx.getLaunchOptionsSync) {
        let opts = wx.getLaunchOptionsSync();
        console.info(opts);
        if (opts.query && opts.query.q) {
          that.data.ScanByWXParam = decodeURIComponent(opts.query.q);
        }
      }
    }catch(e){}
    that.data.isFromWX = 0;
    that.data.jumpFromUserCenter = options.jumpFromUserCenter;
    //非微信扫码进入，不处理，直接跳转(onshow方法处理)
    if (that.data.ScanByWXParam == null || that.data.ScanByWXParam == undefined || that.data.ScanByWXParam == "") {
      return;
    }
    try {
      wx.setStorageSync('kp_param', this.data.ScanByWXParam)
      this.data.isFromWX = 1;
    } catch (e) {
      return;
    }
   //标识，跳出递归调用
    app.refuseGetUserInfoCallback = function () {
      that.data.catNotJumpFromWx = true;
    }
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
    var that = this
    that.setData({ needUserAuth: 0 });
    try {
      wx.getSystemInfo({
        success: function (request) {
          var SDKVersion = request.SDKVersion;
          if (SDKVersion == '1.0.0' || SDKVersion == '1.0.1') {
            //版本过低跳到地图页面，标识为不能使用
            util.alterDialog('提示', '您的微信版本【' + SDKVersion + '】过低，请先升级微信版本后再使用小程序！', '确定',                  function () {
              wx.reLaunch({
                url: '/pages/index/index?rfsGetUserInfo=TRUE'
              })
            })
            return;
          }
          util.showLoading("加载中...")
          that.data.delayedTime = 0;
          that.data.catNotJumpFromWx = false;
          that.validateSession();
        },
        fail: function (rs) {
          util.showLoading("加载中...")
          that.data.delayedTime = 0;
          that.data.catNotJumpFromWx = false
          that.validateSession();
        }
      })
    } catch (e) {
    }
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.isFromWX = 0;
    this.data.catNotJumpFromWx = true;
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  //查检用户状态
  validateSession: function () {
    var that = this;
    that.setData({ 
      rfsGetUserInfo:0,
      canGetUserInfo: wx.canIUse('button.open-type.getUserInfo')
     });
    wx.checkSession({
      success: function () {
        //用户未登录的重新登录，已经登陆则直接跳转页面逻辑
        if (app.isLogined(false)) {
          //已经登陆
          //允许获取用户信息===true
          app.glbParam.credentForGetUsrInfo = true;
          util.hideLoading();
          if (that.data.jumpFromUserCenter == true) {
            //如果从个人中心跳过来的,跳转首页
            wx.reLaunch({
              url: '/pages/usrCt/usrCt'
            })
            return;
          } else {
            var queryParamTmp = wx.getStorageSync('kp_param');
            
            if (queryParamTmp != 'undefined'
              && queryParamTmp != null
              && queryParamTmp != ''
              && queryParamTmp != undefined) {
                //微信扫码进入
              that.jumbFromWX(queryParamTmp);
              that.data.isFromWX = 1;
              return;
            } else {
              //非微信扫码进入，直接进首页
              wx.reLaunch({
                url: '/pages/index/index'
              })
            }
          }
        } else {
          //未登陆用户，执行登陆操作
          app.glbParam.credentForGetUsrInfo = false;
          that.userLogin();
        }

      },
      fail: function (rs) {
        that.userLogin();
      }
    })

  },

  //用户登陆
  userLogin: function () {
    var that = this;
    wx.login({
      success: resquest => {
        if (resquest.code) {
          //发起网络请求			 
          var canIUseSetting = false;
          app.glbParam.code = resquest.code
          app.glbParam.ssn_3rd = null
          try {
            canIUseSetting = wx.canIUse("getSetting");
          } catch (exception) {
          }
          if (canIUseSetting) {
            //获取授权结果
            wx.getSetting({
              success: resquest => {
                //授权用户信息
                if (resquest.authSetting['scope.userInfo']) {
                  wx.getUserInfo({
                    success: function (resquest) {
                      app.doLoginWithGetUserInfoEvent(resquest);
                      app.glbParam.credentForGetUsrInfo = true;
                      //页面跳转
                      that.redirectPage();
                      util.hideLoading();
                    },
                    fail: function (rs) {
                      util.hideLoading();
                      //把用户同意授权标识上
                      that.setData({ needUserAuth: 1 });
                    }
                  })
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框		       
                } else {
                  if (that.data.canGetUserInfo) {
                    that.setData({ needUserAuth: 1 });
                    return;
                  } else {
                    wx.authorize({
                      scope: 'scope.userInfo',
                      success(rs) {
                        //得到用户信息 登录
                        app.glbParam.timesForLogining = 0;
                        app.glbParam.credentForGetUsrInfo = true;
                        that.getUserInfo();
                        util.hideLoading();
                      }, fail(rs) {
                        that.getUserInfo();

                      }, complete(rs) {
                      }
                    })
                  }
                  util.hideLoading();
                  return;
                }
              },
              fail(rs) {
                that.getUserInfo();
              }
            })

          } else {
            //获取用户信息
            that.getUserInfo();
          }
        } else {
          //调用登陆失败
          //5次重新尝试登陆机会
          that.data.loginCount = that.data.loginCount + 1;
          if (that.data.loginCount < 5) {
            that.userLogin();
          }
        }
      },
      fail(rs) {
         //调用登陆失败
         //5次重新尝试登陆机会
        that.data.loginCount = that.data.loginCount + 1;
        if (that.data.loginCount < 5) {
          that.userLogin();
        }
      }
    })
    util.hideLoading();
  },

  /**得到用信息  */
  getUserInfo: function (param) {
    var that = this;
    wx.getUserInfo({
      lang: 'zh_CN',
      // 可以将 res 发送给后台解码出 unionId
      success: resquest => {
        //得到用户信息 登录
        app.glbParam.timesForLogining = 0;
        app.doLoginWithGetUserInfoEvent(resquest);
        app.glbParam.credentForGetUsrInfo = true;
        //页面跳转
        that.redirectPage();
      }, fail: function (resquest) {
        if (that.data.canGetUserInfo) {
          that.setData({ needUserAuth: 1 });
          return;
        }
        var msg = resquest.errMsg;
        if (msg.indexOf("auth deny") > -1) {
          app.refusedGetUserInfoWithUser();
        }
      }
    })
  },

  //页面跳转
  redirectPage: function () {
    var that = this;
    var kpParam = wx.getStorageSync('kp_param');
    //kpParam 非空则微信扫码进入此页面
    if (kpParam != undefined && kpParam != null
      && kpParam != 'undefined' && kpParam != '') {
      that.data.isFromWX = 1;
      that.jumbFromWX(kpParam);
      return;
    }
    util.hideLoading();
    //从个人中心跳转至此
    if (that.data.jumpFromUserCenter == true) {
      wx.reLaunch({
        url: '/pages/usrCt/usrCt'
      })
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },

  //微信扫码进入的请求
  jumbFromWX: function (weixinParam) {
    var that = this;
    try {
      //微信执行跳转控制
      if (that.data.catNotJumpFromWx) {
        return;
      }
      if (!app.isLogined(false)) {
        //如果没有登陆，则延时再试,直至登陆上
        that.data.delayedTime = that.data.delayedTime + 1;
        //最多等75s
        if (that.data.delayedTime > that.data.delayedTimeMax) {
          that.data.delayedTime = 0
          wx.reLaunch({
            url: '/pages/index/index',
          })
          return;
        }
        //延时0.5s重试
        setTimeout(function () {
          that.jumbFromWX(weixinParam)
        }, 500)
        return;
      }
      //初始化延时时间
      that.data.delayedTime = 0;
      var qrCodeUrl = unescape(weixinParam); //得到完整的二维码url
      //清空参数...
      try {
        wx.removeStorageSync("kp_param")
      } catch (strErr) { }
      //调用统一处理二维码内容接口
      app.handleEwmUrlAndConfirmFun(that, qrCodeUrl, function () {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      });
    } catch (exception) {
    }
  },

  /**得到用信息  */
  bindGetUserinfoTab: function (e) {
    const that = this;
    if ('getUserInfo:ok' != e.detail.errMsg) {
      util.cnfmDialogForText("提示", "拒绝获取微信昵称信息后，系统部分功能不可用，是否重新允许！", null,
        "是", function (rs) {
          wx.reLaunch({
            url: '/pages/index/index?rfsGetUserInfo=TRUE'
          })
        }, "否", false);

      return;
    }
    app.doLoginWithGetUserInfoEvent(e.detail);
    that.jumpPage();
  },

  jumpPage: function () {
    const that = this;
    var queryParamTmp = wx.getStorageSync('kp_param');
    var fromWeiXinContext = queryParamTmp;

    //非onload过来..判断是否已进入过扫码充电...如果已进入过,那个fromWeiXinContext==null或空...
    if (fromWeiXinContext != undefined && fromWeiXinContext != null
      && fromWeiXinContext != 'undefined' && fromWeiXinContext != '') {
      that.jumbFromWX(fromWeiXinContext);
      that.data.isFromWX = 1;
      return;
    }
    util.hideLoading();
    if (that.data.jumpFromUserCenter == true) {
      wx.reLaunch({
        url: '/pages/usrCt/usrCt'
      })
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
})