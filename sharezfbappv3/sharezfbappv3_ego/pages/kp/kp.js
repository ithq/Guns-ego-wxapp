// /pages/kp/kp.js
//跳转页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    doubleOperateFlag:false,
    fromWhere:null, //从哪个页面跳转到此页面，index || 扫码
    needUserAuth:1, //是否还需要授权 0不需要，1需要重新授权
    canIUseAuthButton:my.canIUse('getOpenUserInfo') //是否版本有授权功能
  },
  onLoad(options){
    //获取进入此页面的来源
    this.setData({fromWhere:options.fromWhere,doubleOperateFlag:false});
  },

  onShow(){
    var that = this;
    // app.endOperate(that);
    //1如果已经授权过提示登陆中=============
    if(app.glbParam.isAuth == 1){
      that.setData({needUserAuth:0,doubleOperateFlag:false})
      that.redirectPage();
    }else{
      //未授权重新授权注册
      app.afterLogin().then(
        isAuth => {
          if(isAuth == 1){
            that.setData({needUserAuth:0})
            that.redirectPage()
          }else{
            // utls.altDialog("提示", "请您先授权登录再使用我们的产品！", "确定", null) 
            utls.alert("提示", "请您先授权登录再使用我们的产品！", "我知道了");
            that.setData({doubleOperateFlag:true})
          }
        }
      );
      app.endOperate(that);
    }

  },

  /** 如果用户已经注册过，不用跳转页面，否则跳到注册页面*/
  redirectPage(){
    var that = this;
    //如果发现用户已经授权，跳转到对应的页面
    if(app.glbParam.isAuth == 1){
      if(that.data.fromWhere && that.data.fromWhere == 'scan'){
        //处理二维码内容
        if(app.glbParam.qrCode){
          app.handleEwmUrl(app.glbParam.qrCode);
          app.glbParam.qrCode = null;
        }else{
          my.redirectTo({
            url: '/pages/index/index'
          });
        }
      }else if(that.data.fromWhere && that.data.fromWhere == 'myOrds'){
        my.redirectTo({
            url: '/pages/myOrds/myOrds'
          });
      }else{
        my.redirectTo({
          url: '/pages/index/index'
        });
      }
    }

  },

  /**注册客户信息 */
  registerCust(userInfo){
    var user = JSON.parse(userInfo)
    var that = this;
    var avatar = user.response.avatar;
    var nickName = user.response.nickName;
    var gender = user.response.gender;
    var countryCode = user.response.countryCode;
    var province = user.response.province;
    var city = user.response.city; 
    console.info(userInfo);
    utls.wxRequsetForPost("auth", "registerCust", 
      {
        avatar: avatar,
        nickName: nickName,
        gender: gender,
        countryCode: countryCode,
        province: province,
        city: city,
        userId:app.glbParam.alipayUserId,
        authCode: app.glbParam.authCode
      },
      function (response) {
        var resultData = response.data;
        console.log("resultData.result:"+resultData.result)
        //注册成功
        if (resultData.result == "success") { 
          //设置系统所需要的全局变量
          app.glbParam.isAuth = 1;
          var custInfoModel=resultData.responseInfo.custInfoModel;
          var sessionId=resultData.responseInfo.session_3rd;
          that.setData({needUserAuth:0})

          app.glbParam.custNo=custInfoModel.custNo;
          app.glbParam.custInfoModel=custInfoModel;
          app.glbParam.ssnId = sessionId;
          //跳转页面
          that.redirectPage();
        }else{
          app.endOperate(that);
          //注册失败，提示用户
         utls.altDialog("提示", resultData.message, "确定", null)
        }
      })

  },

  //如果用户还没注册，用户再通过点击登陆按钮，进行授权注册
  onGetAuthorize() {
    var that = this;
    //防重复点击开始=============
    if (!app.firstOperate(that, "授权中...")) {
      return;
    }
    my.getOpenUserInfo({
      success: (userinfo) => {
        //注册客户信息
        that.registerCust(userinfo.response);
      }
    });
    },
    //授权失败回调（包括用户拒绝和系统异常）
    onAuthError(){
      app.endOperate(this);
      //授权失败提示用户
      // utls.cnfmDialogForText("登陆提示","授权登陆失败，是否重新授权登陆？",null,"重新授权",null,"暂不需要",false);

      // 提示授权信息
      utls.cnfmDialogForText("登录提示","授权登录失败，请您先授权登录再使用我们的产品？",function(){
        // 重新授权，再次页面
      },"重新授权",function(){
        // 拒绝授权后跳转首页
        app.glbParam.isAuthRefuse = true;
        my.redirectTo({
            url: '/pages/index/index?isAuthRefuse=true'
        });
      },"暂不需要",false);
    }

  

});