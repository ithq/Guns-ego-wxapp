// pages/agent/fenchengDetail/fenchengDetail.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/fencheng.js"); //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self,id;
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
        id = options.id;
        wx.setNavigationBarTitle({
            title: self.data.lg.detailTitle
        });
        this.getData();
    },
    //获取数据
    getData() {
        console.log(id);
        request.post(api.shareDetails+"?id="+id).then(res => {
            if(res.code == 1){
                self.setData({
                    info: res.data
                })
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //一键复制
    copyTxt: util.throttle(function (e) {
        console.log(JSON.stringify(e));
        var self = this;
        var txt = e.currentTarget.dataset.txt;
        wx.setClipboardData({
            data: txt,
            success(res) {
                console.log(res)
                util.showToast(self.data.common.copySuccessful)
                wx.getClipboardData({
                    success(res) {
                        console.log(res.data) // data
                    }
                })
            }
        })
    }, 100),
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