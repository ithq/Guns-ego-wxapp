// pages/agent/deviceDetail/deviceDetail.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/deviceDetail.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self;
var id,type;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        info:{},
        type: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        id = options.id;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });        
    },
    //获取数据
    getData() {
        request.post(api.agentDeviceDetails,{
            id: id
        }).then((res) => {
            if(res.code == 1){
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

    //解绑店铺emptyShop
    unBindShop(){
        wx.showModal({
            title: self.data.common.tips,
            content: self.data.lg.isUnbind,
            success (res) {
                if (res.confirm) {
                    request.post(api.emptyShop,{
                        id: id
                    }).then((res) => {
                        if(res.code == 1){
                            util.myShowToast(self.data.lg.unBindSuccess);
                            self.getData();//刷新页面
                        }
                    }).catch((err) => {
                        wx.showModal({
                            content: JSON.stringify(err)
                        });
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //绑定店铺
    bindShop() {
        wx.navigateTo({
          url: '../chooseStore/chooseStore?id='+id
        });
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
        this.getData();
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