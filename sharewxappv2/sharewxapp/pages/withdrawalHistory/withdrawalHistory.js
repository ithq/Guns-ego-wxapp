// pages/personCenter/withdrawalHistory/withdrawalHistory.js
const common = require('../../utils/common.js')
const util = require('../../utils/util.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    startRowIndex: 0,
    pageSize: 6,
    totalRowCount: 6,
    faxingtitleDisplay: "",//发现title显示标志
    noMoreDisplay: false,//是否显示还有更多.
    dbOperationFlag: true,
    onScrollLowerFlag: true,
    cashHistoryData: [],
    resourceUrl: app.globalData.resourceUrl,
    responseFlah: true,//描述是否可以刷新
    clickId:""
  },

  /**
   *绑定提现历史记录
   */
  withdrawalTetailShow: function(e) {
    var that = this;
    if (that.data.clickId == e.currentTarget.id){
      that.data.clickId = false;
    }else{
      that.data.clickId = e.currentTarget.id;
    }
    that.setData({
      clickId: that.data.clickId
    })
  },
  bindRewardWithdrawApplys: function () {
    util.showLoading("加载...")
    try {
      var that = this;
      var keycode = common.getKeyCode([that.data.startRowIndex, that.data.totalRowCount], app.globalData.code)
      util.shareRequest("wxapp", "getWithrawHistory", {
        session3rd: app.globalData.session_3rd,
        keyCode: keycode,
        start: that.data.startRowIndex,
        rows: that.data.totalRowCount
      }, function (rs) {
        util.hideLoading()
        if (rs.data.result == "success") {
          var infos = rs.data.responseInfos
          if (infos == null || infos.length == 0 && that.data.startRowIndex == 0){
            util.confirmDialog('提示', '您暂无提现记录哦!',
              function (confirm) {
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              },
              function (confirm) {
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              })
              return;
          }
          var faxingtitleDisplay = (infos != null && infos.length > 0) ? "none" : "";
          var items = (infos != null && infos.length > 0) ? infos : [];
          var noMoreDisplay = (items.length > 4) ? false : true;
          if (that.data.totalRowCount == 0) {
            that.data.startRowIndex = items.length;
            that.data.totalRowCount = items.length + that.data.pageSize;
            //如果是第一次不显示
            if (noMoreDisplay) {
              noMoreDisplay = (items.length > 0) ? true : false;
            }
            that.setData({
              cashHistoryData: items,
              noMoreDisplay: noMoreDisplay,
              faxingtitleDisplay: faxingtitleDisplay
            })
          } else {
            var dataItems = that.data.cashHistoryData;
            var tmp = [];
            var insertFlag = true;
            for (var i = 0; i < items.length; i++) {
              insertFlag = true;
              for (var j = 0; j < dataItems.length; j++) {
                if (items[i].tradeId == dataItems[j].tradeId) {
                  insertFlag = false;
                  break;
                }
              }
              if (insertFlag) {
                tmp.push(items[i]);
              }
            }
            if (tmp.length > 0) {
              var items = dataItems.concat(tmp);
              that.data.startRowIndex = items.length;
              that.data.totalRowCount = items.length + that.data.pageSize;
              //如果是第一次不显示
              if (noMoreDisplay) {
                noMoreDisplay = (items.length > 0) ? true : false;
              }
              that.setData({
                cashHistoryData: items,
                noMoreDisplay: noMoreDisplay,
                faxingtitleDisplay: faxingtitleDisplay
              })
            }
          }
        }
      }, function (e) {
        util.hideLoading()
        //失败
      }, function (e) {
        //完成
        that.data.onScrollLowerFlag = true
        app.finishOperation(that);
      }
      )
    } catch (ee) {
      that.data.onScrollLowerFlag = true
      util.hideLoading()
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //绑定首页按钮
    app.bindHomePageButton(this, "../../index/index");
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
    //加载数据..
    this.bindRewardWithdrawApplys();
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

  /**
   * 向下分页
   */
  onScrollLower: function (e) {
    if (e.detail.direction == "right") {
      return;
    }
    if (this.data.startRowIndex != this.data.totalRowCount && this.data.onScrollLowerFlag == true) {
      this.data.onScrollLowerFlag = false;
      this.bindRewardWithdrawApplys()
    }
  },
  /**
   * 向上分页
   */
  onScrollToUpper: function (e) {
    if (e.detail.direction == "left") {
      return;
    }
    if (this.data.onScrollLowerFlag == true) {
      this.data.startRowIndex = 0;
      this.data.totalRowCount = this.data.pageSize;
      this.data.onScrollLowerFlag = false;
      this.bindRewardWithdrawApplys();
    }
  },
  //局部刷新
  partFlash: function (tradeId, outTradeId, bankStatus, refundBank) {
    var that = this;
    var size = that.data.cashHistoryData.length;
    var sizeL;
    for (var i = 0; i < size; i++) {
      if (that.data.cashHistoryData[i].tradeId == tradeId) {
        sizeL = that.data.cashHistoryData[i].withdrawInfoBOs.length;
        for (var j = 0; j < sizeL; j++) {
          if (that.data.cashHistoryData[i].withdrawInfoBOs[j].outTradeId == outTradeId) {
            that.data.cashHistoryData[i].withdrawInfoBOs[j].bankStatus = bankStatus;
            that.data.cashHistoryData[i].withdrawInfoBOs[j].refundBank = refundBank;
            that.setData({
              cashHistoryData: that.data.cashHistoryData
            });
            break;
          }
        }
        break;
      }
    }
  },
  /**
 *查询交易状态... 
  */
  searchTradeStatus: function (e) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    var outTradeIdAndTradeId = e.currentTarget.id
    var outTradeId = outTradeIdAndTradeId.split("-")[0];
    var tradeId = outTradeIdAndTradeId.split("-")[1];
    var keyCode = common.getKeyCode([tradeId], app.globalData.code)
    var param = { tradeOutId: outTradeId };
    //调用服务端的方法...
    util.shareRequestPost("wxapp", "queryWithdrawResultByTradeOutId.htm", param,
      function (rs) {
        //3、保存成功后，跳转到首页
        if (rs.data.reconStatus == 10) {
          var msg = "提现成功， 款已提现到银行:" + rs.data.refundBank;
          util.alterDialog("提示", msg, "确定", function (e) {
            //跳转到例表
            wx.navigateBack({
              delta: 1
            })
          })
        } else if (rs.data.reconStatus == 11) {         
          util.alterDialog("提示", "提现失败!", "确定", function (e) {
            that.partFlash(tradeId, outTradeId, "失败", rs.data.refundBank);
          });
          
        } else {   
          util.alterDialog("提示", "银行处理中，请稍后在查询!", "确定", function (e) {
            that.partFlash(tradeId, outTradeId, "处理中", rs.data.refundBank);
          });
          
        }
      }, function (msg) {
        //失败
      }, function (msg) {
        //完成
        app.finishOperation(that);
      }
    )
  }
})