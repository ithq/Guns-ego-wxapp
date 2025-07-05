// /pages/myOrds/myOrds.js
//我的订单页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    nodatashowHide:false,
    responseFlah:true,
    isEmpty: false,
    items:[],
    totalCount: 6,
    totalCountStar: 0,
    onScrollLowerFlag: true, //分页标识
    heightToTop:app.glbParam.heightToTop //用于分页固定高度。。

  },
  onLoad(query){
    //绑定首页
    app.homeBtnOnBind(this);

  },
  onShow(){
    //结束加载中屏蔽层
    var that = this;
    app.endOperate(that);
     //我的订单列表 
    that.ordersList(0, 5);

  },

  //分页
  onScrollLower: function (event) {
    var that = this;
    if (that.data.totalCountStar != that.data.totalCount && that.data.onScrollLowerFlag == true) {
      that.data.onScrollLowerFlag = false;
      if (that.data.responseFlah == true) {
        that.setData({
          loadingHidden: true
        });
        //分页获取记录
        that.ordersList(that.data.totalCount, 10);
      } else {
        return;
      }
    }
  },

  /** 我的订单列表 */
  ordersList: function (start, count) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    utls.wxRequset("zfb", "getMyOrderWithPages", {
      custNo: app.glbParam.custNo,
      start: start,
      rows: count
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

  

});