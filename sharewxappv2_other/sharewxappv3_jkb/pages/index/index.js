// pages/index/index.js
//地图首页
const cmmn = require('../../utls/cmmn.js')
const utls = require('../../utls/utls.js')
const app = getApp()

Page({
  //数据集
  data: {
    centerLonY: '',
    centerLatX: '',
    lonY: app.glbParam.currLonY,//坐标 x
    latX: app.glbParam.currLatX,// 坐标 y,
    addrs: "搜索附近共享充电器",
    btnClked: false,//当
    userOperateForFlag: true, //当前用户是否正确操作中...
    msgForFlag: app.glbParam.flagForCurrMsg, //当前用户是否已有未曾读信息图片..
    headImgUrl: '/img/icon/log.png',//用户头象，如果没有显示系统log..
    markersArray: [],
    text: '',
    standard_window_height: 603,//标准手机高
    standard_window_width: 375, //标准手机宽
    standard_window_rate: 0.86, //比例  
    timer: null,
    unRdForFlag: 0, //正在处理未读标志..
    unRd: 0,   //未读条件。
    topAdvertImage: null, //首页顶部广告
    popAdvertImage: null, //首页弹出广告
    popAdvertClose: false, //关闭弹出广告
  },
  //判断是否是要重新得到坐标..
  getLocationForOnShow: true,
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
          that.setData({ headImgUrl: avatar });
        }
      }
    }
    //3. 注册登录成功后的回调方法...
    app.successLoginEventForCallback = function (resquest) {
      //重新加载头像
      if (resquest != null && resquest != undefined) {
        var userInfo = resquest.userInfo;
        var avatar = userInfo.avatarUrl;
        if (avatar != null && avatar != "" && avatar != undefined) {
          that.setData({ headImgUrl: avatar });
        }
      }
      //显示我的消息红点，未读消息
      try {
        that.unrdMsgCount();
      } catch (e) { }
      try{
        that.initAdvertInfo();
      }catch(e) { }
      // 显示附近的商户
      that.markersNearMerchantInMap(app.glbParam.currLonY, app.glbParam.currLatX);
    };
    //4. 定时器
    this.timer = options.timer;
    //5.扫码场景
    console.info(options);
    that.scanCodeToScnRslt(options);
    //初始地图
    that.initMap();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //this.movetoCenter();
    var that = this;
    //获取当前坐标，请求服务器，得到附近1000米设备信息

    //3 重新加载头象
    try {
      var avatar = wx.getStorageSync('CURRENT_AVATARURL')
      avatar = (avatar == null || avatar == undefined || avatar == "") ? '/img/icon/avatar.png' : avatar;
      if (avatar) {
        this.setData({
          headImgUrl: avatar
        });
      }
    } catch (e) {
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    //1. 结束操作...
    app.endOperate(that);

    //2. 显示我的消息红点，未读消息
    try {
      that.unrdMsgCount();
    } catch (e) {
    }
    //3. 重新加载广告
    try {
      that.initAdvertInfo();
    } catch (e) {
    }
    //4. 重新定位 
    if (that.getLocationForOnShow) {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          app.glbParam.currLatX = res.latitude
          app.glbParam.currLonY = res.longitude

          that.setData({
            latX: res.latitude,
            lonY: res.longitude
          })

          if(app.glbParam.isFlagForLoginResult){
            that.markersNearMerchantInMap(res.longitude, res.latitude);
          }
        },
      })
    }
    //2 移到地图中心
    that.mapctx = wx.createMapContext("map");
    //this.movetoCenter(); 
    that.getLocationForOnShow = true;
  },
  nearDeviceInMapFlag: true,
  aryNearDeviceLongitudeLatitude: [],
  // //根据最近设备坐标,在地图上描点位置...1. 数据库查询最近的商户 2. 地图描点...
  markersNearMerchantInMap: function(longitude, latitude){
    var that = this;
    that.aryNearDeviceLongitudeLatitude.push({
      longitude: longitude,
      latitude: latitude
    })
    if (!this.nearDeviceInMapFlag) {
      return;
    }
    this.nearDeviceInMapFlag = false;
    var keyCode = cmmn.getKeyCode([longitude, latitude], app.glbParam.code)
    utls.wxRequset("wxapp", "merchantForNear", {
      longitude: longitude,
      latitude: latitude,
      keyCode: keyCode,
      session3rd: app.glbParam.ssn_3rd
    }, function (rs) {
      that.setData({
        markersArray: []
      })
      var ary = [];
      var flag = "", latitudeLongitude = "";
      for (var i = 0; i < rs.data.length && i < 1000; i++) {
        if (i == 0) {
          flag = rs.data[i].latitude + "" + rs.data[i].longitude;
          ary.push(rs.data[i]);
        } else {
          latitudeLongitude = rs.data[i].latitude + "" + rs.data[i].longitude;
          if (flag == latitudeLongitude) {
            continue;
          }
          flag = latitudeLongitude;
          ary.push(rs.data[i]);
        }
      }
      var longitudeLatitude = that.aryNearDeviceLongitudeLatitude.pop();
      that.aryNearDeviceLongitudeLatitude = [];
      // 显示到地图位置
      that.setData({
        markersArray: ary
      })
      that.nearDeviceInMapFlag = true;
    }, function (fail) {
      that.nearDeviceInMapFlag = true;
    }, function (complete) {

    });

  },
  /** 扫码进入小程序，跳转到扫码页面 */
  scanCodeToScnRslt: function (options){
    try{
      var that = this;
      //1.有小程序参数进来，直接跳转付款页面
      if (options && options.q) {
        let sCharger = decodeURIComponent(options.q);
        if (sCharger && sCharger != -1) {
          app.handleEwmUrl(that, sCharger);
        }
      }
    }catch(e){}
  },
  /**获取未读消息条数,如果有未读消息显示红点*/
  unrdMsgCount: function () {
    //1.判断是否登录
    var that = this;
    if (app.glbParam.ssn_3rd == null || app.glbParam.ssn_3rd == undefined) {
      return;
    }
    // 消息缓存
    if ('' != wx.getStorageSync('index.unReadFlag')) {
      wx.removeStorageSync('index.unReadFlag');
      this.data.unReadFlag = 0;
    }
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
      } else {
        that.setData({
          msgFlag: false,
          unRead: 0
        })
      }
    }, function (fail) {
      that.data.unReadFlag = 0;
    }, function (complete) {

    });
  },
  /**
   * 初始他地图
   */
  initMap: function () {
    var that = this;
    wx.getSystemInfo({
      success: (res) => {
        var heightToTop = res.windowHeight * that.data.standard_window_rate;
        this.setData({
          controls: [{
            id: 1,
            iconPath: "/img/icon/location.png",
            position: {
              width: 50,
              height: 50,
              left: 8,
              top: heightToTop - 60
            },
            clickable: true
          }, {
            id: 2,
            iconPath: "/img/icon/scan.png",
            position: {
              width: 157,
              height: 45,
              left: res.windowWidth / 2 - 157 / 2,
              top: heightToTop - 60
            },
            clickable: true
          }, {
            id: 5,
            iconPath: "/img/icon/marker.png",
            position: {
              width: 17,
              height: 30,
              left: res.windowWidth / 2 - 12,
              top: heightToTop / 2 - 64
            },
            clickable: false
          }, {
            id: 6,
            iconPath: "/img/icon/server.png",
            position: {
              width: 45,
              height: 45,
              left: res.windowWidth - 55,
              top: heightToTop - 60
            },
            clickable: true
          }]
        })
      },
    })
  },
  // 初始化广告
  initAdvertInfo: function(){
    // 添加顶部广告
    var advertInfo = app.getAdvertInfo(1);
    if(advertInfo){
      this.setData({
        topAdvertImage: advertInfo.images
      })
    }
    // 添加弹出广告
    advertInfo = app.getAdvertInfo(2);
    if(advertInfo){
      this.setData({
        popAdvertImage: advertInfo.images
      })
    }
  },
  /**
 * 点击地图上的标记点时触发
 */
  markertap: function (e) {
    //从缓存取对应标记点的信息
    var that = this;
    var id = null;
    var markersArray = that.data.markersArray;
    var concatPphone = '联系门店';
    var confirmList = [];//点击地图小标点弹窗


    var name = null;
    var address = null;
    var phone = null;
    var targetLat = null;
    var targetLng = null;
    var orderType = null;
    var orderTypeStr = null;

    markersArray.forEach(function (value, index, array) {
      if (e.markerId === value.id) {
        name = value.shopName;
        address = value.shopAddr;
        phone = value.phone;
        targetLat = value.latitude;
        targetLng = value.longitude;
        orderType = value.orderType;
        id = value.id;
      }
    });
    var showName = (name == null || name == undefined) ? '前往>....' : '前往>' + name;
    if (phone == '' || phone == null) {
      confirmList = [showName];
    } else {
      confirmList = [showName, concatPphone];
    }
    wx.showActionSheet({
      itemList: confirmList,
      success: function (res) {
        if (!res.cancel && res.tapIndex == 0) {
          // 打开微信内置地图，实现导航功能（在内置地图里面打开地图软件）
          wx.openLocation({
            latitude: targetLat,
            longitude: targetLng,
            name: name,
            scale: 18,
            success:function(res){
              console.log(res);
            },
            fail:function(res){
              console.log(res);
            }  
          })
        } else if (res.tapIndex == 1) {
          wx.makePhoneCall({
            phoneNumber: phone,
            success: function () {
            },
            fail: function () {
            }
          })
        }
      },
      fail: function (res) {

      }
    })
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
  //搜索附近的设备
  searchNearDevices: function () {
    var that = this;
    this.getLocationForOnShow = false;
    wx.chooseLocation({
      success: function (res) {
        var longitude = res.longitude;
        var latitude = res.latitude;
        that.setData({
          latX: res.latitude,
          lonY: res.longitude
        })
      },
      fail: function (res) { },
      complete: function (res) { }
    });
  },
  /**
   * 视野发生变化时触发
   */
  viewChange: function (e) {
    var that = this;
    this.mapCtx = wx.createMapContext('map');
    if (that.data.centerLonY == undefined || that.data.centerLatX == undefined || that.data.centerLatX == "") {
      that.data.centerLonY = app.glbParam.currLonY;
      that.data.centerLatX = app.glbParam.currLatX;
    }
    this.mapCtx.getCenterLocation({
      success: function (res) {
        var distance = cmmn.getDistanceByTude(that.data.centerLonY, that.data.centerLatX, res.longitude, res.latitude);
        if (distance > 300) {
          that.data.centerLonY = res.longitude;
          that.data.centerLatX = res.latitude;
          that.setData({
              latX: res.latitude,
              lonY: res.longitude
          })
          that.markersNearMerchantInMap(res.longitude, res.latitude);
        }
      }
    });
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
  //回到当前位置
  bindcontroltap: function (e) {
    var that = this;
    switch (e.controlId) {
      case 1:
        that.setData({
          latX: app.glbParam.currLatX,
          lonY: app.glbParam.currLonY
        })
        that.movetoCenter();
        that.markersNearMerchantInMap(app.glbParam.currLonY, app.glbParam.currLatX);
        break;
      case 2:
        app.lgnAfterEventCallMethod(that.handleEwmUrl);
        break;
      case 6:
        that.moreHelp();
        break;
    }
  },

  movetoCenter: function () {
    this.mapctx.moveToLocation();
  },
  fromWeiXinContext: null,
  //判断是否是要重新得到坐标..
  getLocationForOnShow: true,

  /**
   * 广告图片点击
   */
  clickTopAdvert: function () {
    app.clickAdvertInfo(1, this.data.chargerId);
  },
  // 点击弹出广告
  clickPopAdvert: function(){
    app.clickAdvertInfo(2, this.data.chargerId);
  },
  // 弹出广告关闭
  clickPopAdvertClose: function(){
    this.setData({
      popAdvertClose: true
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

})