// pages/agent/personalCenter/personalCenter.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/personalCenter.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var type,self;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        info: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        type = 3;  
        console.log("产品类型：" + type);
    },
    // 获取数据
    getData() {
        //appindex
        console.log("产品类型："+type);
        request.post(api.appindex+"?type="+type).then((res) => {
            if(res.code == 1){
                wx.setStorageSync('loginGroupId', res.data.groupId);
                self.setData({
                    info: res.data
                })
            }
            wx.stopPullDownRefresh();
        }).catch((err) => {
            self.setData({
                expired: true
            })
            wx.stopPullDownRefresh();
        });
    },
    // 返回上一页
    goBack: function(e) {
        util.goBack();
    },

    //页面跳转
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
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
        if(type == 1){
            self.getData();
        }else{
            self.getData();
        }
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
        this.getData();
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