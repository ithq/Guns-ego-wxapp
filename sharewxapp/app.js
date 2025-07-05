const util = require('/utils/util.js')
const common = require('/utils/common.js')
/**loginAfterCallMethod
 * pages.js中可以实现的接口方法
 * onLoginSuccessCallback: 登录成功能后回调方法..
 * onLoginFailCallback:登录失败后回调方法.
 * onLoginCompleteCallback:登录完成（包括失败)回调方法...
 * userInfoReadyCallback:成功获取微信用户信息后回调方法..
 */
App({
  onLaunch: function (options) {
    // Do something initial when launch. 生命周期涵数，监听小程序初始化
      //1.登录
    const that = this
    //初始化
    var latitude =null
    try {
      latitude = wx.getStorageSync('latitude')
    } catch (e) {
      // Do something when catch error
    }
    if (latitude == null || latitude == "" || latitude==undefined) {
      latitude = 22.543099;
    }
    this.globalData.currLatitude = latitude
    var longitude = null
    try {
      longitude = wx.getStorageSync('longitude')
    } catch (e) {
      // Do something when catch error
    }
    if (longitude == null || longitude == "" || longitude == undefined) {
      longitude = 114.057868;
    }
    this.globalData.currLongitude = longitude

    this.globalData.requestRootUrl = util.getRequestRootUrl()    
  },
  onShow: function (options) {
    this.globalData.scene = options.scene;
    var scene = [1011, 1047, 1089, 1038];//打开official-account需要的一个场景值
    var indexof = scene.indexOf(options.scene);
    if (indexof>-1) {
      //场景在数组中的处理
      this.globalData.sceneBoolean=true;
    } else {
      //场景不在数组中的处理
      this.globalData.sceneBoolean = false;
    }
  },
	  
  onHide: function () {
    // Do something when hide.生命周期函数， 监听隐藏...
  },
  onError: function (msg) {
    //错误监听函数
  },
  is_loginning_flag:false,
  
  
  //用户拒绝 受权处理逻辑,带信息
  refuseGetUserInfoByMsg:function(msg){
    var that = this;
    //wx.setStorageSync('responseInfo', rs.data.responseInfo)
    //confirmDialog(title, content,  confirmFun,cancelFun)       
    util.confirmDialogForText("提示", msg, function (res) {
      //登录...
    	try {
        	wx.reLaunch({
        	      url: '/pages/skip/skip'
        	})
        }catch(error){
        }     
    }, "是", function (rs) {
      //把skip的递归中断
      if (that.refuseGetUserInfoCallback){
        that.refuseGetUserInfoCallback();
      }     
      wx.reLaunch({
	      url: '/pages/index/index?useRefused=TRUE'
      })
    }, "否", false)
  },
  //用户拒绝 受权处理逻辑...
  refuseGetUserInfo:function(){
    this.refuseGetUserInfoByMsg("拒绝获取微信昵称信息后，系统部分功能不可用，是否重新允许！");
  },
  is_onLoginToYzdService_flag: 0,
  //登录系统服务器...
  onLoginToYzdService: function (userInfoRs) {
    var userInfo = userInfoRs.userInfo; 
    var iv = userInfoRs.iv;
    var encryptedData = userInfoRs.encryptedData;
    var nickName = (userInfo == null || userInfo == undefined) ? "" : userInfo.nickName;
    var avatarUrl = (userInfo == null || userInfo == undefined) ? "" : userInfo.avatarUrl;
    var that=this;
    //控制重复提交...因为code微信会刷新，在零界点可能会多点登录
    that.is_onLoginToYzdService_flag = that.is_onLoginToYzdService_flag+1;
    if (that.is_onLoginToYzdService_flag>1){      
      //等待一秒..
      return;
    }
    var globalDataCode = that.globalData.code+"";
    
    util.shareRequestPost("whitelist", "wxappLogin", {
      code: that.globalData.code,
      nickName: nickName,
      avatarUrl: avatarUrl,
      iv: iv,
      encryptedData: encryptedData
    },function (rs) {
        that.is_onLoginToYzdService_flag = 0;
        that.globalData.code = globalDataCode;
        const thisRoot = that;
        if (rs.data.result == "success") {
          //成功
          var ary = rs.data.responseInfo.split("_");
          that.globalData.session_3rd = ary[0];
          that.globalData.custNo=(ary.length>2)?ary[2]:"";
          //save session
          try {
            wx.setStorageSync('session_3rd', that.globalData.session_3rd)
          } catch (e) {
            try {
              wx.setStorageSync('session_3rd', that.globalData.session_3rd)
            } catch (e) {
            }
          }
          if (that.onLoginSuccessCallback) {
            that.onLoginSuccessCallback();
          }
        } else {
          if (that.onLoginFailCallback) {
            that.onLoginFailCallback();
          }
          //失败就登录3次...直到成功....
          if (that.globalData.loginTimes < 3) {
            that.onGetUserInfo(userInfoRs);
          }
        }
      },
      function (msg) {
        //失败
        that.is_onLoginToYzdService_flag = 0;
        if (that.onLoginFailCallback) {
          that.onLoginFailCallback();
        }
        //失败就登录3次...直到成功....
        if (that.globalData.loginTimes<3){
          that.onGetUserInfo(userInfoRs);
        }
      },
      function (msg) {
        that.is_onLoginToYzdService_flag = 0;
        //完成
        if (that.onLoginCompleteCallback) {
          that.onLoginCompleteCallback();
        }
      })
  },
  /**服务端登录，并得到个人信息 */
  onGetUserInfo:function (userInfoRs) {
	 
    const that = this;
    if (that.is_loginning_flag) {
      return;
    } 
    that.is_loginning_flag = true;
    that.globalData.loginTimes = that.globalData.loginTimes+1;
    
    that.globalData.credentialsForGetUserInfo = true;
    
    try {
      that.globalData.userInfo = userInfoRs.userInfo;
      var avatarUrl = (userInfoRs.userInfo == null || userInfoRs.userInfo == undefined) ? "" : userInfoRs.userInfo.avatarUrl;
      wx.setStorageSync('YZD_WX_AVATARURL', avatarUrl);
    } catch (errMsg) {
    }
    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    // 所以此处加入 callback 以防止这种情况
    if (that.userInfoReadyCallback) {
      that.userInfoReadyCallback(userInfoRs)
    }
    
    //请求
    try{
    	that.onLoginToYzdService(userInfoRs);	  
    }catch(errMsg){
    }
    that.is_loginning_flag = false;
  },
  /** 绑定主页功能按钮*/
  bindHomePageButton:function(obj,homeUrl){
    var that = this;
    if(obj!=null){
      obj.goWxAppHomePageForHomePageButton = that.moveToIndex
       
    }
  },
  /**判断是否已经登录...isAlter=true时,会提示登录状态.. */
  isHaveLogin: function (isAlter) {
    if (this.globalData.session_3rd == null || 
      this.globalData.session_3rd==undefined ||
      this.globalData.session_3rd == ""){
        if(isAlter){
          try{
            util.alterDialog("提示","系统初始中,请稍等一会会!", "确定", null);
          }catch(res){
          }
        }
        return false;
      }
    return true;
  },
  /**处理,
   * 1登录后在调用参数中的方法.  2如果没有登录，那系统自动等待500毫秒，在判断系统登录.
   * 3登录了系统调用method.   4 15秒后如果还是没有成功退出*/  
  loginAfterCallMethod:function(method){
    //1.1登录后在调用参数中的方法
    var that=this;
    if (this.globalData.session_3rd == null ||
      this.globalData.session_3rd == undefined ||
      this.globalData.session_3rd == "") {
      //登录是否已受权，未受权，跳转到受权界面...
      try {
        if (!this.globalData.credentialsForGetUserInfo){
          this.refuseGetUserInfoByMsg("您未受权获取昵称等信息，此功能不可用，是否重新允许?");
          this.globalData.waitingTimesFlag=0;
          return;
        }
      }catch(ee){
      }
      //MAXWAITINGTIMES: 40,//最大等待次数 //WIATINGTIMESECOND:500,//等待时间
      //credentialsForGetUserInfo:false,//是否已同意受权获起用户头像尼称等信息..  waitingTimesFlag: 0,
      if (this.globalData.waitingTimesFlag > this.globalData.MAXWAITINGTIMES) {
        this.globalData.waitingTimesFlag = 0;
        util.hideLoading();
        //util.alterDialog("提示", "系统登录超时,请重新登录！", "登录", null);
        this.globalData.credentialsForGetUserInfo = false;
        util.confirmDialogForText("提示", "系统登录超时,请重新登录！", function (res) {                    	
        	//登录...
          	try {
              	wx.reLaunch({
              	      url: '/pages/skip/skip'
              	})
              }catch(error){
              }     
          }, "登录", function (rs) {
            
          }, "不登录", false)
        return;
      }
      if (this.globalData.waitingTimesFlag==0){
        util.showLoading("加载中...");
      }
      this.globalData.waitingTimesFlag = this.globalData.waitingTimesFlag + 1;
      setTimeout(function(){
          that.loginAfterCallMethod(method)
        }, this.globalData.WIATINGTIMESECOND);
      return;
    }else{
      if (this.globalData.waitingTimesFlag > 0) {
        util.hideLoading();
      }
      this.globalData.waitingTimesFlag = 0;
      if(method!=null){
        method();
      }
    }
  },
  /**开始操作..返回false已有操作没有结果..*/
  startOperation: function (obj,msg) {
    return this.startOperationShowLoading(obj,msg,true);
  },

  /**开始操作..返回false已有操作没有结果..loadingFlag:true表示显示加载..flase不显示*/
  startOperationShowLoading: function (obj, msg,loadingFlag) {
    if (obj.data.dbOperationFlag == undefined) {
      obj.setData({
        dbOperationFlag: true
      })
    }
    if (!obj.data.dbOperationFlag) {
      return false;
    }
    if (loadingFlag){
      util.showLoading(msg)
    }
    obj.setData({
        dbOperationFlag : false
    })
    obj.data.dbOperationFlag = false;
    return true;
  },
  /**结束操作..返回false已有操作没有结果..*/
  finishOperation: function (obj) {
    this.finishOperationShowLoading(obj,true);
  },
  /**结束操作..返回false已有操作没有结果.. loadingFlag:true表示显示加载..flase不显示*/
  finishOperationShowLoading: function (obj,loadingFlag) {
    obj.setData({
      dbOperationFlag: true
    })
    obj.data.dbOperationFlag = true;
    if (loadingFlag){
      util.hideLoading()
    }
  },
  //处理微信扫一扫后得到的二维码结果..
  handleEwmUrl: function (obj,ewmUrlContext) {
    this.handleEwmUrlAndConfirmFun(obj, ewmUrlContext,null);
  },
  /*
  *根据扫一扫得到的二维码得到充电器id..
  */
  handleEwmUrlAndConfirmFun: function (obj, ewmUrlContext, confirmFun) {
    var that = obj;
    var schargerId = this.getChargerIdByScanResult(ewmUrlContext);//扫描的充电器号   
    this.chargerEwmAndConfirmFun(that, schargerId, confirmFun);
  },
  //处理充电器id
  chargerEwm: function (obj,sCharger) {
    this.chargerEwmAndConfirmFun(obj, sCharger,null);
  },
  /**
   * 根据充电器id跳转到扫码充电界面..
   */
  chargerEwmAndConfirmFun: function (obj, sCharger, confirmFun) {
    var that = this;
    //处理扫码服务..
    that.scanDeviceForService(obj, sCharger,confirmFun);
  },
  /**
   * 处理扫码服务..
   * isPay:确定是否从聚合支付界面过来..
   */
  scanDeviceForService: function (obj, scanResult, confirmFun){
    //得到扫码结果，请求服务器
    var that = this;
    var keycode = common.getKeyCode([scanResult], that.globalData.code)
    util.shareRequest("wxapp", "scanDevice", {
        scanResult: scanResult,
        session3rd: that.globalData.session_3rd,
        keyCode: keycode,
        currLatitude:that.globalData.currLatitude,
        currLongitude:that.globalData.currLongitude
      },function (rs) {
        if (rs.data.responseInfo) {
          //成功,返回设备租借的信息，加到缓存
          try {
            wx.setStorageSync('responseInfo', rs.data.responseInfo);
          } catch (e) {
            try {
              wx.setStorageSync('responseInfo', rs.data.responseInfo);
            } catch (e) {
            }
          }

          var pageIndex = rs.data.responseInfo.pageIndex; //ContinueAndFinishedPage
          if (pageIndex === 'MyRechargerPage') {
            //跳转到我要充电的界面
            wx.navigateTo({
              url: '/pages/scanResult/scanResult'
            })
          } else if (pageIndex === 'ContinueAndFinishedPage') {
            //跳转到继续使用或者结束的界面...
            wx.navigateTo({
              url: '/pages/continueAndFinish/continueAndFinish'
            })
          } else {
            that.finishOperation(obj);
            util.alterDialog('提示', '处理二维码信息异常，请确定扫码正确!', '确定', function () {
              if (confirmFun) {
                confirmFun();
              }
            })
            return;
          }

        } else {
          that.finishOperation(obj);
          if (rs.data.result == 'error') {
            util.alterDialog('提示', rs.data.message, '确定', function(){
              if (confirmFun){
                confirmFun();
              }
            })
            return;
          } else {
            util.alterDialog('提示', '系统异常，请确认扫码正确，重新尝试!', '确定', function () {
              if (confirmFun) {
                confirmFun();
              }
            })
            return;
          }
        }
      },
      function (msg) {
        that.finishOperation(obj);
        util.alterDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', function () {
          if (confirmFun) {
            confirmFun();
          }
        })
        //失败
        that.finishOperation(obj);
      },
      function (msg) {
        //完成
      })
  },
  //扫充电器上的二维码===============================================  
  //充电器归还,调ajax，服务端归还**********************************************
  chargerGH: function (obj,deviceNo, chargerId) {
    this.chargerGHAndConfirmFun(obj,deviceNo,chargerId,null)
  }, 
  //充电器归还,调ajax，服务端归还**********************************************还确定回调事件
  //ConfirmFun:确定回调件..
  chargerGHAndConfirmFun: function (obj, deviceNo, chargerId, ConfirmFun) {
    var that = this;
    var keycode = common.getKeyCode([deviceNo, chargerId], that.globalData.code)
    util.shareRequest("wxapp", "deviceGH.htm", {
      session3rd: that.globalData.session_3rd,
      keyCode: keycode,
      deviceNo: deviceNo,
      chargerId: chargerId
    }, function (res) {
      that.finishOperation(obj);
      if (res.data.result == 'error') {
        //是否是因为...deviceGH.htm
        var responseInfo = res.data.responseInfo;
        if (responseInfo != null && !isNaN(responseInfo)) {
          //是数据..
          var size = parseInt(responseInfo);
          if (size > 0) {
            util.confirmDialog("提示", "您名下有多个充电器，请点'确定'后，扫要归还的充电宝二维码继续归还！"
              , function (rs) {
                that.scanChargerGH(obj, deviceNo);
              }, function (rs) {
              })
            return;
          }
        }
        util.alterDialog('提示', res.data.message, '确定', function(){
          if (ConfirmFun){
            ConfirmFun();
          }
        })
      } else {
        try {
          wx.setStorageSync('responseInfo', res.data.responseInfo)
        }catch(errStor){}
        wx.navigateTo({
          url: '/1to6/pages/331orderDetails/331orderDetails'
        })
      }
      }, function (msg) {
        util.alterDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', function () {
          if (confirmFun) {
            confirmFun();
          }
        })
      that.finishOperation(obj);
      //失败
    }, function (msg) {
      //完成
    })
  },  
  //充电器归还,调ajax，服务端归还**********************************************  
  //二次扫充电器的二维码，归还===============================================
  scanChargerGH:function(obj,deviceNo){
    var that=this;
    wx.scanCode({
      success: (res) => {
        var scanResult=res.result;
        var chargerId=null;
        scanResult = scanResult.toUpperCase();
        if (scanResult.indexOf('/dt/sbg.htm') > -1 || scanResult.indexOf("ID=")<0) {
          util.alterDialog('提示', '您扫描的二维码不正确, 请扫描充电宝上的二维码!', '确定', null)
        }else{
          chargerId = scanResult.substring(scanResult.indexOf('ID=')).replace("ID=","");
          that.chargerGH(obj,deviceNo, chargerId);
        }
      }
    });
  },
