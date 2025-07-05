// pages/index/index.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    address: "搜索位置查找附近易购充电",
    longitude: app.globalData.currLongitude,// "116.3972282409668",
    latitude: app.globalData.currLatitude,// "39.90960456049752",
    ossImgRoot: app.globalData.ossImgRoot,
    centerLongitude: '',
    centerLatitude: '',
    dbOperationFlag: true,
    buttonClicked: false,
    msgFlag: app.globalData.msgFlag,
    headImgUrl: '/images/images/log.jpg',
    markers: [],
    text: '',
    merchantName: "", // 商户店铺名称
    merchantId: "", // 商户ID
    batchNo: "", // 优惠券批次号
    unRead: 0,
    unReadFlag: 0
  },

  //点头像的onclick事件...个人中心
  userCenterBindtap: function (event) {
    var that = this;
    app.loginAfterCallMethod(function () {
      //防重复点击开始=============
      if (!app.startOperation(that, "加载...")) {
        return;
      }
      try {
        //保存formId
        app.saveFormId(event.detail.formId);

      } catch (e) { }
      wx.navigateTo({
        url: '/pages/userCenter/userCenter'
      });
    })
  },
  //附近网点
  list: function (event) {
    var that = this;
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    try {
      //保存formId
      app.saveFormId(event.detail.formId);
    } catch (e) { }    
    if (that.data.centerLongitude == undefined || that.data.centerLatitude == undefined || that.data.centerLatitude == "") {
        that.data.centerLongitude = app.globalData.currLongitude;
        that.data.centerLatitude = app.globalData.currLatitude;
    }
    var centerLocationData = { 'centerLongitude': that.data.centerLongitude, 'centerLatitude': that.data.centerLatitude };
    wx.setStorageSync('responseInfo', centerLocationData)
    wx.navigateTo({
      url: '/pages/list/list'
    });
  },
  nearDeviceInMapFlag: true,
  aryNearDeviceLongitudeLatitude: [],
  //根据最近设备坐标,在地图上描点位置...
  //1. 数据库查询最近的设备 2. 地图描点...
  markersNearDeviceInMap: function (longitude, latitude) {
    var that = this;
    that.aryNearDeviceLongitudeLatitude.push({
      longitude: longitude,
      latitude: latitude
    })
    if (!this.nearDeviceInMapFlag) {
      return;
    }
    this.nearDeviceInMapFlag = false;
    util.shareRequest("whitelist", "deviceForNear", {
      longitude: longitude,
      latitude: latitude
    }, function (rs) {
      that.setData({
        markers: []
      })
      var ary = [];
      var flag = "", latitudeLongitude = "";
      var latitudeTmp = 0;
      var longitudeTmp = 0;
      for (var i = 0; i < rs.data.length && i < 1000; i++) {
        if (i == 0) {
          //查询条件中传来的纬度
          latitudeTmp = rs.data[i].latitudeForSearch
          //查询条件中传来的经度
          longitudeTmp = rs.data[i].longitudeForSearch
          //
          flag = rs.data[i].latitude + "" + rs.data[i].longitude;
          ary.push(rs.data[i]);
        } else {
          latitudeLongitude = rs.data[i].latitude + "" + rs.data[i].longitude;
          if (flag == latitudeLongitude) {
            continue;
          }
          flag = latitudeLongitude
          ary.push(rs.data[i]);
        }
      }
      var longitudeLatitude = that.aryNearDeviceLongitudeLatitude.pop();
      that.aryNearDeviceLongitudeLatitude = [];
      //longitude 可能是引用的问题，有时间可能取不到logngitude的值，需要服务端返回...
      if ((longitudeTmp != 0 && longitudeTmp != undefined && longitudeTmp != null && longitudeTmp != "")
        && (latitudeTmp != 0 && latitudeTmp != undefined && latitudeTmp != null && latitudeTmp != "")
        && (longitudeLatitude.longitude != longitudeTmp || longitudeLatitude.latitude != latitudeTmp)) {
        that.nearDeviceInMapFlag = true;
        that.markersNearDeviceInMap(longitudeLatitude.longitude, longitudeLatitude.latitude);
      } else {
        that.setData({
          markers: ary
        })
        that.nearDeviceInMapFlag = true;
      }
    }, function (msg) {
      that.nearDeviceInMapFlag = true;
    }, function (msg) { }
    )
  },
  //搜索附近的设备网点
  positionChoose: function () {
    var that = this;
    this.getLocationForOnShow = false;
    wx.chooseLocation({
      success: function (res) {
        var longitude = res.longitude;
        var latitude = res.latitude;
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        that.markersNearDeviceInMap(longitude, latitude);
      },
      fail: function (res) { },
      complete: function (res) { }
    });
  },
  /**
   * 视野发生变化时触发
   */
  regionchange: function (e) {
    var that = this;
    this.mapCtx = wx.createMapContext('map');
    if (that.data.centerLongitude == undefined || that.data.centerLatitude == undefined || that.data.centerLatitude == "") {
      that.data.centerLongitude = app.globalData.currLongitude;
      that.data.centerLatitude = app.globalData.currLatitude;
    }
    this.mapCtx.getCenterLocation({
      success: function (res) {
        var distance = common.getDistanceByTude(that.data.centerLongitude, that.data.centerLatitude, res.longitude, res.latitude);
        if (distance > 300) {
          that.data.centerLongitude = res.longitude;
          that.data.centerLatitude = res.latitude;
          that.setData(
            {
              latitude: res.latitude,
              longitude: res.longitude
            })
          that.markersNearDeviceInMap(res.longitude, res.latitude)
        }
      }
    });
  },
  /**
  * 点击地图上的标记点时触发
  */
  markertap: function (e) {
    //从缓存取对应标记点的信息
    var that = this;
    var addr = null;
    var phone = null;
    var targetLat = null;
    var targetLng = null;
    var orderType = null;
    var orderTypeStr = null;
    var id = null;
    var markersArray = that.data.markers;
    var concatPphone = '联系充电宝小主';
    var confirmList = [];//点击地图小标点弹窗
    markersArray.forEach(function (value, index, array) {
      if (e.markerId === value.id) {
        addr = value.shopAddr + value.shopName;
        phone = value.phone;
        targetLat = value.latitude;
        targetLng = value.longitude;
        orderType = value.orderType;
        id = value.id;
      }
    });
    addr = (addr == null || addr == undefined) ? '前往>....' : '前往>' + addr;
    if (phone == ''||phone==null) {
      confirmList = [addr];
    } else {
      confirmList = [addr, concatPphone];
    }
    wx.showActionSheet({
      itemList: confirmList,
      success: function (res) {
        if (!res.cancel && res.tapIndex == 0) {
          wx.openLocation({
            latitude: targetLat,
            longitude: targetLng,
            scale: 18
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
  /**
* 点击地图上的客服图标
*/
  moreHelp: function (e) {
    var phone = app.globalData.serverTelNo;
    wx.showActionSheet({
      //'充电宝使用方式', '反馈问题'
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
            url: '/pages/commentProblem/commentProblem'
          });
        }
        if (res.tapIndex == 2) {//反馈问题
          wx.navigateTo({
            url: '/pages/feedbackProblem/feedbackProblem'
          });
        }
        if (res.tapIndex == 3) {//充电宝使用方式
          wx.navigateTo({
            url: '/pages/useGuide/useGuide'
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
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    wx.scanCode({
      success: (res) => {
        app.handleEwmUrl(that, res.result);
      },
      complete: (res) => {
        app.finishOperation(that);
      }
    })
  },
  //回到当前位置
  bindcontroltap: function (e) {
    var that = this;
    switch (e.controlId) {
      case 1:
        that.setData({
          latitude: app.globalData.currLatitude,
          longitude: app.globalData.currLongitude
        })
        that.movetoCenter();
        that.markersNearDeviceInMap(app.globalData.currLongitude, app.globalData.currLatitude);
        break;
      case 2:
        app.loginAfterCallMethod(that.handleEwmUrl);
        break;
      case 6:
        that.moreHelp();
        break;
    }
  },
  STANDARD_WINDOWHEIGHT: 603,
  STANDARD_WINDOWWIDTH: 375,
  STANDARD_WINDOW_RATE: 0.86,
  timer: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {	  
    var that = this;
    var useRefused = options.useRefused;     
    if (!app.isHaveLogin(false) && !app.globalData.credentialsForGetUserInfo && useRefused !='TRUE')    {  
    	wx.navigateTo({
  	      url: '/pages/skip/skip'
  	  })
  	  return;
    } 
    //实现得到用户信息后回调方法
    app.userInfoReadyCallback = function (res) {
      if (res != null && res != undefined) {
        var userInfo = res.userInfo;
        var avatarUrl = userInfo.avatarUrl;
        if (avatarUrl != null && avatarUrl != "" && avatarUrl != undefined) {
          that.setData({
            headImgUrl: avatarUrl
          });
        }
      }
    }
    app.onLoginSuccessCallback=function(res){
      //显示我的消息红点，未读消息
      try {
        that.unreadMessageCount();
      } catch (e) {
      }
    };
    this.timer = options.timer;

    wx.getSystemInfo({
      success: (res) => {
        var heightToTop = res.windowHeight * that.STANDARD_WINDOW_RATE;
        var widthHeightRate = (res.windowWidth / heightToTop) / (that.STANDARD_WINDOWWIDTH / (that.STANDARD_WINDOWHEIGHT * that.STANDARD_WINDOW_RATE)); //iphone6的屏为基准,计算手机屏幕
        var useWidth = 145
        var useHeight = 145
        useWidth = useWidth * widthHeightRate
        useHeight = useHeight * widthHeightRate
        if (res.windowWidth < useWidth) {
          useWidth = res.windowWidth - 6
          useHeight = useHeight * (useWidth / 145)
        }
        this.setData({
          controls: [{
            id: 1,
            iconPath: "/images/icon/locationindex.png",
            position: {
              width: 50,
              height: 50,
              left: 8,
              top: heightToTop - 75
            },
            clickable: true
          }, {
            id: 2,
            iconPath: "/images/icon/scan.png",
            position: {
              width: useWidth-20,
              height: useHeight-20,
              left: res.windowWidth / 2 - useWidth / 2+15,
              top: heightToTop - 145
            },
            clickable: true
          },
          {
            id: 5,
            iconPath: "/images/icon/marker.png",
            position: {
              width: 17,
              height: 30,
              left: res.windowWidth / 2 - 12,
              top: heightToTop / 2 - 44
            },
            clickable: false
          }, {
            id: 6,
            iconPath: "/images/icon/usestep.png",
            position: {
              width: 45,
              height: 45,
              left: 10,
              top: heightToTop - 140
            },
            clickable: true
          }]
        })
      },
    })
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
      var avatarUrl = wx.getStorageSync('YZD_WX_AVATARURL')
      avatarUrl = (avatarUrl == null || avatarUrl == undefined || avatarUrl == "") ?'/images/images/avatar.png' : avatarUrl;
      if (avatarUrl) {
        this.setData({
          headImgUrl: avatarUrl
        });
      }
    } catch (e) {
    }
  },
  //获取未读消息条数,如果有未读消息显示红点
  unreadMessageCount: function () {
    var that = this;
    var keycode = common.getKeyCode([], app.globalData.code)
    if (app.globalData.session_3rd == null || app.globalData.session_3rd == undefined){
      return;
    }
    //
    if (this.data.unReadFlag==1){ return; }
    if (this.data.unReadFlag==0){
      this.data.unReadFlag=1;
    }
    util.shareRequest("wxapp", "getMyMessageCoutInfo", {
      session3rd: app.globalData.session_3rd,
      keycode: keycode,
      id: ''
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
  
  movetoCenter: function () {
    this.mapctx.moveToLocation();
  },
  fromWeiXinContext: null,
  //判断是否是要重新得到坐标..
  getLocationForOnShow: true,
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;   
    app.finishOperation(that);

    //显示我的消息红点，未读消息
    try {
      that.unreadMessageCount();
    } catch (e) {
    }
    //1 重新定位 
    if (that.getLocationForOnShow) {
      that.nearDeviceInMapFlag = true;
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          app.globalData.currLatitude = res.latitude
          app.globalData.currLongitude = res.longitude
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude
          })

          that.markersNearDeviceInMap(res.longitude, res.latitude)
        },
      })
    }
    //2 移到地图中心
    that.mapctx = wx.createMapContext("map");
    //this.movetoCenter(); 
    that.getLocationForOnShow = true;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
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
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  //我的消息点onclick事件BindTap
  gotoMymessageBindTap: function (event) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    try {
      //保存formId
      app.saveFormId(event.detail.formId);

    } catch (e) { }
    app.loginAfterCallMethod(that.gotoMymessage)
  },
  //我的消息
  gotoMymessage: function () {
    var that = this;
    var keycode = common.getKeyCode([1, 5], app.globalData.code)
    util.shareRequest("wxapp", "myMessages.htm", {
      session3rd: app.globalData.session_3rd,
      start: 1,
      count: 5,
      keycode: keycode
    }, function (success) {
      //成功回调
      if (success.data.result == 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', success.data.message, '确定', null)
        return;
      }
      //信息加到缓存
      wx.setStorageSync('responseInfo', success.data.responseInfo)
      wx.navigateTo({
        url: '/personCenter/pages/myMessage/myMessage',
      })
    }, function (fail) {
      app.finishOperation(that);
    }, function (complete) {
    })
  }
})