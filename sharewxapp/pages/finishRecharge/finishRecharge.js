const common = require('../../utils/common.js')
const util = require('../../utils/util.js')

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo:null,
    useAmount: 0,
    userTimeText: "0秒",
    resourceUrl: app.globalData.resourceUrl,
    balanceForYfj: 0,
    dbOperationFlag: true,
    dbOperationHid: false
  },
  //提现指引
  goToWithDraw: function (e) {
    var that=this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    try {
      // 保存formId
      app.saveFormId(e.detail.formId);
    } catch (e) {

    }
    wx.redirectTo({
      url: '../userCenter/userCenter'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定首页按钮
    app.bindHomePageButton(this, "../../index/index");
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo')
    var useAmount=0;
    var balanceForYfj=0;
    var haveUseTimesForSecond=0;
    if (responseInfo != null && responseInfo != undefined && responseInfo!=""){
      useAmount = responseInfo.amount;
      balanceForYfj = responseInfo.balance;
      haveUseTimesForSecond = responseInfo.haveUseTimesForSecond;
    }
    var hours = parseInt(haveUseTimesForSecond / 3600);
    haveUseTimesForSecond = Math.round(haveUseTimesForSecond % 3600);
    var minutes = parseInt(haveUseTimesForSecond / 60);
    haveUseTimesForSecond = Math.round(haveUseTimesForSecond % 60);
    var txtForTime ="";
    if(hours>0){
      txtForTime = txtForTime+hours+" 小时";
    }
    if (minutes > 0) {
      txtForTime = txtForTime + minutes + " 分";
    }
    txtForTime = txtForTime + haveUseTimesForSecond + " 秒";
    // 预付款金额大于0，才展示退预付款
    var dbOperationHid = (balanceForYfj <= 0);
    this.setData({
      responseInfo: responseInfo,
      useAmount: useAmount,
      userTimeText: txtForTime,
      balanceForYfj: balanceForYfj,
      dbOperationHid: dbOperationHid
    })
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
    app.finishOperation(this);  
    let that=this;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { 
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    //清除缓存
    wx.removeStorageSync('responseInfo')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})