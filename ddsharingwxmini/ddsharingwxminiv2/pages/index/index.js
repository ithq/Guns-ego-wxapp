//index.js

const app = getApp();
const util = require("../../utils/util.js");
const language = require("../../language/index.js");  //语言包
const common = require("../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

var map,coutTimer, refreshTimer;
var advertiseDefault = 1, prevDragDistance = 0;//1默认宣传

Page({
  data: {
    lg: '', 
    commonLg: '',
    imgUrl: app.globalData.imgUrl,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    lat: 22.55329,
    lng: 113.88308,
    scale: 15, 
    markers: [],
    markerPrevId: -1,
    shopDetail: {},
    userInfo: {},
    advertisement:{}, // 广告
    times: '00:00:00',
    showMmx: false, //是否显示租借信息 
    showPowerBank: false,
    amount: 0, // 金额
    showDetail: true // true 隐藏  false 显示
  },

  onLoad: function (options) {
    const self = this;
    // 外部扫码
    if (options.q) {
      wx.removeStorageSync('externalCode');
      var externalId = decodeURIComponent(options.q); // 解码
      externalId = externalId.split("/");
      var externalCode = {
        type: externalId[externalId.length - 3],
        qrcode: externalId[externalId.length - 1]
      };
      wx.setStorageSync('externalCode', JSON.stringify(externalCode));
      this.externalScan();
    };

    // 创建map对象
    map = wx.createMapContext('map');
    self.getLocation();
  },

  // 获取当前位置
  getLocation: function() {
    const self = this;
    wx.getLocation({
      success: function(res) {
        self.setData({
          lat: res.latitude,
          lng: res.longitude,
          scale: 15
        });
        // 缓存经纬度
        wx.setStorageSync("lat", res.latitude);
        wx.setStorageSync("lng", res.longitude);
        // 地图复位
        setTimeout(function() {
          self.mapReset();
        }, 500);
      },
      fail: function() {
        self.setData({
          lat: 22.55329,
          lng: 113.88308,
          scale: 15
        });
        wx.setStorageSync("lat", 22.55329);
        wx.setStorageSync("lng", 113.88308);
      },
      complete: function() {
        self.getNearbyShop();
      }
    });
  },

  // 地图复位
  mapReset: util.throttle(function(e) {
    map.moveToLocation();
  }, 500),

  //进行经纬度转换为距离的计算
  rad: function(d){
    return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
  },
  
  //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
  getDistance: function(lat1,lng1,lat2,lng2){
      var radLat1 = this.rad(lat1);
      var radLat2 = this.rad(lat2);
      var a = radLat1 - radLat2;
      var  b = this.rad(lng1) - this.rad(lng2);
      var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
      Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
      s = s *6378.137 ; // 地球半径;
      s = Math.round(s * 10000) / 10000; //输出为公里

      return Math.floor(s);
  },

  // 地图移动事件
  regionchange: function(e) {
    const self = this;
    if (e.type == 'end') {
      map.getCenterLocation({
        success: res => {
          var prevlat = self.data.lat;
          var prevlng = self.data.lng;
          var dragDistance = self.getDistance(prevlat, prevlng, res.latitude, res.longitude);
          if ( dragDistance != prevDragDistance ) {  
            self.getNearbyShop(res.latitude, res.longitude);
            prevDragDistance = dragDistance;
          }
          wx.setStorageSync("lat", res.latitude);
          wx.setStorageSync("lng", res.longitude);
        }
      });
    }
  },

  // 复原上一个点击的icon
  prevMarkers: function() {
    const {markers, imgUrl, markerPrevId}  = this.data;
    
    var markerPrevIndex =  markers.findIndex( t=> t.id == markerPrevId); // -1 

    if ( markerPrevIndex > -1) {
      var markersPrevIcon = 'markers[' + markerPrevIndex + '].iconPath';
      var status = markers[markerPrevIndex].detail.onlineNum;
      var type = markers[markerPrevIndex].detail.type;
      var iconPrevPath = status > 0 ? imgUrl + 'index/icon_marker3.png' : type==1 ? imgUrl + 'index/icon_markerGray3.png' : imgUrl + 'index/icon_marker3.png';
      this.setData({
        [markersPrevIcon]: iconPrevPath
      });
    }
  },

  // 商户点击
  markersTap: function(e) {
    var markerId = parseInt(e.markerId);
    const {markers, imgUrl}  = this.data;

    this.prevMarkers();

    // 当前点击的icon
    var markerIndex =  markers.findIndex( t=> t.id == markerId);
    var markersIcon = 'markers[' + markerIndex + '].iconPath';

    // 店铺类型
    var status = markers[markerIndex].detail.onlineNum;
    var type = markers[markerIndex].detail.type;
    var iconPath = status > 0 ? imgUrl + 'index/icon_marker3.png' : type==1 ? imgUrl + 'index/icon_markerGray3.png' : imgUrl + 'index/icon_marker3.png';

    switch (type) {
      case 3:
        iconPath = imgUrl + 'index/bluetooth.png';
        break;    
      default:
        iconPath = status > 0 ? imgUrl + 'index/cabinetOnLine.png' : imgUrl + 'index/cabinetOffLine.png';
        break;
    }

    this.setData({
      shopDetail: markers[markerIndex].detail,
      [markersIcon]: iconPath,
      markerPrevId: markerId,
      showDetail: false,
    });
  },

  // 关闭商家详情
  closeDetail: function() {
    this.prevMarkers();
    this.setData({
      showDetail: true
    })
  },

  // 获取附近商家
  getNearbyShop: function(latitude, longitude) {
    const self = this;
    var latitudeCenter = latitude ||  wx.getStorageSync("lat");
    var longitudeCenter = longitude || wx.getStorageSync("lng");
    request.post(api.nearbyNoPager,{
      latitude: self.data.lat,
      longitude: self.data.lng,
      latitudeCenter: latitudeCenter,
      longitudeCenter: longitudeCenter
    }).then((res) => {
      if (res.data.length > 0) {
        self.shopMarkerFormat(res.data)
      }
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  },

  // 店铺初始化
  shopMarkerFormat: function(shopData) {
    const self = this;
    const imgUrl = self.data.imgUrl;
    var markers = [];

    if (shopData.constructor !== Array) return false;
    if(shopData.length <= 0) return false;

    shopData.map(item => {
      var son = {
        iconPath: item.onlineNum > 0 ? imgUrl + 'index/icon_marker3.png' : item.type == 1 ? imgUrl + 'index/icon_markerGray3.png' : imgUrl + 'index/icon_marker3.png',
        id: item.id,
        latitude: item.lat,
        longitude: item.lng,
        width: 50,
        height: 50,
        detail: {
          ...item
        }
      };
      markers.push(son);
    });

    self.setData({
      markers: markers
    });
  },

  // 打开扫码
  scanCode: util.throttle(function(e) {
    util.scanCode();
  }, 1000),

  // 外部扫码
  externalScan: function () {
    var externalCode = wx.getStorageSync('externalCode') || '{}';
    var codeData = JSON.parse(externalCode);
    
    if (!codeData.qrcode) {
      return false
    }
    switch (codeData.type) {
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
        break;
    }
  },

  //查询租借信息
  getRentStatu: function(){
    const self = this;
    return request.post(api.borrowInfo).then((res) => {
      //有租借中订单， 显示租借中订单
      if (res.data.resultList.length > 0) { // 有订单
        let rentData = res.data.resultList[0];
        self.countdown(rentData.endTime);
        self.setData({
          amount: rentData.amount,
          showPowerBank: false,
          showMmx: true
        }); 
      } else { // 没有租借中订单
        clearTimeout(refreshTimer);  //移除计时器
        clearTimeout(coutTimer); 

        self.setData({
          showPowerBank: false,
          showMmx: false
        });    
      }    
    }).then(() => {
      clearTimeout(refreshTimer);  //移除计时器
      if ((!self.data.showPowerBank && !self.data.showMmx) || self.data.showMmx) return false;
      refreshTimer = setTimeout(() => {this.getRentStatu()}, 60*1000);
    }).catch((err) => {
      clearTimeout(refreshTimer);  //移除计时器
      clearTimeout(coutTimer);
    });
  },

  //计时器,首页租借中订单时间
  timer: function(borrowTime){
    var differ = util.diffTime(borrowTime); // 时间戳差
    var strs = util.diffTimeFormat(differ); // 格式： 00:00:00
    this.setData({
      times: strs
    });
    clearTimeout(coutTimer);
    coutTimer = setTimeout(() => {this.timer(borrowTime)},1000);
  }, 

   // 倒计时
   countdown: function (endTime) {
    let begintime = util.formatTime(new Date()); // 获取当前时间
    let dateDiff = util.diffTime(begintime, endTime);
    let remainingTime = util.diffTimeFormat(dateDiff);

    this.setData({
      times: remainingTime
    })

    clearTimeout(coutTimer);
    if (dateDiff < 1) {
      this.getRentStatu();
      return false;
    }
    coutTimer = setTimeout(() => {this.countdown(endTime)},1000);
  },
  

  // 导航
  toNavigation: function(e) {
    const {lat, lng, name, address} = e.currentTarget.dataset;
    wx.openLocation({
      latitude: +lat,
      longitude: +lng,
      scale: 15,
      name: name,
      address: address
    })
  },

  //页面跳转
  jumpPage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var lg = util.getLanguage(language);
    var commonLg = util.getLanguage(common);
    
    this.setData({
      lg: lg,
      commonLg: commonLg
    })

    this.getRentStatu();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearTimeout(refreshTimer);
    clearTimeout(coutTimer);//隐藏页面时清除计时
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearTimeout(refreshTimer);
    clearTimeout(coutTimer);//隐藏页面时清除计时
  }
})
