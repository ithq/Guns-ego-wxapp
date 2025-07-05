// pages/agent/orderDetail/orderDetail.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/orderDetail.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self;
Page({

    /**
     * 页面的初始数据
     */
    data: { 
        lg: util.getLanguage(language),
        commonLg: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        info:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        this.getData(options.orderid);
    },
    //获取详情orderDetails
    getData(id){
        console.log(id);
        request.post(api.orderDetails,{
            orderSn: id
        }).then((res) => {
            if(res.code == 1){
                if (res.data.orderDetail.borrowState == 2) {
                    var diffTime = util.diffTime(res.data.orderDetail.borrowTime);
                    res.data.orderDetail.usedMinute =  util.diffTimeFormat(diffTime);
                } else {
                    res.data.orderDetail.usedMinute = util.leaseUseTime(res.data.orderDetail.usedMinute);
                }
                self.setData({
                    info: res.data
                })
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //一键复制
    copyTxt: util.throttle(function(e) {
        var txt = e.currentTarget.dataset.txt;
        wx.setClipboardData({
            data: txt,
            success (res) {
                util.showToast(self.data.commonLg.copySuccessful)
                wx.getClipboardData({
                    success (res) {
                        console.log(res.data) // data
                    }
                })
            }
        })
    }, 1000),
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