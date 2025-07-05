// pages/agent/chooseStore/chooseStore.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/chooseStore.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self;
var id, //设备id
    key = '',
    type = 1,
    page = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconSearch: "device/icon_search3.png",        //放大镜
        info: [],
        triggered: true,
        loadMore: true,
        showData: false
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
        type = wx.getStorageSync('productType');   
        this.getData();
    },
    //获取店铺列表shopList
    getData() {
        request.post(api.shopList,{
            key: key,
            page: page,
            pageSize: 10,
            shopType: 0,//0：直属网点：1。下属网点：2
            type: type   
        }).then((res) => {
            if(res.code == 1){
                if (page == 1) {
                    if (res.data.length <= 0) {
                        //没有数据
                        self.setData({
                            info: []
                        });
                        self.setData({
                            showData: true
                        });
                    } else {
                        page++;
                        self.setData({
                            info: res.data,
                            loadMore: true,
                            showData: false
                        });
                    };
                    self.setData({      //下拉刷新复位
                        triggered: false
                    });
                    this._freshing = false;
                } else {
                    if (res.data.length > 0) {
                        page++;
                        self.setData({
                            info: self.data.info.concat(res.data)
                        });
                    } else {
                        //加载完毕,没有更多了
                        self.setData({
                            loadMore: false
                        })
                    }
                };
            };
            wx.stopPullDownRefresh();
        }).catch((err) => {
            wx.stopPullDownRefresh();
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //绑定店铺bindingShop
    bindStore(e){
        var shopid = e.currentTarget.dataset.shopid;
        console.log(id,shopid);
        wx.showModal({
            title: self.data.common.tips,
            content: self.data.lg.isUnbind,
            success (res) {
                if (res.confirm) {
                    request.post(api.bindingShop,{
                        deviceId: id,
                        shopId: shopid
                    }).then((res) => {
                        if(res.code == 1){
                            util.myShowToast(self.data.lg.bindSuccess);
                            setTimeout(function(){
                                wx.navigateBack({});
                            },1500)
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
    // 点击键盘上的搜索
    bindconfirm:function(e){
        var discountName=e.detail.value['search - input'] ?e.detail.value['search - input'] : e.detail.value 
        key = discountName;
        page = 1;
        this.getData();
    },
    onPulling(e) {
        //控件被下拉
        //console.log('onPulling:', e)
    },
    //下拉刷新
    onRefresh() {
        if (this._freshing) return;
        this._freshing = true;
        self.setData({
            loadMore: true
        });
        page = 1;
        key = '';
        this.getData();
    },
    //加载更多
    lodeMore() {
        this.getData();
    },
    onRestore(e) {
        //刷新复位
        // console.log('onRestore:', e)
    },
    
    onAbort(e) {
        //刷新中止
        // console.log('onAbort', e)
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
        page = 1;
        key = "";
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