// page/temp/temp
const util = require('../../utils/util.js')
const app = getApp()
Page({
  /**
   *
  hideLoading: hideLoading,
  showLoading: showLoading,
   * 页面的初始数据
   */
  data: {
    ossImgRoot: app.globalData.ossImgRoot,
    version: 0,
    delayedForComeFromWeiXin: 0,
    delayedForTimeSecond:85,//42.5秒
    isFromWX: 0, //判断是否从微信扫码进来，从而在onshow去跑定时器，跳转首页
    queryParam: "",//查询参数
    logText:"",//处理日志
    stopGoComeFromeWeiXin: false, 
    jumpFromUserCenterFlag:"",
    needUserAuth:0,
    loginTimes:0,
    canIUseOpenTypeGetUserInfo: false,
    SDKVersion: 0
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.isFromWX=0;
    var that=this;
    this.data.jumpFromUserCenterFlag=options.jumpFromUserCenterFlag;
    
    //绑定首页按钮
    //有可能从微信扫码进来================================
    this.data.queryParam = options.q+"";
    //直接跳转..
    if (this.data.queryParam == null || this.data.queryParam == undefined || this.data.queryParam == "") {
      return;
    }
    
    //delete session
    try {
      wx.setStorageSync('SKIP_QUERYPARAM', this.data.queryParam)
      this.data.isFromWX=1;
    } catch (e) {
      return;
    }
    //app.js中注册此方法，把stopGoComeFromeWeiXin 变量设为true,为跳出当前递归调用跳转到我要充电页面业务
    app.refuseGetUserInfoCallback=function(){
      that.data.stopGoComeFromeWeiXin=true;
    }
    //this.comeFromWeiXin(this.data.queryParam)
    //有可能从微信扫码进来================================
  },
  
 
  
  //从微信扫码进入的
  comeFromWeiXin: function (fromWeiXinContext) {
    var that = this;
    try{
      
        //停止执行，处理用户去受权了...
        if (this.data.stopGoComeFromeWeiXin){
          return;
        }
        that.data.logText="logining..."
        if (!app.isHaveLogin(false)) {
          this.data.delayedForComeFromWeiXin = this.data.delayedForComeFromWeiXin + 1;
          //最多等15s
          if (this.data.delayedForComeFromWeiXin > this.data.delayedForTimeSecond) {
            this.data.delayedForComeFromWeiXin = 0
            wx.reLaunch({
              url: '/pages/index/index',
            })
            return;
          }
          //延时1s在试o
          setTimeout(function () {
            that.comeFromWeiXin(fromWeiXinContext)
          }, 500)
          return;
        }
        
        that.setData({
          logText: "login done..."
        });
        //重新初始化..
        that.data.delayedForComeFromWeiXin = 0;
        var ewmUrl = unescape(fromWeiXinContext); //完整的二维码url
        //清空参数...
        try {
          wx.removeStorageSync("SKIP_QUERYPARAM")
        }catch(strErr){}
        //调用统一处理二维码内容接口
        that.data.logText = "handle Ewm Url..."
        app.handleEwmUrlAndConfirmFun(that,ewmUrl,function(){
          wx.reLaunch({
            url: '/pages/index/index',
          })
        });
    } catch (eee) { 
      that.setData({
        logText:eee
        });
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
    const that = this
    that.setData({ needUserAuth: 0 });
	
    try {
    	that.setData({ logText: "get sys info..." });  
    	wx.getSystemInfo({
            success: function (res) {
              var SDKVersion = res.SDKVersion;              
              that.setData({ version: res.version });
              that.setData({ SDKVersion: res.SDKVersion });              
              if (SDKVersion == '1.0.0'|| SDKVersion == '1.0.1') {
                util.alterDialog('提示', '您的微信版本【'+SDKVersion+'】过低，请升级微信后再使用小程序！', '确定', function () {
                	wx.reLaunch({
	            	      url: '/pages/index/index?useRefused=TRUE'
	            	  })         	    
                })
                return;
              }
              util.showLoading("加载中...")
              that.data.delayedForComeFromWeiXin = 0;
              that.data.stopGoComeFromeWeiXin=false;                                   
              that.checkSession();
            },
            fail: function (rs) {
              that.setData({ logText: "get sys info fail..." }); 
              util.showLoading("加载中...")
                that.data.delayedForComeFromWeiXin = 0;
                that.data.stopGoComeFromeWeiXin=false	              
                that.checkSession();
            }
          })
    } catch (e) {
    }
  },
  checkSession:function(){
	  const that = this;
	  try{      
		  that.setData({ canIUseOpenTypeGetUserInfo: wx.canIUse('button.open-type.getUserInfo') });
	  }catch(canIuseEX){
    }     
	  // Do something when show.生命周期函数， 监听显示
	  that.setData({ logText: "check session..." });   
	  that.data.loginTimes =0;
	  wx.checkSession({
	      success: function(){ 	    	  
	          //未登录，重新登录...
	          if (app.isHaveLogin(false)) {	
	        	  util.hideLoading();
	        	  app.globalData.credentialsForGetUserInfo = true;   
	        	  if(that.data.jumpFromUserCenterFlag == 'YES'){		        		   
          	      		wx.reLaunch({
                        url: '/pages/index/index'
          	      		})
          	      		return;
	          	    }else{
	          	    
	          	    var queryParamTmp = wx.getStorageSync('SKIP_QUERYPARAM');
	          	    var fromWeiXinContext = queryParamTmp;
	          	    //非onload过来..判断是否已进入过扫码充电...如果已进入过,那个fromWeiXinContext==null或空...
	          	    if (fromWeiXinContext != undefined 
	          	    		&& fromWeiXinContext != null 
	          	    		&& fromWeiXinContext != ''
	          	    		&& fromWeiXinContext != 'undefined') {
	          	    	that.comeFromWeiXin(fromWeiXinContext);
	          	    	that.data.isFromWX = 1;
	          	    	return;
	          	    }else{
	    	            wx.reLaunch({
	    	            	      url: '/pages/index/index'
	    	            	})
		          	    }
	          	    }
	          } else {	        	 
	        	app.globalData.credentialsForGetUserInfo = false;
	            that.onLogin();
	          }
		               
	      },
	      fail: function (rs) {		
	    	that.setData({ logText: "chk session fail..." });     
	        that.onLogin();
	      }
	    })
	   
  },
onLogin:function(){	 
	//处理系统登录的业务逻辑...
	const that = this;	 
	wx.login({
	    success: res => {
	      if (res.code) {
	    	that.setData({ logText: "login success" });     
			//发起网络请求			 
			app.globalData.code = res.code
			app.globalData.session_3rd = null 
			var canIUseFlag = false;
            try{
              canIUseFlag = wx.canIUse("getSetting");
            }catch(canIuseEX){
            }
	        if (canIUseFlag){ 	        	 
				wx.getSetting({
			    success: res => {
			    	  that.setData({ logText:res.errMsg });    
			    	  if (res.authSetting['scope.userInfo']) {	
				    	  wx.getUserInfo({
			    	            success: function(res) { 
			    	            	 that.setData({ logText: res.errMsg });    
			    	            	 app.onGetUserInfo(res);
			    	            	 app.globalData.credentialsForGetUserInfo = true;
				            	     that.jumpPage();
				            	     util.hideLoading();
			    	            },
			    	            fail: function (rs) {
			    	            	util.hideLoading();
			    	            	that.setData({ logText: "" }); 
			    	            	that.setData({ needUserAuth: 1 });			    	            	
			    	            }
				    	  })
			         // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框		       
				      }else{
				    	  	if(that.data.canIUseOpenTypeGetUserInfo){
					    		that.setData({ logText: "" });     
				        		that.setData({ needUserAuth: 1 });
				        		return;
				        	 }else{
				        		 wx.authorize({
			                         scope: 'scope.userInfo',
			                         success(rs) {
			                        	 that.setData({ logText: rs.errMsg }); 
			                        	  
			                        	 //得到用户信息 登录
			                        	 app.globalData.loginTimes = 0;
			                        	 app.globalData.credentialsForGetUserInfo = true;
			                        	 that.getUserInfo();		                        	
					            	     util.hideLoading();
			                         }, fail(rs){
			                        	 that.setData({ logText: rs.errMsg }); 
			                        	 that.getUserInfo();
			                        	
			                         }, complete(rs){
			                         }
			                       })
				        	}				    	     
				    	    util.hideLoading(); 
				            return;		            		 
			          } 
			    },
			    fail(rs){
               	 that.setData({ logText: rs.errMsg }); 
            	 that.getUserInfo();
 			    }
			    })
		        
		      }else{
		    	  that.setData({ logText: "cannot get setting..." });  
		    	  that.getUserInfo();
		      }
	      }else{
	    	  that.setData({ logText: res.errMsg + "logintimes:" + that.data.loginTimes });
	          that.data.loginTimes = that.data.loginTimes+1;
	          if (that.data.loginTimes<5){
	            that.onLogin();
	          }
	      }
	    },
	    fail(rs) {
	    	that.setData({ logText: rs.errMsg + "logintimes:" + that.data.loginTimes }); 
	        that.data.loginTimes = that.data.loginTimes + 1; 
	        if (that.data.loginTimes < 5) {
	          that.onLogin();
	        }    
		}
	  })
	      
	
	  util.hideLoading();    
	},

 /**得到用信息  */
  getUserInfo: function (e) {
	  const that = this;
	  
	  wx.getUserInfo({
	      lang:'zh_CN',
	      // 可以将 res 发送给后台解码出 unionId
	      success: res => {	    	  
         	  //得到用户信息 登录
         	  app.globalData.loginTimes = 0;
	    	  app.onGetUserInfo(res);
	    	  app.globalData.credentialsForGetUserInfo = true;
	    	  that.jumpPage();
	      },fail: function (res) {
	    	  that.setData({ logText: res.errMsg }); 
	    	  if(that.data.canIUseOpenTypeGetUserInfo){
	    		that.setData({ logText: "" });     
        		that.setData({ needUserAuth: 1 });
        		return;
        	 }
    	     var msg = res.errMsg;
    	     if (msg.indexOf("auth deny")>-1) {    	         
    	        app.refuseGetUserInfo();
    	     } 
	      } 
	    })
  },
  
  /**得到用信息  */
  bindGetUserinfoTab: function (e) { 
    const that = this;	
    if('getUserInfo:ok' != e.detail.errMsg){
      that.setData({ logText: e.detail.errMsg }); 
      util.confirmDialogForText("提示", "拒绝获取微信昵称信息后，系统部分功能不可用，是否重新允许！", null ,
      "是", function (rs) {	
        wx.reLaunch({
              url: '/pages/index/index?useRefused=TRUE'
        })
        }, "否", false);
      
      return;
    }   
    app.onGetUserInfo(e.detail);
    that.jumpPage(); 
  },
	  
  jumpPage: function () {
	  const that = this; 
	  var queryParamTmp = wx.getStorageSync('SKIP_QUERYPARAM');
    var fromWeiXinContext = queryParamTmp;
     
    //非onload过来..判断是否已进入过扫码充电...如果已进入过,那个fromWeiXinContext==null或空...
    if (fromWeiXinContext != undefined && fromWeiXinContext != null 
		    && fromWeiXinContext != 'undefined' && fromWeiXinContext != '') {    	            	    	
      that.comeFromWeiXin(fromWeiXinContext);
      that.data.isFromWX = 1;
       return;
    }	      
    util.hideLoading();
    if(that.data.jumpFromUserCenterFlag == 'YES'){
     		wx.reLaunch({
          url: '/personCenter/pages/userCenter/userCenter'
     		})
    }else{
       	wx.reLaunch({
       	      url: '/pages/index/index'
      	})
    }
  },
	  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.isFromWX=0;
    this.data.stopGoComeFromeWeiXin=true;
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})