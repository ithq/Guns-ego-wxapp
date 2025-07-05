//pages/myMsg/myMsg
//我的消息页面
const utls = require('../../utls/utls.js')
const app = getApp()
const cmmn = require('../../utls/cmmn.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    responseInfo: null,
    aryForItm: [],
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.HomeBtnOnBind(this, "../../index/index");
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
    that.messages(0, 10, that.data.messageStatus);
    //获取消息条数
    var keycode = cmmn.getKeyCode([], app.glbParam.code)
    utls.wxRequset("wxapp", "getMyMessageCoutInfo", {
      session3rd: app.glbParam.ssn_3rd,
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
    
  },
  //查询我的消息
  messages: function (start, count, messageStatus) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var keycode = cmmn.getKeyCode([start, count, messageStatus], app.glbParam.code)
    utls.wxRequset("wxapp", "getMyMessages", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      code: messageStatus,
      start: start,
      count: count
    }, function (rs) {
      // 成功
      if (rs.data.result === 'error') {
        app.endOperate(that);
        utls.altDialog('提示', rs.data.message, '确定', null)
        return;
      }
      //第一次进来
      var responseInfo = rs.data.responseInfo;
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
          aryForItm: responseInfo
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
          tempList = that.data.aryForItm.concat(rs.data.responseInfo);
        } else {
          tempList = that.data.aryForItm;
          that.data.isEmpty = false;
        }
        that.data.aryForItm = tempList;
        that.setData({
          aryForItm: tempList,
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
        that.messages(that.data.totalCount, 10, that.data.messageStatus);
      } else {
        return;
      }
    }
  },
  //消息隐藏
  readMessageHide: function (e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    app.endOperate(that);
    that.setData({
      messageShowView: false
    })
  },
  //我的信息tab标签
  mymsgByMsgStatus: function (event) {
    var that = this;
    var messageStatus = event.currentTarget.dataset.messagestatus;
    //清除原集合的数据
    that.setData({
      aryForItm: [],
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
    that.messages(0, 10, that.data.messageStatus);
  },
  //点击我的消息，标为已读
  rdMsg: function (e) {
    var that = this;
    var messageId = e.currentTarget.dataset.id; //消息id
    var status = e.currentTarget.dataset.status; //消息状态
    var content = e.currentTarget.dataset.content; //消息内容
    var title = e.currentTarget.dataset.title; //消息标题
    var time = e.currentTarget.dataset.time; //消息创建时间
    var index = e.currentTarget.dataset.index; //索引
    if (status == 2) {
      //只有未读消息才有请求到后台，修改数据
      var keycode = cmmn.getKeyCode([messageId], app.glbParam.code)
      utls.wxRequset("wxapp", "doReadMessage", {
        session3rd: app.glbParam.ssn_3rd,
        keycode: keycode,
        id: messageId
      }, function (success) {
        that.messages(0, 10, that.data.messageStatus);
        that.data.aryForItm[index].status = 1
        that.setData({
          aryForItm: that.data.aryForItm,
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
  }
})