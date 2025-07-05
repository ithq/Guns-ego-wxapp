// pages/bluetooth/leaseSuccess/leaseSuccess.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/bluetooth/leaseSuccess.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
let ghtime = "",beginTime = "";
let coutTimer = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language), 
        topBg: app.globalData.imgUrl + "bluetooth/bluetoothTop.png",
        bottomBg: app.globalData.imgUrl + "bluetooth/bluetoothBottom.png",
        clock: app.globalData.imgUrl + "bluetooth/clock.png",
        advertisement: "",
        remainingTime: "",
        ghtime: "",
        beginTime: ""
    },
    // 返回上一页
    goBack: function(e) {
        util.goBack();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("接收数据："+JSON.stringify(options));
        if (options.ghtime) {
            ghtime = options.ghtime;
            beginTime = options.beginTime;
            this.setData({
                beginTime: beginTime,
                ghtime: ghtime
            })
        };
        this.getAdvertisement();
    },

    //获取广告
    getAdvertisement: function () {
        const self = this;
        request.post(api.selectAdvertising + "?id=4").then((res) => {
            self.setData({
                advertisement: res.data
            });
        }).catch(err => {
            console.log(err)
        });
    },

    //广告跳转
    goAdvertisement: function (e) {
        let isDefault = e.currentTarget.dataset.default;
        if (isDefault == 1) { // 1默认宣传
            //跳转政德宣传广告
            wx.navigateTo({
                url: "../../publicity/publicity"
            })
        } else {
            //跳转其他
        }
    },

    // 倒计时
    countdown: function (endTime) {
        let begintime = util.formatTime(new Date()); //获取当前时间
        let dateDiff = util.diffTime(begintime, ghtime);
        let remainingTime = util.diffTimeFormat(dateDiff);

        this.setData({
            remainingTime: remainingTime
        })
        clearTimeout(coutTimer);
        if (dateDiff < 1) return false;
        coutTimer = setTimeout(() => {
            this.countdown(endTime)
        }, 1000);
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
        this.countdown(ghtime);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        clearTimeout(coutTimer);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        clearTimeout(coutTimer);
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