//二次扫充电器的二维码，归还===============================================  
  //扫设备柜归还**********************************************
  deviceGH: function (obj,scanResult) {
    this.deviceGHConfirmFun(obj,scanResult,null)
  },
  /**扫设备柜归还 还确定回调事件 */
  deviceGHConfirmFun: function (obj, scanResult, confirmFun) {
    var begin = scanResult.indexOf('?ID=')
    var id = scanResult.substring(begin, scanResult.length)
    id = id.replace("?ID=", "")
    this.chargerGH(obj, id, "");
  },
  //扫设备柜归还**********************************************
  //扫专用归还二维码（押金租借，密码双二维码)===============================================
  backCharger: function (obj,deviceId) {
    var params = [deviceId];
    var that=this;
    var keycode = common.getKeyCode(params, that.globalData.code);
 
    util.shareRequestPost("wxapp", "toBk.htm", {
      session3rd: that.globalData.session_3rd,
      keycode: keycode,
      deviceId: deviceId,
      currLatitude:that.globalData.currLatitude,
      currLongitude:that.globalData.currLongitude
    }, function (success) {
    	that.finishOperation(obj);
      if (success.data.responseInfo == null) {
        util.alterDialog('提示', success.data.message, '确定', that.moveToIndex)
        return;
      } else {
        //返回数据放缓存
        wx.setStorageSync('responseInfo', success.data.responseInfo)
        var pageNO = success.data.responseInfo.pageNO;
        if (pageNO == '4') {
          //选择继续使用或结束使用
          wx.navigateTo({
            url: '/pages/offlineGeneral/chargingSelect/chargingSelect'
          })
        } else if (pageNO == '6'){
          //密码设备，费用页面
          wx.navigateTo({
            url: '/pages/offlineGeneral/costDetails/costDetails'
          })
        }
      }
    }, function (error) {
      util.alterDialog('提示', '网络超时，请重新尝试.', '确定', that.moveToIndex)
    	that.finishOperation(obj);
     }, function (complete) { })
  },
  
