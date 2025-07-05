// /pages/index/index.js
const app = getApp();
const cmmn = require('/utls/cmmn.js')
const utls = require('/utls/utls.js')

Page({
  data: {
    headImgUrl:'',//个人头像
    msgFlag:false, //是否显示头像的红点
    unRead:0, //未读消息条数
    userOperateForFlag:false, //用户操作标识，表示用户是否已经点击过。用于防重复提交
    addrs:'搜索附近共享充电器', //地图首页搜索框默认内容
    standard_window_height:603,//标准手机高
    standard_window_width:375, //标准手机宽
    standard_window_rate:0.86, //比例
  },
  //用于定位地图搜索
  getLocationForOnShow:true,

  onLoad(query) {
   
  },

  onShow() {
    var that = this;
    //0结束来自于上个页面的操作
    app.endOperate(that);
    if(app.glbParam.isAuth == -1){
      app.afterLogin().then(
        isAuth => {
            //已经授权过
            if(isAuth ==1){
            //个人头像
            that.setData({headImgUrl:app.glbParam.custInfoModel.headImgUrl});
            //1初始化地图
            that.initMap();
            //2.重新定位当前用户位置
            if(that.getLocationForOnShow){
              that.refreshLocation();
            }
            //3获取未读消息条数,如果有未读消息显示红点
            that.unrdMsgCount();
          }else{
            console.log("index ....跳kp")
            //未注册用户跳到kp页面授权注册
            that.redirectPage();
          }
        }
      );
    }else{
      //已经注册过的。直接渲染
      //个人头像
      that.setData({headImgUrl:app.glbParam.custInfoModel.headImgUrl});
      //1初始化地图
      that.initMap();
      //2.重新定位当前用户位置
      if(that.getLocationForOnShow){
        that.refreshLocation();
      }
      //3获取未读消息条数,如果有未读消息显示红点
      that.unrdMsgCount();
    }

  },

  /** 如果用户已经注册过，不用跳转页面，否则跳到注册页面*/
  redirectPage(){
    //如果发现用户未授权，跳转到kp/kp页面授权
    if(app.glbParam.isAuth == -1){
       my.reLaunch({
          url: '/pages/kp/kp?fromWhere=index'
        });
    }else{
      //登陆成功，设置个人头像
      this.setData({headImgUrl:app.glbParam.custInfoModel.headImgUrl});
    }
  },

  /*获取未读消息条数,如果有未读消息显示红点 */
  unrdMsgCount(){
    var that = this;
    utls.wxRequset("zfb", "getMyMessageCoutInfo", {
      custNo: app.glbParam.custNo,
      id:''
    }, function (success) {
      //成功
      var unRead = success.data.unRead;
      if (unRead >= 1) {
        that.setData({
          msgFlag: true,
          unRead: success.data.unRead
        })
      }
    });

  },
  //点击头像，进入个人中心
  usrCtBindtap(){
    //只有授权过才可以进个人中心
    if(app.glbParam.isAuth == -1){
      return;
    }
    //防重复点击开始=============
      if (!app.firstOperate(this, "加载中...")) {
        return;
      }
       my.navigateTo({
        url: '/pages/usrCt/usrCt'
      });
  },
  //点击地图上方搜索框
  searchNearDevices(){
    var that = this;
    this.getLocationForOnShow = false;
    my.chooseLocation({
      success: function (res) {
        var longitude = res.longitude;
        var latitude = res.latitude;
        that.setData({
          latX: latitude,
          lonY: longitude
        })
      }
    });
  },

  //点击地图上的控件
  bindcontroltap(e){
    var that = this;
    switch (e.controlId) {
      //回到当前用户位置
      case 1:
        that.setData({
          latX: app.glbParam.currLatX,
          lonY: app.glbParam.currLonY
        })
        that.mapContext = my.createMapContext("map");
        that.mapContext.moveToLocation();
        break;
      case 2:
        //点地图上扫码按钮
        //只有授权过才可以扫码
        if(app.glbParam.isAuth == -1){
          return;
        }
        //防重复点击开始=============
        if (!app.firstOperate(this, "加载中...")) {
          return;
        }
        app.scanQrCode();
        break;
      case 6:
        //使用帮助
        that.moreHelp();
        break;
    }

  },
  //使用帮助
  moreHelp(){
    var phone = app.glbParam.serveiceTelNo;
    my.showActionSheet({
      items: ['拨打客服电话', '常见问题'],
      success: function (res) {
        if (res.success && res.index == 0) {//拨打客服电话
          my.makePhoneCall({ number: phone });
        }
        if (res.success && res.index == 1) {//常见问题
          my.navigateTo({
            url: '/pages/commentPro/commentPro'
          });
        }

      }
    })
  },
  //重新定位方法
  refreshLocation(){
     my.getLocation({
        type: 0, //默认，获取经纬度
        success: (res) => {
          app.glbParam.currLatX = res.latitude
          app.glbParam.currLonY = res.longitude
          this.setData({
            latX: res.latitude,
            lonY: res.longitude
          })
        },
      })
      this.mapContext = my.createMapContext("map");
      this.mapContext.moveToLocation();
      this.getLocationForOnShow = true;
  },
  //初始化地图
  initMap(){
    var that=this;
    my.getSystemInfo({
      success: (res) => {
        var heightToTop = res.windowHeight * that.data.standard_window_rate;
        app.glbParam.heightToTop = heightToTop;
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
          },
          {
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
              left: res.windowWidth-55,
              top: heightToTop - 60
            },
            clickable: true
          }]
        })
      },
    })
  }

});
