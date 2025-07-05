const utl = require('/utls/utls.js')
const cmmn = require('/utls/cmmn.js')
/**lgnAfterEventCallMethod :登录后处理事件
 * successGetUserInfoEventCallback:成功受权拿到用户信息后回调
 * successLoginEventForCallback: 成功登录后系统回调
 * failLoginEventForCallback:登录失败后回调方法.
 * completLoginEventForCallback:登录完成（包括失败)回调方法...
 */
App({
  //全局参数
  glbParam: {
    systemName: "易购智能充电",//系统名称
    rqstBaseUrl: null,//request合法域名
    flagForCurrMsg: false,//true当前用户有未读信息，false当前用户没有未读信息   
    ssnId: null,//服务端返回的sessionid 以便以后调服务器方法认证使用
    ssn_3rd: null,//服务器登录时登录成功后返回来的云商session
    currLatX: "39.90960456049752",
    currLonY: "116.3972282409668",
    code: null,/**微信客户端返回code */
    credentForGetUsrInfo: false,//标记用户是否同意获取其头像等信息
    timesForLogining: 0,//确定系统登录的次数....
    isFlagForLoginning: false,//标记用户是否正在登录...
    isFlagForLoginningServer: 0,//标记服务器登录状态。。
    currentUserInfo: null,//保存当前登录用户信息..(提交到服务器时的和户信息)
    custNo: null,//成功登录后服务端返回的客户号
    waitting_times_max: 11,//最大等待次数
    waitting_second_max: 500,//等待时间
    waitting_Times_Flag: 0, //等待时间
    //baseUrl: "https://rchg.xiaobangshou.net.cn/rchg",
    //serverUrl: "https://rchg.xiaobangshou.net.cn",
    baseUrl: "https://ewx.szego168.com/rest",
    serverUrl: "https://ewx.szego168.com",

    serveiceTelNo: "075533926001"//服务电话
  },
  //onLaunch...
  onLaunch: function (options) {
    // Do something initial when launch. 生命周期涵数，监听小程序初始化
    //1.登录
    const that = this;
    //2. 初始化全局请求地址
    this.glbParam.rqstBaseUrl = utl.getRqstBaseUrl();
    //3. 初始化Y坐标
    var longY = null;
    try {
      longY = wx.getStorageSync('longY');
    } catch (e) {
    }
    longY= (longY == null || longY == "" || longY == undefined)?114.057868:null;
    this.glbParam.currLonY = longY;
    //4. 初始化X坐标
    var latX = null;
    try {
      latX = wx.getStorageSync('latX');
    } catch (e) {
    }
    latX=(latX == null || latX == "" || latX == undefined)?22.543099:null;
    that.glbParam.currLatX = latX;

    console.log(options);
  },
  //显示页面 ..
  onShow: function (options) {
    console.log(options);
  },
  //隐...
  onHide: function () {
    // Do something when hide.生命周期函数， 监听隐藏...
  },
  onError: function (msg) {
    //错误监听函数
  },
  //标记是否正在登录中...  
  /**获取当前用户是否已经登录，其中参数mustAlt：true表示当没有登录时需要弹出提示框 */
  isLogined: function (mustAlt) {
    if (this.glbParam.ssn_3rd == null || this.glbParam.ssn_3rd == undefined ||
      this.glbParam.ssn_3rd == "") {
      if (mustAlt) {
        try {
          utl.altDialog("提示", "正在登录中...稍后等等!", "确定", null);
        } catch (res) {
        }
      }
      return false;
    }
    return true;
  },
  /**当前用户拒绝获到用户信息，调用此方法，并提示用户*/
  refusedGetUserInfoWithUser: function () {
    this.refusedForGetUserInfoByMsg("拒绝受权获取微信昵称等信息，部分功能您将无法使用,是否重新受权！");
  },
  /*如果用户不同意，受权获取头像等资源，调用此方法提示用户...*/
  refusedForGetUserInfoByMsg: function (msg) {
    var that = this; 
    utl.cnfmDialogForText("提示", msg, function (res) {
      try {
        wx.reLaunch({url: '/pages/kp/kp'})
      } catch (error) {
      }
    }, "是", function (rs) {
      //把skip的递归中断
      if (that.refusedGetUserInfoForCallback) {
        that.refusedGetUserInfoForCallback();
      }
      wx.reLaunch({url: '/pages/index/index?rfsGetUserInfo=TRUE'})
    }, "否", false)
  },
  /**根据微信的code及usrInfo信息，处理共享充电系统登录相关事务并实现登录
   * 1.判断是否在登录中..
   * 2.保存登录数的全局参数
   * 3.处理成功获取到头象的回调
   * 4.处理服务器登录请求....
  */
  doLoginWithGetUserInfoEvent: function (usrInfo) {
    //1.先判断一下是否正在登录中..
    if (this.glbParam.isFlagForLoginning) {
      //正在登录，退出...
      return;
    }
    //2.标记正在登录
    this.glbParam.isFlagForLoginning = true;    
    this.glbParam.credentForGetUsrInfo = true;
    //3.标记登录次数
    this.glbParam.timesForLogining = this.glbParam.timesForLogining + 1;
    //处理成功获取到头象后的回调..
    if (this.successGetUserInfoEventCallback) {
      this.successGetUserInfoEventCallback(usrInfo);
    }
    //4. 保存头象头象avatarUrl..
    try {
      var avatarUrl = (usrInfo.userInfo == null || usrInfo.userInfo == undefined) ? "" : usrInfo.userInfo.avatarUrl;
      this.glbParam.currentUserInfo = usrInfo.userInfo;
      wx.setStorageSync('CURRENT_AVATARURL', avatarUrl);
    } catch (errMsg) {
    }
    //5.请求 
    try {
      //共享充电服务器验证....
      this.doLoginFoServerEvent(usrInfo);
    } catch (errMsg) {
    }
    this.glbParam.isFlagForLoginning = false;
  },
  /**根据微信返回的信息登录共享充电器器....
   * 1.分解微信返回的数据
   * 2..调服务端方法登录
   * 3.处理端返回参数   * 
   */
  doLoginFoServerEvent: function (usrInfo) {
    //0.是否正在登录服务器. 处理重复登录....
    if(this.glbParam.isFlagForLoginningServer){
      return;
    }
    this.glbParam.isFlagForLoginningServer=true;
    //1.分解微信返回的服务器...
    var encryptedData = usrInfo.encryptedData;
    var iv = usrInfo.iv;
    var avatar = (usrInfo == null || usrInfo == undefined) ? "" : usrInfo.avatarUrl;
    var nkNmae = (usrInfo == null || usrInfo == undefined) ? "" : usrInfo.nickName;
    var info = usrInfo.userInfo;
    var that = this;
    var code = this.glbParam.code + "";

    utl.wxRequsetForPost("whitelist", "wxappLogin", {
      code: that.glbParam.code,
      nickName: nkNmae,
      avatarUrl: avatar,
      iv: iv,
      encryptedData: encryptedData
    }, function (rs) {
      that.glbParam.isFlagForLoginningServer = 0;
      that.glbParam.code = code;
      var result = rs.data.result;
      if (result == "success") {
        //1.分析返回参数成功
        var sssId=rs.data.responseInfo;
        var arySession = sssId.split("_");
        //2. 保存参数session。。
        that.glbParam.ssn_3rd = arySession[0];
        try {
          wx.setStorageSync('ssn_3rd', that.glbParam.ssn_3rd)
        } catch (e) {
          try {
            wx.setStorageSync('ssn_3rd', that.glbParam.ssn_3rd)
          } catch (e) {
          }
        }
        //3. 保存客户
        that.glbParam.custNo = "";
        if ((arySession.length > 2)) {
          that.glbParam.custNo=arySession[2];
        }
        //4.回调成功事件..
        if (that.successLoginEventForCallback) {
          that.successLoginEventForCallback();
        }
      } else {
        if (that.onLoginFailCallback) {
          that.onLoginFailCallback();
        }
        //失败就登录3次...直到成功....
        if (that.glbParam.timesForLogining < 3) {
          that.doLoginWithGetUserInfoEvent(usrInfo);
        }
      }
    },function (msg) {
        //失败
      that.glbParam.isFlagForLoginningServer = 0;
      if (that.failLoginEventForCallback) {
        that.failLoginEventForCallback();
      }
      //失败就登录3次...直到成功....
      if (that.glbParam.timesForLogining < 3) {
        that.doLoginWithGetUserInfoEvent(usrInfo);
      }
    },function (msg) {
      that.glbParam.isFlagForLoginningServer = 0;
      //完成
      if (that.completLoginEventForCallback) {
        that.completLoginEventForCallback();
      }
    })
  },
  /**需要登录后才能触发的事件..  微信验证登录成功后系统自动执行些事件  
   * 处理逻辑， 1.判断是否已成功登录
   * 2 若登录未结束，等待500毫秒，再次判断是否已成功登录
   * 3 若登录成功，系统回调用此方法.
   * 4 若一直未登录，一直循环等待15秒后, 若还没有登录成功，退出
   **/
  lgnAfterEventCallMethod: function (mthd) {
    //1.1登录后在调用参数中的方法
    var that = this;
    //2.判断是否已经登录
    if (this.glbParam.ssn_3rd == null || this.glbParam.ssn_3rd == undefined || this.glbParam.ssn_3rd == "") {
      if (!this.glbParam.credentForGetUsrInfo) {
        this.refusedForGetUserInfoByMsg("您未同意受权获取您的昵称等信息，此功能不可用，是否重新允许?");
        this.glbParam.waitting_Times_Flag= 0;
        return;
      }
      if (this.glbParam.waitting_Times_Flag > this.glbParam.waitting_times_max) {
        this.glbParam.waitting_Times_Flag = 0;
        utl.hideLoading();
        this.glbParam.credentForGetUsrInfo = false;
        utl.cnfmDialogForText("提示", "登录服务器超时,请重新扫码登录！", function (res) {
          try {
            wx.reLaunch({url: '/pages/kp/kp'})
          } catch (error) {
          }
        }, "登录", function (rs) {

        }, "不登录", false);
        return;
      }
      if (this.glbParam.waitting_Times_Flag == 0) {
        utl.showLoading("加载中...");
      }
      this.glbParam.waitting_Times_Flag = this.glbParam.waitting_Times_Flag + 1;
      //理新调...
      setTimeout(function () {
           that.lgnAfterEventCallMethod(mthd)
        }, this.glbParam.waitting_second_max);
      return;
    } else {
      if (this.glbParam.waitting_Times_Flag > 0) {
        utl.hideLoading();
      }
      this.glbParam.waitting_Times_Flag = 0;
      if (mthd != null) {
        mthd();
      }
    }
  },
  /**绑定需要回到地图页面的按钮*/
  HomeBtnOnBind: function (object) {
    if (object != null) {
      object.goToIndexPage = this.goToIndexPage

    }
  },
  /**跳到首页 */
  goToIndexPage: function () {
    try {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    } catch (e) {

    }
  },
  /**处理重复操作的问题，操作时屏闭..*/
  firstOperate: function (object, message) {
    return this.showLoadingForFirstOperate(object, message, true);
  },

  /**处理重复操作的问题，操作时屏闭 返回false没有结果..flag:true表示显示加载..flase不显示*/
  showLoadingForFirstOperate: function (object, message, flag) {
    if (object.data.doubleOperateFlag ==null|| object.data.doubleOperateFlag == undefined) {
      object.setData({
        doubleOperateFlag: true
      });
    }
    if (!object.data.doubleOperateFlag) {
      return false;
    }
    object.setData({
      doubleOperateFlag: false
    })
    object.data.doubleOperateFlag = false;
    if (flag) {
      utl.showLoading(message);
    }
    return true;
  },

  /**删除防重复操作的屏层.*/
  endOperate: function (object) {
    this.showLoadingEndOperate(object, true);
  },
  /*删除防重复操作的屏层.*/
  showLoadingEndOperate: function (object, loadingFlag) {
    object.setData && object.setData({
      doubleOperateFlag: true
    })
    if (object.data){
      object.data.dbOperationFlag = true;
    }
    if (loadingFlag) {
      utl.hideLoading()
    }
  },

  //处理微信扫一扫后得到的二维维结果..
  handleEwmUrl: function (obj, ewmUrlContext) {
    this.handleEwmUrlAndConfirmFun(obj, ewmUrlContext, null);
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
  chargerEwm: function (obj, sCharger) {
    this.chargerEwmAndConfirmFun(obj, sCharger, null);
  },
  /**
   * 根据充电器id跳转到扫码充电界面..
   */
  chargerEwmAndConfirmFun: function (obj, sCharger, confirmFun) {
    var that = this;
    //处理扫码服务..
    that.scanDeviceForService(obj, sCharger, confirmFun);
  },
  /**
   * 处理扫码服务..
   * isPay:确定是否从聚合支付界面过来..
   */
  scanDeviceForService: function (obj, scanResult, confirmFun) {
    //得到扫码结果，请求服务器
    var that = this;
    let ssn_3id = that.getStorageSsn3rd();
    var keycode = cmmn.getKeyCode([scanResult], that.glbParam.code)
    utl.wxRequset("wxapp", "scanDevice", {
      scanResult: scanResult,
      session3rd: that.glbParam.ssn_3rd || ssn_3id,
      keyCode: keycode,
      currLatitude: that.glbParam.currLatX,
      currLongitude: that.glbParam.currLonY
    }, function (rs) {
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
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          wx.navigateTo({
            url: '/pages/cntuAndFnsh/cntuAndFnsh'
          })
        } else {
          that.endOperate(obj);
          utl.altDialog('提示', '处理二维码信息异常，请确定扫码正确!', '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        }

      } else {
        that.endOperate(obj);
        if (rs.data.result == 'error') {
          utl.altDialog('提示', rs.data.message, '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        } else {
          utl.altDialog('提示', '系统异常，请确认扫码正确，重新尝试!', '确定', function () {
            if (confirmFun) {
              confirmFun();
            }
          })
          return;
        }
      }
    },
      function (msg) {
        that.endOperate(obj);
        utl.altDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', function () {
          if (confirmFun) {
            confirmFun();
          }
        })
        //失败
        that.endOperate(obj);
      },
      function (msg) {
        //完成
      })
  },
  //同步session
  getStorageSsn3rd: function(){
    var sss_3id = "";
    try {
      sss_3id = wx.getStorageSync('ssn_3rd');
    } catch (e) {
      try {
        sss_3id = wx.getStorageSync('ssn_3rd');
      } catch (e) {
        // Do something when catch error
      }
    }
    return sss_3id;
  },
  //扫充电器上的二维码===============================================  
  //充电器归还,调ajax，服务端归还**********************************************
  chargerGH: function (obj, deviceNo, chargerId) {
    this.chargerGHAndConfirmFun(obj, deviceNo, chargerId, null)
  },
  //充电器归还,调ajax，服务端归还**********************************************还确定回调事件
  //ConfirmFun:确定回调件..
  chargerGHAndConfirmFun: function (obj, deviceNo, chargerId, ConfirmFun) {
    var that = this;
    var keycode = cmmn.getKeyCode([deviceNo, chargerId], that.glbParam.code)
    utl.wxRequset("wxapp", "deviceGH.htm", {
      session3rd: that.glbParam.ssn_3rd,
      keyCode: keycode,
      deviceNo: deviceNo,
      chargerId: chargerId
    }, function (res) {
      that.endOperate(obj);
      if (res.data.result == 'error') {
        //是否是因为...deviceGH.htm
        var responseInfo = res.data.responseInfo;
        if (responseInfo != null && !isNaN(responseInfo)) {
          //是数据..
          var size = parseInt(responseInfo);
          if (size > 0) {
            utl.confirmDialog("提示", "您名下有多个充电器，请点'确定'后，扫要归还的充电宝二维码继续归还！"
              , function (rs) {
                that.scanChargerGH(obj, deviceNo);
              }, function (rs) {
              })
            return;
          }
        }
        utl.altDialog('提示', res.data.message, '确定', function () {
          if (ConfirmFun) {
            ConfirmFun();
          }
        })
      } else {
        try {
          wx.setStorageSync('responseInfo', res.data.responseInfo)
        } catch (errStor) { }
        wx.navigateTo({
          url: '/1to6/pages/331orderDetails/331orderDetails'
        })
      }
    }, function (msg) {
      utl.altDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', function () {
        if (confirmFun) {
          confirmFun();
        }
      })
      that.endOperate(obj);
      //失败
    }, function (msg) {
      //完成
    })
  },
  //充电器归还,调ajax，服务端归还**********************************************  
  //二次扫充电器的二维码，归还===============================================
  scanChargerGH: function (obj, deviceNo) {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var scanResult = res.result;
        var chargerId = null;
        scanResult = scanResult.toUpperCase();
        if (scanResult.indexOf('/dt/sbg.htm') > -1 || scanResult.indexOf("ID=") < 0) {
          utl.altDialog('提示', '您扫描的二维码不正确, 请扫描充电宝上的二维码!', '确定', null)
        } else {
          chargerId = scanResult.substring(scanResult.indexOf('ID=')).replace("ID=", "");
          that.chargerGH(obj, deviceNo, chargerId);
        }
      }
    });
  },
  //二次扫充电器的二维码，归还===============================================  
  //扫设备柜归还**********************************************
  deviceGH: function (obj, scanResult) {
    this.deviceGHConfirmFun(obj, scanResult, null)
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
  backCharger: function (obj, deviceId) {
    var params = [deviceId];
    var that = this;
    var keycode = cmmn.getKeyCode(params, that.glbParam.code);

    utl.wxRequsetForPost("wxapp", "toBk.htm", {
      session3rd: that.glbParam.ssn_3rd,
      keycode: keycode,
      deviceId: deviceId,
      currLatitude: that.glbParam.currLatX,
      currLongitude: that.glbParam.currLonY
    }, function (success) {
      that.endOperate(obj);
      if (success.data.responseInfo == null) {
        utl.altDialog('提示', success.data.message, '确定', that.moveToIndex)
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
        } else if (pageNO == '6') {
          //密码设备，费用页面
          wx.navigateTo({
            url: '/pages/offlineGeneral/costDetails/costDetails'
          })
        }
      }
    }, function (error) {
      utl.altDialog('提示', '网络超时，请重新尝试.', '确定', that.moveToIndex)
      that.endOperate(obj);
    }, function (complete) { })
  },

  //解释扫码结果，拿到充电器id===============================================
  getChargerIdByScanResult: function (scanResult) {
    if (scanResult == '') {
      //错误提示页面TODO
      utl.altDialog('提示', '请扫描正确的二维码!', '确定', null)
      return;
    }
    scanResult = scanResult.toUpperCase();
    var begin = scanResult.indexOf('ID=');
    var result = scanResult.slice(begin);
    result = result.replace("ID=", "");
    return result;
  },
  //保存formId操作,此操作就算是失败，也不应该影响主业务流程
  saveFormId: function (formId, isPrePayId) {
    var that = this;
    var keycode = cmmn.getKeyCode([], that.glbParam.code)
    if (formId == undefined || formId == null || formId == '') {
      return;
    }
    var param = {};
    if (isPrePayId == undefined || isPrePayId == null || isPrePayId == '' || !isPrePayId) {
      //formId
      param = {
        session3rd: that.glbParam.ssn_3rd,
        formId: formId,
        keyCode: keycode
      }
    } else {
      //支付
      param = {
        session3rd: that.glbParam.ssn_3rd,
        prepayId: formId,
        keyCode: keycode
      }
    }
    utl.wxRequset("wxapp", "saveFormId", param, function (success) {
    }, function (fail) {

    }, function (complete) {

    })
  },
  /**
   * key:同步缓存Key
   * value:同步缓存value
   * canIdelete:如果为true该缓存能被删除，false为全局缓存不能删除
   * 注：该方法在保存异常的情况下，会先删除掉最先进来的缓存，然后再尝试保存此缓存操作
   */
  wxAppSetStorageSync: function (key, value, canIDelete) {
    var that = this;
    var canIDelete = ('false' == canIDelete || false == canIDelete) ? false : true;
    if (that.glbParam.storageQueue == null || that.glbParam.storageQueue.length == 0) {
      that.glbParam.storageQueue = utl.newQueue(50); //默认50size队列，保存能自动移除的缓存key
    }

    that.glbParam.storageQueue.remove(key) //首先移除之前存在相同的队列中的key

    try {
      wx.setStorageSync(key, value) //保存同步缓存
    } catch (e) {
      //失败
      try {
        var queueSize = that.glbParam.storageQueue.size(); //缓存队列大小，用来控制缓存出异常时，是否再次调用保存缓存方法
        if (queueSize > 0) {
          var firstKey = that.glbParam.storageQueue.pop(); //移除最早进来的缓存key
          wx.removeStorageSync(firstKey); //移除最早进来的缓存
          that.wxAppSetStorageSync(key, value, canIDelete); //重新尝试再次保存缓存，直到成功
        }
      } catch (ee) {

      }
    }
    if (canIDelete) {
      that.glbParam.storageQueue.push(key); //如果能被自动移除的缓存则保存key到队列中
    }
  },
  /**
   * 移除缓存，同时移除队列中的缓存key
   */
  wxAppRemoveStorageSync: function (key) {
    var that = this;
    if (that.glbParam.storageQueue == null || that.glbParam.storageQueue.length == 0) {
      that.glbParam.storageQueue = utl.newQueue(50); //默认50size队列，保存能自动移除的缓存key
    }
    try {
      wx.removeStorageSync(key) //移除此key的缓存
    } catch (e) {
      try {
        wx.removeStorageSync(key) //再次尝试移除此key的缓存
      } catch (e) {
      }
    }
    that.glbParam.storageQueue.remove(key) //首先移除之前存在相同的队列中的key
  },
  //跳到首页
  moveToIndex: function () {
    try {
      wx.reLaunch({
        url: '/pages/index/index'
      })
    } catch (e) {

    }
  }
})