//解释扫码结果，拿到充电器id===============================================
  getChargerIdByScanResult: function (scanResult) {
    if (scanResult == '') {
      //错误提示页面TODO
      util.alterDialog('提示', '请扫描正确的二维码!', '确定', null)
      return;
    }
    scanResult = scanResult.toUpperCase();
    var begin = scanResult.indexOf('ID=');
    var result = scanResult.slice(begin);
    result = result.replace("ID=","");
    return result;
  }, 
  //保存formId操作,此操作就算是失败，也不应该影响主业务流程
  saveFormId:function(formId,isPrePayId){
    var that = this;
    var keycode = common.getKeyCode([], that.globalData.code)
    if(formId == undefined || formId == null || formId == ''){
      return;
    }
    var param = {};
    if (isPrePayId == undefined || isPrePayId == null || isPrePayId == ''||!isPrePayId){
    	//formId
    	param = {
        session3rd: that.globalData.session_3rd,
        formId: formId,
        keyCode: keycode
    	}
    }else{
    	//支付
    	param = {
          session3rd: that.globalData.session_3rd,
          prepayId: formId,
          keyCode: keycode
  		}
    }
    util.shareRequest("wxapp", "saveFormId",param , function (success) {      
      },function(fail){

      },function(complete){
        
      })
  },
 /**
  * key:同步缓存Key
  * value:同步缓存value
  * canIdelete:如果为true该缓存能被删除，false为全局缓存不能删除
  * 注：该方法在保存异常的情况下，会先删除掉最先进来的缓存，然后再尝试保存此缓存操作
  */
 wxAppSetStorageSync:function(key,value,canIDelete){
   var that = this;
   var canIDelete = ('false' == canIDelete || false == canIDelete) ? false : true;
   if (that.globalData.storageQueue == null || that.globalData.storageQueue.length == 0){
    that.globalData.storageQueue =  util.newQueue(50); //默认50size队列，保存能自动移除的缓存key
   }

   that.globalData.storageQueue.remove(key) //首先移除之前存在相同的队列中的key

   try {
     wx.setStorageSync(key, value) //保存同步缓存
   } catch (e) {
      //失败
      try{
        var queueSize = that.globalData.storageQueue.size(); //缓存队列大小，用来控制缓存出异常时，是否再次调用保存缓存方法
        if (queueSize > 0) {
          var firstKey = that.globalData.storageQueue.pop(); //移除最早进来的缓存key
          wx.removeStorageSync(firstKey); //移除最早进来的缓存
          that.wxAppSetStorageSync(key, value, canIDelete); //重新尝试再次保存缓存，直到成功
        }
      }catch(ee){

      }
   }
   if (canIDelete){
     that.globalData.storageQueue.push(key); //如果能被自动移除的缓存则保存key到队列中
   }
},
/**
 * 移除缓存，同时移除队列中的缓存key
 */
 wxAppRemoveStorageSync: function (key){
   var that = this;
   if (that.globalData.storageQueue == null || that.globalData.storageQueue.length == 0) {
     that.globalData.storageQueue = util.newQueue(50); //默认50size队列，保存能自动移除的缓存key
   }
   try {
     wx.removeStorageSync(key) //移除此key的缓存
   } catch (e) {
     try{
        wx.removeStorageSync(key) //再次尝试移除此key的缓存
     }catch(e){
     }
   }
   that.globalData.storageQueue.remove(key) //首先移除之前存在相同的队列中的key
  },
 //跳到首页
 moveToIndex: function () {
   try {
     wx.reLaunch({
       url: '/pages/index/index'
     })
   } catch (e) {

   }
 },
  globalData: {
    scene:null,//场景值
    sceneBoolean: null, //场景值是否包含
    requestRootUrl:null,//request合法域名
    code:null,/**微信客户端返回code */
    session_3rd:null,/**云服务端session */
    sessionId:null,/**sessionId */
    session_randomKey:null,/**random key */
    userInfo:null,/*当前登录的微信用户信息.*/
    // resultImg:"/images/images/cm-bg.jpg", // 扫描结果
    currLatitude: "39.90960456049752",
    currLongitude: "116.3972282409668",
    custNo:"",//用户个人中心账号
    homePageButtonHeight:85,
    //resourceUrl:"https://rchg.xiaobangshou.net.cn/",
    resourceUrl: "https://ewx.szego168.com",
    homePageButtonWidth: 80,  
    msgFlag:false,//是否有新消息，true有，false没有   
    MAXWAITINGTIMES: 10,//最大等待次数
    WIATINGTIMESECOND:500,//等待时间
    credentialsForGetUserInfo:false,//是否已同意受权获起用户头像尼称等信息..
    loginTimes:0,//登录次数...
    waitingTimesFlag: 0,
    serverTelNo:"0755-33926001",//服务电话
    storageQueue: [] //缓存key的集合，统一管理小程序缓存，但全局缓存不在此范围内
  },
  data:{}
})