// /pages/myMsg/myMsg.js
//我的消息页面
const utls = require('/utls/utls.js')
const app = getApp()
const cmmn = require('/utls/cmmn.js')
Page({
  data:{
    read:0, //已读消息条数
    unRead:0, //未读消息条数
    messageStatus: 2 ,//查询对应的状态的消息
    nodatashowHide:false, //消息列表为空,提示“未查询到消息”
    responseFlah:true, //消息结果集，需要不需要刷新
    aryForItm:null,  //消息列表
    isEmpty: false,
    totalCount: 10, 
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
    //查询已读未读消息条数
    that.messageCount();
    //分页查询消息列表
    that.messageList(0, 10, that.data.messageStatus);

  },

  /**上拉分页 */
  onScrollLower(e){
    var that = this;
    if (that.data.totalCountStar != that.data.totalCount && that.data.onScrollLowerFlag == true) {
      that.data.onScrollLowerFlag = false;
      if (that.data.responseFlah == true) {
        that.setData({
          loadingHidden: true
        });
        //分页获取记录
        that.messageList(that.data.totalCount, 10, that.data.messageStatus);
      } else {
        return;
      }
    }

  },

  /**分页查询消息列表 */
  messageList(start, count, messageStatus){
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    var custNo = app.glbParam.custNo;
    var keyCode = cmmn.getKeyCode([custNo, messageStatus, start, count], app.glbParam.authCode)
    utls.wxRequset("zfb", "getMyMessages", {
      custNo: custNo,
      code: messageStatus,
      start: start,
      count: count,
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
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
        //第一次进来数据不足十条不需要分页
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
        if (responseInfo == null) { //分页进来没有数据
          that.setData({
            responseFlah: false,
            loadingHidden: false
          });
          return;
        }
        var tempList = [];
        //分页进来如果有数据，拼接数据，如果没有只取上次请求的消息列表
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

  /** 查询已读未读消息条数*/
  messageCount(){
    var that = this;
    var custNo = app.glbParam.custNo;
    var keyCode = cmmn.getKeyCode([custNo, ''], app.glbParam.authCode)
    utls.wxRequset("zfb", "getMyMessageCountInfo", {
     custNo: custNo,
      id: '',
      session3rd: app.glbParam.ssnId,
      keyCode: keyCode
    }, function (success) {
      that.setData({
        read: success.data.read,
        unRead: success.data.unRead
      })
    });

  },
  //点击选择消息类型，2为未读消息，1为已读消息
  mymsgByMsgStatus(event){
    var that = this;
    var messagestatus1 = event.target.dataset.messagestatus;
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
      messageStatus: messagestatus1
    })
    //获取订单信息
    that.messageList(0, 10, messagestatus1);

  },
  //消息隐藏
  readMessageHide(e) {
    var that = this;
    if (!app.firstOperate(that, "加载...")) {
      return;
    }
    app.endOperate(that);
    that.setData({
      messageShowView: false
    })
  },
  //点击消息内容
  rdMsg(e){
    var that = this;
    var messageId = e.target.dataset.id; //消息id
    var status = e.target.dataset.status; //消息状态
    var content = e.target.dataset.content; //消息内容
    var title = e.target.dataset.title; //消息标题
    var time = e.target.dataset.time; //消息创建时间
    var index = e.target.dataset.index; //索引
    if (status == 2) {
      var custNo = app.glbParam.custNo;
      var keyCode = cmmn.getKeyCode([custNo, messageId], app.glbParam.authCode)
      //只有未读消息才有请求到后台，修改数据
      utls.wxRequset("zfb", "doReadMessage", {
       custNo: custNo,
        id: messageId,
        session3rd: app.glbParam.ssnId,
        keyCode: keyCode
      }, function (success) {
        that.messageList(0, 10, that.data.messageStatus);
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
  

});