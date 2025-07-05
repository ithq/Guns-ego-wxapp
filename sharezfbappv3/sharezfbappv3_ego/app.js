
const cmmn = require('/utls/cmmn.js')
const utls = require('/utls/utls.js')
App({
  //全局参数
  glbParam: {
    qrCode: '', //支付宝扫码获取的url内容
    custInfoModel: null, //授权完的用户信息
    alipayUserId: null, //用户对于小程序的唯一标识
    isAuth:-1, //是否已经授权 -1未授权 1已授权
    ssnId: null,//服务端返回的sessionid 以便以后调服务器方法认证使用
    custNo:'', //客户编号
    authCode:'', //用户授权支付宝返回的authCode,
    serveiceTelNo: '400-666-2808', //客服电话
    currLatX: "39.90960456049752",     //默认全局经纬度
    currLonY: "116.3972282409668",
    heightToTop: 603, //手机高
    homeBtnHidden: true, //返回首页隐藏
    advertInfoMap: null, //广告资源
  },

  //解释扫码结果，拿到充电器id===============================================
  getChargerIdByScanResult: function (scanResult) {
    if (scanResult == '') {
      //错误提示页面TODO 
      utls.altDialog('提示', '请扫描正确的二维码!', '确定', null)
      return;
    }
    scanResult = scanResult.toUpperCase();
    var begin = scanResult.indexOf('ID=');
    var result = scanResult.slice(begin);
    result = result.replace("ID=", "");
    return result;
  },
  /**处理二维码内容 */
  handleEwmUrl(obj, ewmUrlContext){
    var that = this;
    var schargerId = that.getChargerIdByScanResult(ewmUrlContext);//扫描的充电器号
    // 提交参数
    var custNo = that.glbParam.custNo;
    var currLatX = that.glbParam.currLatX;
    var currLonY = that.glbParam.currLonY;
    var keyCode = cmmn.getKeyCode([schargerId, custNo, currLatX, currLonY], that.glbParam.authCode)
    utls.wxRequset("zfb", "scanDevice", {
      scanResult: schargerId,
      custNo: custNo,
      currLatitude: currLatX,
      currLongitude: currLonY,
      session3rd: that.glbParam.ssnId,
      keyCode: keyCode
    }, function (rs) {
      if (rs.data.responseInfo != null) {
        //成功,返回设备租借的信息，加到缓存
         my.setStorageSync({
          key: 'responseInfo',
          data: rs.data.responseInfo
        });

        var pageIndex = rs.data.responseInfo.pageIndex; //ContinueAndFinishedPage
        if (pageIndex === 'MyRechargerPage') {
          //跳转到我要充电的界面
          my.navigateTo({
            url: '/pages/scnRslt/scnRslt'
          })
        } else if (pageIndex === 'ContinueAndFinishedPage') {
          //跳转到继续使用或者结束的界面...
          my.navigateTo({
            url: '/pages/cntuAndFnsh/cntuAndFnsh'
          })
        } else {
          that.endOperate(obj);
          utls.altDialog('提示', rs.data.message, '确定', null)
          return;
        }

      } else {
        that.endOperate(obj);
        if (rs.data.result == 'error') {
          utls.altDialog('提示', rs.data.message, '确定',null)
          return;
        } else {
          utls.altDialog('提示', '系统异常，请确认扫码正确，重新尝试!', '确定', null)
          return;
        }
      }
    },
    function (msg) {
      //失败
      that.endOperate(obj);
      utls.altDialog('提示', '扫码异常，请确认扫码正确，重新尝试!', '确定', null)
    })
  },
  /**扫二维码 */
  scanQrCode(obj){
    var that = this;
    
    my.scan({
      scanType: 'qrCode',
      success: (res) => {
        var qrCode = res.qrCode; //扫描二维码时返回二维码数据
        var code = res.code; //扫码所得数据
        that.handleEwmUrl(obj, qrCode);
      },
    });

  },
  //用户授权操作
  afterLogin() {
    var that = this;
    return new Promise((resolve, reject) => {
      //如果已经授权过的直接返回
      if (that.glbParam.isAuth == 1) resolve(that.glbParam.isAuth);
      my.getAuthCode({
        scopes: 'auth_base',
        success: (res) => {
          that.glbParam.authCode = res.authCode;
              //登录服务器开始
              utls.wxRequsetForPost("auth", "zfbLogin", {
                authCode: that.glbParam.authCode
              }, function (rs) { 
                var result = rs.data.result;
                //服务器登录成功 
                if (result == "success") {
                  //0.全局参数变为已授权
                  that.glbParam.isAuth = 1; 
                  var custInfoModel=rs.data.responseInfo.custInfoModel;
                  var sessionId=rs.data.responseInfo.session_3rd;

                  that.glbParam.custNo=custInfoModel.custNo;
                  that.glbParam.custInfoModel=custInfoModel;
                  that.glbParam.advertInfoMap=rs.data.responseInfo.advertInfoMap;
                  that.glbParam.ssnId = sessionId;
                  
                  my.setStorageSync({
                    key: 'sessionId',
                    data: sessionId
                  });
                  that.endOperate(null);
                  resolve(that.glbParam.isAuth);
                  //1.分析返回参数成功
                  //2. 保存客户
                } else {
                  //服务器登录失败,重新授权
                  that.endOperate(null); 
                  that.glbParam.isAuth = -1;
                  resolve(that.glbParam.isAuth);
                  //设置全局userId
                  if(rs.data.responseInfo != null && rs.data.responseInfo != ''){
                    that.glbParam.alipayUserId = rs.data.responseInfo;
                  } 
                }
              },function (msg) {
                that.endOperate(null);
                reject({});
              }) 
            },
          fail: (res) =>{
          }
        });
      });

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
      utls.showLoading(message);
    }
    return true;
  },
    /**删除防重复操作的屏层.*/
  endOperate: function (object) {
    this.showLoadingEndOperate(object, true);
  },
  /*删除防重复操作的屏层.*/
  showLoadingEndOperate: function (object, loadingFlag) {
    if(object != null && object != undefined){
      object.setData({
        doubleOperateFlag: true
      })
      object.data.dbOperationFlag = true;
    }
    if (loadingFlag) {
      utls.hideLoading()
    }
  },

  //点击首页按钮事件
  homeBtnOnBind(object){
    if (object != null) {
      object.goToIndexPage = this.goToIndexPage;
      }
    },
  //返回首页
  goToIndexPage(){
    try {my.reLaunch({ url: '/pages/index/index'}) } catch (e) {}
  },
//获取二维码码值请在小程序 app.js 文件的 app() 的 onlanch() 方法中使用 options.query 获取
  onLaunch(options){
    var that = this;
    //获取关联普通二维码的码值，放到全局变量qrCode中
    if (options.query && options.query.qrCode) {
      that.glbParam.qrCode = options.query.qrCode;
    }  
   
  },
  /**
   * 获取广告信息 
   * @param type 1首页顶部，2首页中部 3我要充电 4密码界面 5蓝牙界面
   */
  getAdvertInfo: function(type){
    var advertInfoMap = this.glbParam.advertInfoMap;
    if(advertInfoMap){
      return advertInfoMap[type];
    }
    return null;
  },
  /**
   * 点击广告
   * @param type 1首页顶部，2首页中部 3我要充电 4密码界面 5蓝牙界面
   * @param businessId 业务主键
   */
  clickAdvertInfo: function(type, businessId){
    var that = this;
    var advertInfo = that.getAdvertInfo(type);
    if(advertInfo){
      if(advertInfo.navigateTo == "url"){
        // 广告点击
        my.setStorageSync({
          key: 'webViewUrl',
          data: advertInfo.url
        });
        my.navigateTo({
          url: '/pages/webView/webView'
        });
      }else if(advertInfo.navigateTo == "miniProgram"){
        // 跳转小程序
        my.navigateToMiniProgram({
          appId: advertInfo.appId,//小程序appid
          path: advertInfo.path,//跳转关联小程序app.json配置里面的地址
          extraData: {//需要传递给目标小程序的数据，目标小程序可在 App.onLaunch()，App.onShow() 中获取到这份数据。
            businessId: businessId
          },
          //**重点**要打开的小程序版本，有效值 develop（开发版），trial（体验版），release（正式版） 
          envVersion: 'release',
          success(res) {
            // 打开成功
          }
        })
      }
    }
  }

})
