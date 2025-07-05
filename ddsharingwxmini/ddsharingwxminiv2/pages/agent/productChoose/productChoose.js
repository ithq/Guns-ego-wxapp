// pages/agent/productChoose/productChoose.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/productChoose.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        imgUrl: app.globalData.imgUrlAgent,
        headerBg: "productOption/headBg3.png",
        logo: "productOption/logo3.png",
        back: "public/back.png"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // wx.setNavigationBarTitle({
        //     title: self.data.lg.pageTitle
        // });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    // 返回上一页
    goBack: function(e) {
        util.goBack();
    },
    //页面跳转
    jumpPage: function(e) {
        console.log(JSON.stringify(e));
        var url = e.currentTarget.dataset.url;
        var type = e.currentTarget.dataset.type;           
        wx.setStorageSync('productType', type);
        if(type == 1 || type == 2 || type == 3){
            wx.navigateTo({
                url: url
            })
        }else{
            //除了充电宝，其他的还没做
            wx.showModal({
                content: '开发中...',
                showCancel: false
            });
        }
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