// /pages/flwRcd/flwRcd.js
//流水记录页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
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
    nodatashowHide: false,
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
    //查询全部我的流水
    that.flowRecord(0, 10);

  },
  //点查看
  flwrcdHideShow(e){
    var that = this;
    var index = e.currentTarget.dataset.id;
    var itemIndex = 0;
    var tempItem = [];
    for(let item of that.data.items){
      if(index == itemIndex){
        if(item.show){
          item.show = false;
        }else{
          item.show = true;
        }
        
      }
      itemIndex = itemIndex + 1;
      tempItem.push(item);
    }
    that.setData({items:tempItem,tempItem:tempItem})

  },
  /** 查询全部我的流水*/
  flowRecord(start, count) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    utls.wxRequset("zfb", "getWithdrawRecordsByPage", {
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
 //我的流水分页
  onScrollLower(event) {
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
  },
    //查看流水详细
  handlePrgs (e) {
    var that = this;
    var recordId = e.currentTarget.dataset.tradeoutid;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    my.navigateTo({
      url: '/pages/wthDrwPrgs/wthDrwPrgs?recordId=' + recordId
    })
  },
  //查看状态
  handleProgress(e){
    var that = this;
    var recordId = e.currentTarget.dataset.tradeoutid;
    utls.wxRequset("zfb", "getWithdrawalProcessInfo", {
      recordId: recordId
    }, function (success) {
      if (success.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', success.data.message, '确定', null)
        return;
      }
      var responseInfo = success.data.responseInfo.withdrawProgress;
      that.setData({
        responseInfo: responseInfo
      });
    }, function (error) { }, function (complete) {
      app.endOperate(that);
    })
  }

});