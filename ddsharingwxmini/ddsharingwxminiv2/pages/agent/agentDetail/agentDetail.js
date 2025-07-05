// pages/agent/agentDetail/agentDetail.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/agentDetail.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,
    id;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        icon1: "agent/icon1.png",
        icon2: "agent/icon2.png",
        icon3: "agent/icon3.png",
        icon4: "agent/icon4.png",
        icon5: "agent/icon5.png",
        icon6: "agent/icon6.png",
        icon7: "agent/icon7.png",
        icon8: "agent/icon8.png",
        icon9: "agent/icon9.png",
        region: [],
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
        id = options.id;
        self.getData();
    },
    //获取数据
    getData() {
        request.post(api.agentDetails,{
            id:id
        }).then(res => {
            console.log(JSON.stringify(res));
            if(res.code == 1){
                self.setData({
                    info: res.data,
                    region: [res.data.province,res.data.city,res.data.district],
                    userName: res.data.userName,
                    userId: res.data.userId
                });
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //编辑代理
    editAgent(data) {
        var submitData = data.detail.value;
        submitData.id = id;
        console.log(JSON.stringify(submitData));
        request.post(api.updateAgent,submitData).then(res => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.editSuccess);
            };
            setTimeout(function(){
                wx.navigateBack();
            },1500);
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //三级联动
    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          region: e.detail.value
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