const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    resourceUrl: app.globalData.resourceUrl,
    onScrollLowerFlag: true,
    loadingHidden: false,
    responseFlah: true,
    isEmpty: false,
    totalCountStar: 0,
    custNo: '',
    responseInfo: null,
    items: [],
    totalCount: 11,
    nodatashowHide:false
  },
  handleProgress: function (e) {
    var that = this;
    var tradeOutId = e.currentTarget.dataset.tradeoutid;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    try {
      //保存formId
      app.saveFormId(e.detail.formId);
    } catch (e) { }
    wx.navigateTo({
      url: '../withdrawProgress/withdrawProgress?tradeOutId=' + tradeOutId
    })
  },
  //点击显示隐藏规则
  flowRecordHideShow: function (options) {
    var that = this;
    var id = options.currentTarget.dataset.id;
    //遍历重新组装我的流水，加一个标识用于是否展开具体流水明细
    var tempItem = that.data.items;
    for (var i = 0; i < tempItem.length; i++) {
      if (id == tempItem[i].tradeId) {
        var isShow = tempItem[i].show ? false : true;
        tempItem[i].show = isShow;
      } else {
        tempItem[i].show = false;
      }
    }
    that.setData({
      items: tempItem
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
        //分页获取成长记录
        that.flowRecord(that.data.totalCount, 10);
      } else {
        return;
      }
    }
  },
  //我的流水
  flowRecord: function (start, count) {
    var that = this;
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    var keycode = common.getKeyCode([that.data.custNo, start, count], app.globalData.code)
    util.shareRequest("wxapp", "getWithdrawRecordsByPage", {
      session3rd: app.globalData.session_3rd,
      keyCode: keycode,
      custNo: that.data.custNo,
      start: start,
      rows: count
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', rs.data.message, '确定', null)
        return;
      }

      var responseInfo = rs.data.rechargeAndWithdrawRecordInfoBOs;
      //第一次进来
      if (start == 0) {
        if (responseInfo.length <= 0){
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
      app.finishOperation(that);
    }, function (complete) {
      app.finishOperation(that);
      //
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
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
    //查询全部我的流水
    that.flowRecord(0, 10);
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