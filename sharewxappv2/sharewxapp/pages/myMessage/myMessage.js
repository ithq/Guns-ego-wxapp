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
    items: [],
    totalCount: 11,
    isEmpty: false,
    responseFlah: true,
    totalCountStar: 0,
    onScrollLowerFlag: true,
    loadingHidden: false,
    nodatashowHide: false,
    messageStatus: 2,
    messageShowView: false,
    read: 0,
    unRead: 0
  },
  //我的信息tab标签
  mymessageByMessagestatus: function (event) {
    var that = this;
    var messageStatus = event.currentTarget.dataset.messagestatus;
    //清除原集合的数据
    that.setData({
      items: [],
      totalCount: 11,
      isEmpty: false,
      responseFlah: true,
      totalCountStar: 0,
      onScrollLowerFlag: true,
      loadingHidden: false,
      nodatashowHide: false,
      messageStatus: messageStatus
    })
    //获取订单信息
    that.myMessages(0, 10, that.data.messageStatus);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    app.bindHomePageButton(this, "../../index/index");
    // knowMoreShowView: (options.knowMoreShowView == "true" ? true : false)
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
        //分页获取成长记录
        that.myMessages(that.data.totalCount, 10, that.data.messageStatus);
      } else {
        return;
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  //查询我的消息
  myMessages: function (start, count, messageStatus) {
    var that = this;
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    var keycode = common.getKeyCode([start,count,messageStatus], app.globalData.code)
    util.shareRequest("wxapp", "getMyMessages", {
      session3rd: app.globalData.session_3rd,
      keyCode: keycode,
      code: messageStatus,
      start: start,
      count: count
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.finishOperation(that);
        util.alterDialog('提示', rs.data.message, '确定', null)
        return;
      }
      //第一次进来
      var responseInfo = rs.data.responseInfo;
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
          tempList = that.data.items.concat(rs.data.responseInfo);
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
  //消息隐藏
  readMessageHide: function (e) {
    var that = this;
    //防重复点击开始=============
    if (!app.startOperation(that, "加载...")) {
      return;
    }
    //防重复点击结束=============
    app.finishOperation(that);
    that.setData({
      messageShowView: false
    })   
  },
  //点击我的消息，标为已读
  readMessage: function (e) {
    var that = this;
    var messageId = e.currentTarget.dataset.id; //消息id
    var status = e.currentTarget.dataset.status; //消息状态
    var content = e.currentTarget.dataset.content; //消息内容
    var title = e.currentTarget.dataset.title; //消息标题
    var time = e.currentTarget.dataset.time; //消息创建时间
    var index = e.currentTarget.dataset.index; //索引
    if (status == 2) {
      //只有未读消息才有请求到后台，修改数据
      var keycode = common.getKeyCode([messageId], app.globalData.code)
      util.shareRequest("wxapp", "doReadMessage", {
          session3rd: app.globalData.session_3rd,
          keycode: keycode,
          id: messageId
        }, function (success) {
          that.myMessages(0, 10, that.data.messageStatus);
          that.data.items[index].status = 1  
          that.setData({
            items: that.data.items,
            messageShowView: true,
            content: content,
            title: title,
            time: time,
            read: success.data.read,
            unRead: success.data.unRead
          })
        }, function (fail) {
        }, function (complete) { 
      })
    } else {
      that.setData({
        messageShowView: true,
        content: content,
        title: title,
        time: time
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    app.finishOperation(that);
    that.myMessages(0, 10, that.data.messageStatus);
    //获取消息条数
    var keycode = common.getKeyCode([], app.globalData.code)
    util.shareRequest("wxapp", "getMyMessageCoutInfo", {
        session3rd: app.globalData.session_3rd,
        keycode: keycode,
        id: ''
      }, function (success) {
        that.setData({
          read: success.data.read,
          unRead: success.data.unRead
        })
      }, function (fail) {
      }, function (complete) { 
    });
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