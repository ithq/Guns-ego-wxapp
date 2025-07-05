// pages/flwRcd/flwRcd.js
//流水记录页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden: false,
    onScrollLowerFlag: true,
    responseFlah: true,
    isEmpty: false,
    totalCountStar: 0,
    custNo: '',
    responseInfo: null,
    items: [],
    totalCount: 11,
    doubleOperateFlag: false,//处理重复提交
    nodatashowHide: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定返回地图小按键
    app.HomeBtnOnBind(this, "../../index/index");
    this.setData({
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
    app.endOperate(this);
    //查询全部我的流水
    this.flowRecord(0, 10);
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
  //流水列表
  flowRecord: function (start, count) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var keycode = cmmn.getKeyCode([that.data.custNo, start, count], app.glbParam.code)
    utls.wxRequset("wxapp", "getWithdrawRecordsByPage", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      custNo: that.data.custNo,
      start: start,
      rows: count
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', rs.data.message, '确定', null)
        return;
      }
      var responseInfo = rs.data.rechargeAndWithdrawRecordInfoBOs;
      //第一次进来
      if (start == 0) {
        if (responseInfo.length <= 0) {
          that.setData({
            nodatashowHide: true
          })
          return;
        }
        if (responseInfo.length < 10) {
          that.data.responseFlah = false;
        }
        that.setData({
          items: responseInfo
        })
        var tempItem = that.data.items;
        for (var i = 0; i < tempItem.length; i++) {
          tempItem[i].show = false;
        }
        that.data.items = tempItem;
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
          tempList = that.data.items.concat(rs.data.rechargeAndWithdrawRecordInfoBOs);
        } else {
          tempList = that.data.items;
          that.data.isEmpty = false;
        }
        that.data.items = tempList;
        that.setData({
          items: tempList,
          loadingHidden: false,
          totalCountStar: that.data.totalCount,
          totalCount: that.data.totalCount + 10,
          onScrollLowerFlag: true
        });
      }
    }, function (fail) {
      app.endOperate(that);
    }, function (complete) {
      app.endOperate(that);
    })
  },
  //查看流水详细
  handlePrgs: function (e) {
    var that = this;
    var tradeOutId = e.currentTarget.dataset.tradeoutid;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    console.log("........")
    wx.navigateTo({
      url: '../wthDrwPrgs/wthDrwPrgs?tradeOutId=' + tradeOutId
    })
  },
  //我的流水分页
  onScrollLower: function (event) {
    var that = this;
    if (that.data.totalCountStar != that.data.totalCount && that.data.onScrollLowerFlag == true) {
      that.data.onScrollLowerFlag = false;
      if (that.data.responseFlah == true) {
        that.setData({
          loadingHidden: true
        });
        //分页获取流水记录
        that.flowRecord(that.data.totalCount, 10);
      } else {
        return;
      }
    }
  }
})