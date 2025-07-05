const utls = require('/utls/utls.js')
const cmmn = require('/utls/cmmn.js')
const app = getApp()
Page({
  data: {
    list_remind: '加载中',
    status: false, //是否显示列表
    itemopen: false,
    feednum: 0, //反馈的次数
    hasFeed: false,
    tel: '',
    questNote: '',
    info: '',
    showTopTips: false,
    TopTips: '',
    // 模型图片
    modal: {
      isShow: false,
      title: "图片",
      image: "",
      isFooter: true,
      cancel: "删除",
      ok: "确认"
    }
  },
  onLoad() {
    let that = this;
    //从缓存取服务端面返回的数据
    var response = my.getStorageSync({ key: 'responseInfo' });
    var responseInfo = response.data;
    var chargerId = "";
    var deviceNo = "";
    var tradeId = "";
    var replacePassWdHid = that.data.replacePassWdHid;
    if (responseInfo != null && responseInfo != undefined
      && responseInfo.map != null && responseInfo.map != undefined) {
      chargerId = responseInfo.map.chargerId;
      deviceNo = responseInfo.map.deviceNo;
      tradeId = responseInfo.map.tradeId;
    }
    that.setData({ 
      //初始化数据
      tradeId: tradeId,
      deviceNo: deviceNo,
      chargerId: chargerId,
      image1: "",
      hasImage1: false,
      image2: "",
      hasImage2: false,
      image3: "",
      hasImage3: false,
      textlen: "0/50"
    });
  },
  //上传图片
  uploadPic: function () {
    var that = this;
    if (that.data.hasImage1 && that.data.hasImage2 && that.data.hasImage3) {
      utls.altDialog('提示', "图片只能上载3张!", '确定', null);
    }
    my.chooseImage({
      count: 3, // 默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        for (var n in res.tempFilePaths) {
          var tempFilePath = tempFilePaths[n];

          that.uploadFile(tempFilePath);
        }
      }
    });
  },
  /**
   * 上传文件到服务器
   */
  uploadFile: function (tempFilePath) {
    let that = this;
    my.uploadFile({
      url: utls.getRqstBaseUrl() + 'fileUpload/upload', //上传的路径
      filePath: tempFilePath,
      fileType: 'image',
      fileName: 'file',
      success: function (res) {
        var jsonObj = JSON.parse(res.data);
        console.log('chooseImage success, temp path is: ', res.data);
        if (jsonObj && jsonObj.code == '200') {
          var imageSrc = jsonObj.data;
          that.addShowImage(imageSrc);
        } else {
          console.log('upladImage fail, errMsg is: ', jsonObj.data);
          utls.altDialog('提示', "上传图片失败，请稍后重试", '确定', null);
        }
      },
      fail: function (errMsg) {
        console.log('upladImage fail, errMsg is: ', errMsg);
        utls.altDialog('提示', "上传图片失败，请稍后重试", '确定', null);
      },
    })
  },
  /**
   * 添加展示图片
   */
  addShowImage: function (imageSrc) {
    let that = this;
    var data = {};
    for (var i = 0; i < 3; i++) {
      if (!that.data.hasImage1) {
        data.image1 = imageSrc;
        data.hasImage1 = true;
        break;
      } else if (!that.data.hasImage2) {
        data.image2 = imageSrc;
        data.hasImage2 = true;
        break;
      } else if (!that.data.hasImage3) {
        data.image3 = imageSrc;
        data.hasImage3 = true;
        break;
      } else {
        data = false;
      }
    }
    if (data) {
      that.setData(data);
    } else {
      utls.altDialog('提示', "图片只能上载3张！", '确定', null);
    }
  },
  /**
   * 删除图片
   */
  clearPic: function () {
    let that = this; 
    var index = this.data.imageIndex;
    var data = {};
    data["image" + index] = "";
    data["hasImage" + index] = false;
    this.setData(data);
  },
  /**
   * 显示图片
   */
  showImage: function (e) {
    let that = this; 
    var index = e.target.dataset.index;
    var image = this.data["image" + index];
    this.showDialogBtn(index, image);
  },

  /**
   * 弹窗
   */
  showDialogBtn: function (index, image) {
    let that = this; 
    this.setData({
      imageIndex: index,
      modal: {
        isShow: true,
        title: "图片",
        image: image,
        isFooter: true,
        cancel: "删除",
        ok: "关闭"
      }
    })
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    let that = this; 
    this.setData({
      modal: {
        isShow: false
      }
    });
  },

  /**
   * 对话框取消按钮点击事件：删除图片
   */
  onCancel: function () {
    this.hideModal();
    this.clearPic();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
  },

  /**
   * 提交表单
   */
  submitForm: function (e) {
    let that = this;
    var tel = e.detail.value.tel;
    var questNote = e.detail.value.questNote;
    //先进行表单非空验证
    if (tel == null) {
      utls.altDialog('提示', "请输入手机号", '确定', null);
      return;
    }
    if (!utls.validateValue("Mobile", tel)) {
      utls.altDialog('提示', "请输入正确的手机号", '确定', null);
      return;
    }
    if (questNote == "") {
      utls.altDialog('提示', "请输入您遇到的问题", '确定', null);
      return;
    }
    utls.confirmDialog("提示","是否确认提交反馈",function(res){
      //防重复点击开始============= 
      if (!app.firstOperate(that, "加载...")) {
        return;
      }
      //防重复点击结束=============
      var chargerId = that.data.chargerId;
      var deviceNo = that.data.deviceNo;
      var tradeId = that.data.tradeId;
      var images = that.data.image1 || "";
      if (that.data.image2 != null && that.data.image2 != ""){
        images += (images == "" ? "" : ",") + that.data.image2 || "";
      }
      if (that.data.image3 != null && that.data.image3 != "") {
        images += (images == "" ? "" : ",") + that.data.image3 || "";
      } 
      var keyCode = cmmn.getKeyCode([deviceNo, chargerId, tradeId, tel], app.glbParam.authCode);
      utls.wxRequsetForPost("zfb", "faultReport", {
        custNo: app.glbParam.custNo,
        chargerId: chargerId,
        deviceNo, deviceNo,
        tradeId: tradeId,
        tel: tel,
        questNote: questNote,
        images: images,
        currLatitude: app.glbParam.currLatitude,
        currLongitude: app.glbParam.currLongitude,
        session3rd: app.glbParam.ssnId,
        keyCode: keyCode
      }, function (rs) {
        if (rs.data.result == "success") {
          utls.altDialog('提示', '故障反馈成功，稍后为您处理。', '确定', function (res){
            // //跳转首页界面...
            my.redirectTo({
              url: '/pages/index/index'
            });
          });
        } else {
          app.endOperate(that);
          if (rs.data.result == 'error') {
            utls.altDialog('提示', rs.data.message, '确定', null);
          } else {
            utls.altDialog('提示', '系统异常，请重新尝试!', '确定', null);
          }
        }
      }, function (error) { }, function (complete) {
        //取消重复点击开始=============
        app.endOperate(that);
        //取消重复点击结束=============
      })
    });
  }

});
