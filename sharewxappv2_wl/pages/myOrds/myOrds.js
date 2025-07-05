// pages/myOrds/myOrds.js
//订单页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
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
    app.endOperate(that);
    //查询我的订单 
    that.orders(0, 5, that.data.orderStatus);
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

  },
  //我的订单
  orders: function (start, count, orderStatus) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var keycode = cmmn.getKeyCode([that.data.custNo], app.glbParam.code)
    utls.wxRequset("wxapp", "getMyOrderWithPages", {
      session3rd: app.glbParam.ssn_3rd,
      keycode: keycode,
      custNo: that.data.custNo,
      start: start,
      rows: count,
      status: orderStatus
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', rs.data.message, '确定', null)
        return;
      }

      var responseInfo = rs.data.myOrderRecordInfoBOs;
      //第一次进来
      if (start == 0) {
        if (responseInfo.length <= 0) {
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
        app.endOperate(that);
      } else {
        //分页进来
        app.endOperate(that);
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
      app.endOperate(that);
    }, function (complete) {
      app.endOperate(that);
      //
    })
  }
})