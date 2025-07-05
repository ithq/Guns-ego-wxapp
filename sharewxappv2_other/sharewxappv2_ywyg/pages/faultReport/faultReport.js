// pages/faultReport/faultReport.js
//获取应用实例
const cmmn = require('../../utls/cmmn.js')
const utls = require('../../utls/utls.js')
const sMD5 = require('../../utls/spark-md5.min.js')
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
    resourceUrl: app.glbParam.serverUrl,
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
  onLoad: function () {
    let that = this;
    //从缓存取服务端面返回的数据
    var responseInfo = wx.getStorageSync('responseInfo');
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

    //获取设备和用户信息
    /*wx.getSystemInfo({
      success: function (res) {
        var info = '---\r\n**用户信息**\r\n';
        info += '用户名：' + app.glbParam.userInfo.nickName;
        info += '\r\n手机型号：' + res.model;
        info += '（' + res.platform + ' - ' + res.windowWidth + 'x' + res.windowHeight + '）';
        info += '\r\n微信版本号：' + res.version;
        info += '\r\nTogether版本号：' + app.version;
        that.setData({
          info: info
        });
        console.log(info);
      }
    });*/
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  onShow: function () {
    
  },
  //监听隐藏...
  onHide: function () {
    // Do something when hide.生命周期函数，监听隐藏 ...
  },
  openList: function (e) {
    let that = this;
    that.setData({
      'status': !that.data.status
    });
  },

  openItem: function (e) {
    let that = this;
    var index = e.currentTarget.dataset.index;
    if (index != that.data.itemopen) {
      that.setData({
        'itemopen': index
      });
    }
  },

  /**
   * 文本输入事件
   */
  textareaInput: function (value, cursor, keyCode) {
    let that = this; 
    var len = value.detail.value.length;
    var textlen = len + "/50";
    that.setData({
      textlen: textlen
    });
  },

  //上传图片
  uploadPic: function () {
    var that = this;
    if (that.data.hasImage1 && that.data.hasImage2 && that.data.hasImage3) {
      utls.altDialog('提示', "图片只能上载3张!", '确定', null);
    }
    wx.chooseImage({
      count: 3, // 默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        for (var n in res.tempFilePaths) {
          var tempFilePath = tempFilePaths[n];

          that.startUploadFile(tempFilePath);
        }
      }
    });
  },

  /**
   * 获取上传的文件MD5作为文件名
   */
  startUploadFile: function (tempFilePath) {
    let that = this;
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath, //选择图片返回的相对路径
      // encoding: 'binary', //编码格式
      success: res => {
        //成功的回调
        var spark = new sMD5.ArrayBuffer();
        spark.append(res.data);
        var hexHash = spark.end(false);
        console.log(hexHash)
        var filename = hexHash + tempFilePath.substr(tempFilePath.lastIndexOf("."), tempFilePath.length);

        //that.getSignature(tempFilePath, filename);
        that.uploadFile(tempFilePath, filename);

      }
    })
  },

  /**
   * 上传文件到服务器
   */
  uploadFile: function (tempFilePath, filename) {
    let that = this;
    wx.uploadFile({
      url: utls.getRqstBaseUrl() + 'fileUpload/upload', //上传的路径
      filePath: tempFilePath,
      name: 'file',
      formData: {
        //上传图片的名字和路径（默认路径根目录，自定义目录：xxx/xxx.png）
        filename: filename
      },
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
        console.log('upladImage fail, errMsg is: ', message);
        utls.altDialog('提示', "上传图片失败，请稍后重试", '确定', null);
      },
    })
  },

  /**
   * 上传文件到阿里云
   */
  uploadAliyun: function (tempFilePath, filename) {
    let that = this;
    wx.uploadFile({
      url: that.data.upload.host, //上传的路径
      filePath: tempFilePath,
      name: 'file',
      formData: {
        //上传图片的名字和路径（默认路径根目录，自定义目录：xxx/xxx.png）
        key: that.data.upload.dir + filename,
        policy: that.data.upload.policy,
        OSSAccessKeyId: that.data.upload.accessid,
        success_action_status: "200",
        signature: that.data.upload.signature,
        callback: that.data.upload.callback
      },
      success: function (res) {
        console.log('chooseImage success, temp path is: ', tempFilePath);
        var imageSrc = that.data.upload.host + "/" + that.data.upload.dir + filename;
        that.addShowImage(imageSrc);
      },
      fail: function (errMsg) {
        console.log('upladImage fail, errMsg is: ', errMsg)
        utls.altDialog('提示', "上传失败", '确定', null);
      },
    })
  },

  /**
   * 取上传签名数据
   */
  getSignature: function (tempFilePath, filename) {
    let that = this;
    var keycode = cmmn.getKeyCode([filename], app.glbParam.code);
    utls.wxRequset("fileUpload", "getParam", {
      session3rd: app.glbParam.ssn_3rd,
      keyCode: keycode,
      filename: filename
    }, function (rs) {
      that.setData({
        upload: rs.data
      });
      that.uploadAliyun(tempFilePath, filename);
    }, function (fail) {
      that.setData({
        upload: null
      });
    });
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
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { },

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
    wx.showModal({
      title: '提示',
      content: '是否确认提交反馈',
      success: function (res) {
        if (res.confirm) {
          //防重复点击开始=============
          if (!app.firstOperate(that, "加载...")) {
            return;
          }
          //防重复点击结束=============
          var formId = e.detail.formId; //用于发消息模板
          //保存formId
          app.saveFormId(formId);

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
          var params = [deviceNo, chargerId, tradeId, tel];
          var keycode = cmmn.getKeyCode(params, app.glbParam.code);
          utls.wxRequsetForPost("wxapp", "faultReport", {
            session3rd: app.glbParam.ssn_3rd,
            keyCode: keycode,
            chargerId: chargerId,
            deviceNo, deviceNo,
            tradeId: tradeId,
            tel: tel,
            questNote: questNote,
            images: images,
            currLatitude: app.glbParam.currLatitude,
            currLongitude: app.glbParam.currLongitude
          }, function (rs) {
            if (rs.data.result == "success") {
              utls.altDialog('提示', '故障反馈成功，稍后为您处理。', '确定', function (res){
                // //跳转首页界面...
                wx.redirectTo({
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
        }
      }
    })

  }
});