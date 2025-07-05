// pages/continueAndFinished/continueAndFinished.js
const app = getApp()
const util = require("../../utils/util");
const api = require('../../config/api.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        iotProductId: null,
        iotDeviceId: null,
        singleId: null,
        singleOrderId: null,
        useSecound: 0,
        useTimeStr: '',
        useFee: '',
        timeHandle: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let productId = options.productId;
        let deviceId = options.deviceId;
        this.loadview(productId, deviceId);
    },

    /**
     * 加载显示
     */
    loadview: function (productId, deviceId) {
        let that = this;
        // 加载订单
        var params = {
            productId: productId,
            deviceId: deviceId
        }
        util.showLoading('加载中...');
        util.request(api.WxpayPackage, params, 'GET').then(res => {
            // 充电时长计时
            let timeHandle = setInterval(() => {
                that.timeIntervalHandle();
            }, 1000);
            // 初始化页面
            that.setData({
                iotProductId: res.data.device.iotProductId,
                iotDeviceId: res.data.device.iotDeviceId,
                singleId: res.data.singleId,
                singleOrderId: res.data.orderMap.id,
                useSecound: res.data.orderMap.useSecound,
                useTimeStr: that.useSecoundToTimeStr(res.data.orderMap.useSecound),
                useFee: '￥' + res.data.orderMap.useFee,
                timeHandle: timeHandle
            })
        }).catch(res => {
            util.alertDialog('提示信息', '订单异常，请重新扫码！', '确定', function () {
                wx.redirectTo({
                    url: '/pages/index/index'
                })
            })
        }).complete(res => {
            util.hideLoading();
        })
    },
    /**
     * 秒转时间
     */
    useSecoundToTimeStr: function (useSecound) {
        var seconds = useSecound;
        var hours = parseInt(seconds / 3600);
        seconds = Math.round(seconds % 3600);
        var minutes = parseInt(seconds / 60);
        seconds = Math.round(seconds % 60);
        return (hours + '小时' + minutes + '分' + seconds + '秒');
    },
    /**
     * 充电时长计时
     */
    timeIntervalHandle: function () {
        let that = this;
        let useSecound = that.data.useSecound + 1;
        that.setData({
            useSecound: useSecound,
            useTimeStr: that.useSecoundToTimeStr(useSecound)
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
        if (this.data.timeIntervalHandle) {
            clearInterval(this.data.timeIntervalHandle)
        }
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

    },
    /**
     * 结束使用
     */
    closeSingleOrder: function () {
        let that = this;
        // 提示是否结束订单
        util.confirmDialogForText('提示', '是否结束订单?', function () {
            util.showLoading('退款中...');
            var params = {
                singleOrderId: that.data.singleOrderId
            }
            util.request(api.OrderClose, params, 'GET').then(res => {
                var message = '订单已结束,感谢您的使用!';
                if (res.data > 0) {
                    message = '订单已结束,请注意查收退款余额!';
                }
                util.alertDialog('提示', message, '确定', function () {
                    wx.redirectTo({
                        url: '/pages/index/index'
                    })
                })
            }).catch(res => {
                util.alertDialog('提示', res.data || '退款失败，请稍后再试！')
            }).complete(res => {
                util.hideLoading();
            })
        })
    },
    /**
     * 继续使用
     */
    continueUse: function () {
        var param = '?singleOrderId=' + this.data.singleOrderId 
        param += '&productId=' + this.data.iotProductId 
        param += '&deviceId=' + this.data.iotDeviceId;
        wx.redirectTo({
            url: '/pages/using1/using1' + param
        })
    },
    /**
     * 页面跳转
     */
    goPages: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    },
})