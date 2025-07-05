var util = require('../../utils/util.js');
var check = require('../../utils/check.js');
var api = require('../../config/api.js');
const sparkMD5 = require('../../utils/spark-md5.min.js')

var app = getApp();

Page({
  data: {
    iotProductId: null,
    iotDeviceId: null,
    singleOrderId: null,
    content: '',
    contentLength: 0,
    mobile: '',
    files: [],
    // 模型图片
    modal: {
      isShow: false,
      title: "图片",
      index: 0,
      image: "",
      isFooter: true,
      cancel: "删除",
      ok: "确认"
    }
  },
  onLoad: function (options) {
    this.loadview();
  },
  loadview: function () {
    let that = this;
    var responseInfo = wx.getStorageSync('responseInfo');
    that.setData({
      iotProductId: responseInfo.device.iotProductId,
      iotDeviceId: responseInfo.device.iotDeviceId,
      singleOrderId: responseInfo.orderId
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  /**
   * 页面隐藏
   */
  onHide: function () {


  },
  /**
   * 页面关闭
   */
  onUnload: function () {

  },
  chooseImage: function (e) {
    if (this.data.files.length >= 5) {
      util.showErrorToast('只能上传五张图片')
      return false;
    }
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        for (var i in res.tempFilePaths) {
          that.readFile(res.tempFilePaths[i]);
        }
      }
    })
  },
  /**
   * 准备上传
   * @param {*} filePath 
   */
  readFile: function (filePath) {
    let that = this;
    wx.getFileSystemManager().readFile({
      filePath: filePath, //选择图片返回的相对路径
      // encoding: 'binary', //编码格式
      success: res => {
        //成功的回调
        var spark = new sparkMD5.ArrayBuffer();
        spark.append(res.data);
        var fileMd5 = spark.end(false);
        var suffix = filePath.substr(filePath.lastIndexOf("."));
        that.getSignature(filePath, fileMd5, suffix);
      }
    })
  },
  /**
   * 获取上传参数
   * @param {*} filePath 
   * @param {*} fileMd5 
   * @param {*} suffix 
   */
  getSignature: function (filePath, fileMd5, suffix) {
    let that = this;
    var params = {
      select: 101,
      md5: fileMd5,
      suffix: suffix
    }
    util.request(api.UploadSignature, params, 'GET').then(res => {
      that.uploadAliyun(filePath, res.data);
    }).catch(res => {
      util.alertDialog('提示', res.data || '文件上传失败，请稍后再试！')
    })
  },
  /**
   * 上传文件到阿里云
   * @param {*} filePath
   * @param {*} uploadParam
   */
  uploadAliyun: function (filePath, uploadParam) {
    let that = this;
    const uploadTask = wx.uploadFile({
      url: uploadParam.host, //上传的路径
      filePath: filePath,
      name: 'file',
      formData: {
        //上传图片的名字和路径（默认路径根目录，自定义目录：xxx/xxx.png）
        key: uploadParam.fileName,
        policy: uploadParam.policy,
        OSSAccessKeyId: uploadParam.accessid,
        success_action_status: "200",
        signature: uploadParam.signature
      },
      success: function (res) {
        console.log('upladImage success, temp path is: ', filePath);
        var imageSrc = uploadParam.host + "/" + uploadParam.fileName;
        that.addImage(imageSrc);
      },
      fail: function (errMsg) {
        console.log('upladImage fail, errMsg is: ', errMsg)
        utls.altDialog('提示', "上传失败", '确定', null);
      },
    })
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress)
      console.log('已经上传的数据长度', res.totalBytesSent)
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })
  },
  /**
   * 添加图片
   * @param {*} params 
   */
  addImage: function (imageSrc) {
    let that = this;
    if (that.data.files.length >= 5) {
      return false;
    }
    that.data.files.push(imageSrc);
    that.setData({
      files: that.data.files
    })
  },
  /**
   * 展示图片
   * @param {*} e 
   */
  previewImage: function (e) {
    /*wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })*/
    var index = e.target.dataset.index;
    var imageSrc = this.data.files[index];
    this.showModalDialog(index, imageSrc);
  },
  /**
   * 删除图片
   */
  deleteImage: function (index) {
    this.data.files.splice(index, 1);
    this.setData({
      files: this.data.files
    })
  },
  /**
   * 显示图片窗口
   */
  showModalDialog: function (index, imageSrc) {
    this.setData({
      modal: {
        isShow: true,
        title: "图片",
        index: index,
        image: imageSrc,
        isFooter: true,
        cancel: "删除",
        ok: "确认"
      }
    })
  },
  /**
   * 窗口确认
   * @param {*} params 
   */
  modalConfirm: function () {
    this.setData({
      modal: {
        isShow: false
      }
    })
  },
  /**
   * 窗口取消
   * @param {*} params 
   */
  modalCancel: function () {
    this.deleteImage(this.data.modal.index);
    this.setData({
      modal: {
        isShow: false,
      }
    })
  },
  mobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  contentInput: function (e) {
    this.setData({
      contentLength: e.detail.cursor,
      content: e.detail.value,
    });
  },
  clearMobile: function (e) {
    this.setData({
      mobile: ''
    });
  },
  submitFeedback: function (e) {
    let that = this;
    // 1.校验
    if (!app.isLogined()) {
      wx.redirectTo({
        url: '/pages/auth/auth',
      });
    }
    if (that.data.mobile == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }
    if (!check.isValidPhone(this.data.mobile)) {
      this.setData({
        mobile: ''
      });
      util.showErrorToast('请输入手机号码');
      return false;
    }
    if (that.data.content == '') {
      util.showErrorToast('请输入反馈内容');
      return false;
    }
    var picUrls = that.data.files.join(',');
    // 2.提交到后台
    util.showLoading('提交中...');
    var params = {
      orderId: that.data.singleOrderId,
      tel: that.data.mobile,
      questNote: that.data.content,
      questionImg: picUrls
    }
    util.request(api.FaultReport, params).then(res => {
      wx.showToast({
        title: '感谢您的反馈！',
        icon: 'success',
        duration: 2000,
        complete: function () {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      });
    }).catch(res => {
      util.showErrorToast((res.data || '提交失败，请稍后再试！'));
    }).complete(res => {
      util.hideLoading();
    });
  }
})