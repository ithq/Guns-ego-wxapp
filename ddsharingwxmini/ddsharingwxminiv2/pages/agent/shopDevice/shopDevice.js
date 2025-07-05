// pages/agent/shopDevice/shopDevice.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/device.js"); //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self,key,shopid;
const pageSize = 10;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        deviceStatu: 0, //设备状态，默认0在线，1已绑，2离线，3未绑
        type: 1,
        listData: {},
        deviceCount:{},
        page: 1, //当前页数
        loadMore: true,
        noData: false,
        triggered: true,
        loadingData: true,
        iconScan: "device/icon_scan3.png", //扫码
        iconCharge: "device/icon_charge3.png", //充电
        iconSearch: "device/icon_search3.png" //放大镜
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        self.setData({
            type: wx.getStorageSync('productType')
        })
        wx.setNavigationBarTitle({
            title: options.shopName
        });
        shopid = options.shopid;
        
    },
    //获取数据 shopDeviceList
    getData(pageNo, override){
        this.setData({
            page: pageNo
        });

        request.post(api.shopDeviceList,{
            shopId: shopid,
            key: key,
            page: pageNo,
            pageSize: pageSize
        }).then((res) => {
            if (res.data.length > 0) {
                self.setData({
                  noData:  false,
                  listData: override ? res.data : self.data.listData.concat(res.data),
                  loadMore: parseInt(res.data.length % pageSize) == 0 ? true : false,
                })
            } else {
                self.setData({
                    listData: override ? [] : self.data.listData,
                    noData: override ? true : false,
                    loadMore: override ? true : false,
                })
            }
        }).then(() => {
            self.setData({
                loadingData: false,
                triggered: false
            })
            this._freshing = false
        }).catch((err) => {
            self.setData({
                loadMore: true,
                noData: override ? true : false,
                loadingData: true,
                triggered: false
            })
        })
    },

    // 点击键盘上的搜索
    bindconfirm:function(e){
        var discountName=e.detail.value['search - input'] ?e.detail.value['search - input'] : e.detail.value 
        console.log('e.detail.value', discountName)
        key = discountName;
        this.getData(1, true);
    },

    //扫码获取设备二维码
    // 打开扫码
    scan: util.throttle(function(e) {
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
              console.log("扫码结果：" + JSON.stringify(res));
              if (res.errMsg == "scanCode:ok") {
                var qrCodeUrl = res.result;
                var qrCodeArr = qrCodeUrl.split("/");
                var qrCode = qrCodeArr[qrCodeArr.length - 1];
                self.setData({
                    qrcode: qrCode
                });
                key = qrCode;
                //扫码成功自动搜索
                self.getData(1, true);
              } else {
                console.log("扫码失败");
              }
            },
            fail: (err) => {
              // showToast(errMsg);
              console.log("取消扫码");
            }
        })
    }, 1000),

    //重启设备
    //agentRebootDevice
    restart(e){
        var deviceId = e.target.dataset.deviceid;
        request.post(api.agentRebootDevice+"?deviceId="+deviceId).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.restartSuccess);
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    
    //页面跳转
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    //下拉刷新
    onRefresh() {
        if (this._freshing) return;
        this._freshing = true;
        key = '';
        self.setData({
            qrcode: ""
        });
        this.getData(1, true);
    },

    // 上拉加载
    scrollToLower: function(e) {
        console.log(e)
        let loadingData = this.data.loadingData
        if (loadingData  || !this.data.loadMore ) return
        this.setData({
          loadingData: true
        });
    
        // 加载下一页数据
        if (this.data.loadMore) {
          this.getData(this.data.page + 1)
        }
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
        this.getData(1, true);
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