const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceUrl: app.globalData.resourceUrl,
    responseInfo: null,
    responseFlah: true,//判断是否有分页，true:有分页，false:没有分页
    loadingHidden: false,//判断是否显示分页的loading图标，true:显示，false:不显示
    onScrollLowerFlag: true,
    isEmpty: false,
    nodatashowHide: false,
    items: [],
    custNo: '',
    orderStatus: '',
    totalCount: 6,
    totalCountStar: 0
  },
  //我的订单tab标签
  myorderByOrderstatus: function (event) {
    var that = this;
    var orderStatus = event.currentTarget.dataset.orderstatus;
    //清除原集合的数据
    that.setData({
      isEmpty: false,
      responseFlah: true,//判断是否有分页，true:有分页，false:没有分页
      onScrollLowerFlag: true,
      loadingHidden: false,//判断是否显示分页的loading图标，true:显示，false:不显示
      nodatashowHide: false,
      items: [],
      totalCount: 6,
      totalCountStar: 0,
      orderStatus: orderStatus
    })
    //获取订单信息
    that.myOrders(0, 5, that.data.orderStatus);
  },
  //我的订单分页
  onScrollLower: function (event) {
    var that = this;
    if (that.data.totalCountStar != that.data.totalCount && that.data.onScrollLowerFlag == true) {
      that.data.onScrollLowerFlag = false;
      if (that.data.responseFlah == true) {
        that.setData({
          loadingHidden: true
        });
        //分页获取成长记录
        that.myOrders(that.data.totalCount, 5, that.data.orderStatus);
      } else {
        return;
      }
    }
  },
  //我的订单
  myOrders: function (start, count, orderStatus) {
    var that = this;
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    var keycode = common.getKeyCode([that.data.custNo], app.globalData.code)
    util.shareRequest("wxapp", "getMyOrderWithPages", {
      session3rd: app.globalData.session_3rd,
      keycode: keycode,
      custNo: that.data.custNo,
      start: start,
      rows: count,
      status: orderStatus
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', rs.data.message, '确定', null)
        return;
      }
      
      var responseInfo = rs.data.myOrderRecordInfoBOs;
      //第一次进来
      if (start == 0) {
        if (responseInfo.length <= 0){
          that.setData({
            nodatashowHide: true
          })
          return;          
        }
        if (responseInfo.length < 5) {
          that.data.responseFlah = false;
        }
        that.setData({
          items: responseInfo
        })
        app.finishOperation(that);
      } else {
        //分页进来
        app.finishOperation(that);
        if (responseInfo == null) {
          that.setData({
            responseFlah: false,
            loadingHidden: false
          });
          return;
        }
        var tempList = [];
        if (!that.data.isEmpty) {
          tempList = that.data.items.concat(rs.data.myOrderRecordInfoBOs);
        } else {
          tempList = that.data.items;
          that.data.isEmpty = false;
        }
        that.data.items = tempList;
        that.setData({
          items: tempList,
          loadingHidden: false,
          totalCountStar: that.data.totalCount,
          totalCount: that.data.totalCount + 5,
          onScrollLowerFlag: true
        });
      }
    }, function (fail) {
      app.finishOperation(that);
    }, function (complete) {
      app.finishOperation(that);
      //
    })
  },
  //结束使用充电
  overCharging: function (e) {
    var that = this;
    var chargerId = e.currentTarget.dataset.chargerid;
    var custNo = e.currentTarget.dataset.custno;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    var formId = e.detail.formId; //用于发消息模板
    //保存formId
    app.saveFormId(formId);

    var params = [chargerId, custNo];
    var keycode = common.getKeyCode(params, app.globalData.code);

    util.shareRequestPost("wxapp", "overUseCharging.htm", {
      session3rd: app.globalData.session_3rd,
      keycode: keycode,
      chargerId: chargerId,
      custNo, custNo
    }, function (success) {
      if (success.data.result === 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', success.data.message, '确定', null)
        return;
      }
      //返回数据放缓存
      wx.setStorageSync('responseInfo', success.data.responseInfo)
      wx.redirectTo({
        url: '/pages/offlineGeneral/costDetails/costDetails'
      })
    }, function (error) { }, function (complete) {
      //取消重复点击开始=============
      app.finishOperation(that);
      //取消重复点击结束=============
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //绑定返回首页
    app.bindHomePageButton(that, "../../index/index");
    that.setData({
      custNo: options.custNo
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
    var that = this;
    app.finishOperation(that);
    //查询我的订单 
    that.myOrders(0, 5, that.data.orderStatus);
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