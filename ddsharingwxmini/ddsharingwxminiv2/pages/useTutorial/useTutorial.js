// pages/useTutorial/useTutorial.js
const app = getApp();
const util = require("../../utils/util.js");
const common = require("../../language/common.js");//语言包
const language = require("../../language/useTutorial.js"); 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: util.getLanguage(language),
    commonLg: util.getLanguage(common),
    imgUrl: app.globalData.imgUrl,
    useTutorialImg: [],
    swiperCurrent: 0,
    indicatorDots: false,
    exercise: 'default',
    vertical: false,
    autoplay: false,
    // interval: 2000,
    duration: 500,
    circular: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.type );
    const {lg, imgUrl} = this.data;
    let useTutorialImg = [];
    if (options.type == 'powerBank') {
      useTutorialImg = [{
        img: imgUrl + 'useTutorial/powerBank/item3_1.png',
        title: lg.powerBankTitle1,
        description_1: lg.powerBankDes1,
        description_2: lg.powerBankDes12
      },{
        img: imgUrl + 'useTutorial/powerBank/item3_2.png',
        title: lg.powerBankTitle2,
        description_1: lg.powerBankDes2,
        description_2: lg.powerBankDes22
      },{
        img: imgUrl + 'useTutorial/powerBank/item3_3.png',
        title: lg.powerBankTitle3,
        description_1: lg.powerBankDes3,
        description_2: lg.powerBankDes32
      },{
        img: imgUrl + 'useTutorial/powerBank/item3_4.png',
        title: lg.powerBankTitle4,
        description_1: lg.powerBankDes4,
        description_2: lg.powerBankDes42
      }]
    } else if (options.type == 'passwordLine') {
      useTutorialImg = [{
        img: imgUrl + 'useTutorial/passwordLine/item3_1.png',
        title: lg.passwordLineTitle1,
        description_1: lg.passwordLineDes1,
        description_2: lg.passwordLineDes12
      },{
        img: imgUrl + 'useTutorial/passwordLine/item3_2.png',
        title: lg.passwordLineTitle2,
        description_1: lg.passwordLineDes2,
        description_2: lg.passwordLineDes22
      },{
        img: imgUrl + 'useTutorial/passwordLine/item3_3.png',
        title: lg.passwordLineTitle3,
        description_1: lg.passwordLineDes3,
        description_2: lg.passwordLineDes32
      },{
        img: imgUrl + 'useTutorial/passwordLine/item3_4.png',
        title: lg.passwordLineTitle4,
        description_1: lg.passwordLineDes4,
        description_2: lg.passwordLineDes42
      }]
    } else {
      useTutorialImg = [{
        img: imgUrl + 'useTutorial/bluetoothCable/item3_1.png',
        title: lg.bluetoothCableTitle1,
        description_1: lg.bluetoothCableDes1,
        description_2: lg.bluetoothCableDes12
      },{
        img: imgUrl + 'useTutorial/bluetoothCable/item3_2.png',
        title: lg.bluetoothCableTitle2,
        description_1: lg.bluetoothCableDes2,
        description_2: lg.bluetoothCableDes22
      },{
        img: imgUrl + 'useTutorial/bluetoothCable/item3_3.png',
        title: lg.bluetoothCableTitle3,
        description_1: lg.bluetoothCableDes3,
        description_2: lg.bluetoothCableDes32
      },{
        img: imgUrl + 'useTutorial/bluetoothCable/item3_4.png',
        title: lg.bluetoothCableTitle4,
        description_1: lg.bluetoothCableDes4,
        description_2: lg.bluetoothCableDes42
      }]
    }
    
    this.setData({
      useTutorialImg: useTutorialImg
    })
  },

  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 返回上一页
  goBack: function(e) {
    util.goBack();
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