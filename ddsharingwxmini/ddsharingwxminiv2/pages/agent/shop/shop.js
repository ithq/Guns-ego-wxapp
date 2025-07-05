// pages/agent/shop/shop.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/shop.js"); //语言包
const common = require("../../../language/common.js");
const event = require("../../../utils/event.js");

const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self;
var id, //设备id
    key = '',
    shopType = 0, //全部类型网点：0   直属网点：1  下属网点：2
    page = 1,
    type = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconAdd: "shop/icon_add3.png",
        iconSearch: "device/icon_search3.png", //放大镜
        statu: 0, //0全部，1直属，2下属,
        deviceType: 1,
        shopCount: {},
        info: [],
        triggered: true,
        loadMore: true,
        showData: false,
        groupID: "",
        key: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        type = wx.getStorageSync('productType');            
        console.log(type);
        self.setData({
            deviceType: type,
            groupID: wx.getStorageSync('loginGroupId')
        });
        this.getData();
        this.getShopCount();
        event.$on({
            name:"reflashShop",
            tg:this,
            success:(res)=>{
                console.log("事件监听");
                self.getShopCount();
                self.getData();
            }
        })
    },
    //导航栏切换
    changeNav(e) {
        shopType = e.target.dataset.i;
        this.setData({
            statu: shopType
        });
        page = 1;
        this.getData();
    },
    //获取店铺数量
    getShopCount() {
        request.post(api.shopCount,{
            type:type,
            key:key
        }).then((res) => {
            if (res.code == 1) {
                self.setData({
                    shopCount: res.data
                })
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取店铺列表shopList
    getData() {
        console.log("page:"+page);
        request.post(api.shopList, {
            key: key,
            page: page,
            pageSize: 10,
            shopType: shopType,
            type: type 
        }).then((res) => {
            if (res.code == 1) {
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
                        // page++;
                        self.setData({
                            info: res.data,
                            loadMore: true,
                            showData: false
                        });
                    };
                    self.setData({ //下拉刷新复位
                        triggered: false
                    });
                    this._freshing = false;
                } else {
                    if (res.data.length > 0) {
                        // page++;
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
    //扫码绑定设备 shopBindingDevice
    bindDevice(e) {
        var shopid = e.target.dataset.shopid;
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                console.log("扫码结果：" + JSON.stringify(res));
                if (res.errMsg == "scanCode:ok") {
                    var qrCodeUrl = res.result;
                    var qrCodeArr = qrCodeUrl.split("/");
                    var qrCode = qrCodeArr[qrCodeArr.length - 1];
                    wx.showModal({
                        title: self.data.common.tips,
                        content: self.data.lg.isBind,
                        success (res) {
                            if (res.confirm) {
                                wx.showLoading({
                                    title: 'loading...',
                                })
                                self.bind(qrCode,shopid);
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                } else {
                    console.log("扫码失败");
                }
            },
            fail: (err) => {
                // util.myShowToast(errMsg);
            }
        })
    },
    bind(qrcode,shopid){
        request.post(api.shopBindingDevice,{
            sceneStr: qrcode,
            shopId: shopid,
            type: type 
        }).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.bindSuccess);
            }else{
                wx.showModal({
                    content: JSON.stringify(res.msg)
                });
            };
            // wx.hideLoading();
        }).catch((err) => {
            wx.hideLoading();
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    // 点击键盘上的搜索
    bindconfirm: function (e) {
        var discountName = e.detail.value['search - input'] ? e.detail.value['search - input'] : e.detail.value
        key = discountName;
        self.setData({
            key: key
        });
        page = 1;
        this.getData();
        this.getShopCount();
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
            loadMore: true,
            key: ""
        });
        page = 1;
        key = '';
        this.getShopCount();
        this.getData();
    },
    //加载更多
    lodeMore() {
        page++;
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
    //页面跳转
    jumpPage: function (e) {
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
        key = "";
        shopType = 0;
        page = 1;
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