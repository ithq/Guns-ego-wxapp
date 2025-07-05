const app = getApp()
const util = require("../../utils/util");
const api = require('../../config/api.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        productId: null,
        deviceId: null,
        device: null,
        securityPackage: null,
        singlePackageData: null,
        status: null,
        payTime: null,
        audioContext: null // 音频对象
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
     * 加载
     */
    loadview: function (productId, deviceId) {
        let that = this;
        util.showLoading('正在加载...');
        // 创建音频
        if (wx.createInnerAudioContext) {
            that.setData({
                audioContext: wx.createInnerAudioContext()
            })
        }
        // 加载页面
        var params = {
            productId: productId,
            deviceId: deviceId
        }
        util.request(api.WxpayPackage, params).then(res => {
            let responseInfo = res.data;
            that.setData({
                device: responseInfo.device,
                securityPackage: responseInfo.securityPackage,
                singlePackageData: responseInfo.singlePackageData,
                status: responseInfo.status
            })
        }).catch(res => {
            that.endOperate(obj);
            util.alertDialog('提示信息', '加载失败，请稍后再试', '确定', function () {
                wx.redirectTo({
                    url: '/pages/index/index.js',
                })
            })
        }).complete(res => {
            util.hideLoading();
        })
    },
    /**
     * 播放音频
     */
    playAudio: function () {
        let that = this;
        if (that.data.audioContext == null) {
            that.setData({
                audioContext: wx.createInnerAudioContext()
            })
        }
        that.data.audioContext.src = '/static/video/single_pay_package.mp3';
        that.data.audioContext.play();
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
        // 播放音频
        this.playAudio();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // 停止播放音频
        if (this.data.audioContext) {
            this.data.audioContext.stop();
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        // 停止播放音频
        if (this.data.audioContext) {
            this.data.audioContext.stop();
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
     * 付款获取密码
     */
    pay: function () {
        let that = this;
        util.showLoading('订单生成中...');
        var params = {
            singleId: that.data.device.id,
            packageId: that.data.securityPackage.id
        }
        util.request(api.WxpayUrl, params, 'GET').then(res => {
            // 订单超时，自动结束订单
            if (res.code == 400) {
                that.closeSingle(res.data);
            }
            // 调用支付
            that.wxPay(res.data);
        }).catch(res => {
            util.hideLoading();
            util.alertDialog('提示', res.data || '支付失败，请稍后重试');
        })
    },
    /**
     * 调用微信支付
     * @param {object} data
     */
    wxPay: function (data) {
        let that = this;
        wx.requestPayment({
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            paySign: data.paySign,
            signType: data.signType,
            success: function (res) {
                // 支付成功
                that.setData({
                    payTime: new Date().valueOf()
                })
                that.checkPay(data.singleOrderId);
            },
            fail: function (res) {
                // 取消支付
                util.hideLoading();
            }
        })
    },
    /**
     * 支付成功检查
     */
    checkPay: function (singleOrderId) {
        let that = this;
        var params = {
            'singleOrderId': singleOrderId
        }
        util.request(api.OrderCheckPay, params, 'GET').then(res => {
            if (res.data == 'success') {
                // 跳转页面
                wx.redirectTo({
                    url: '/pages/using1/using1?singleOrderId=' + singleOrderId
                })
            } else {
                that.recheckPay();
            }
        }).catch(res => {
            that.recheckPay(singleOrderId);
        })
    },
    /**
     * 重新检查支付成功
     * @param {*} singleOrderId 
     */
    recheckPay: function (singleOrderId) {
        // 大于30秒没有成功，认为是失败，否则5秒重试查询一次
        if ((new Date().valueOf() - that.data.payTime) > 30000) {
            util.hideLoading();
            util.alertDialog('友情提示', '充值失败，请稍后再试。');
        } else {
            // 5秒钟重试查询一次
            setTimeout(() => {
                that.checkPay(singleOrderId);
            }, 5000);
        }
    },
    /**
     * 订单超时，自动结束订单
     * @param {object} singleOrder
     */
    closeSingle: function (singleOrder) {
        let that = this;
        // 结束订单
        var params = {
            singleOrderId: singleOrder
        }
        util.request(api.OrderClose, params, 'GET').then(res => {
            that.pay();
        }).catch(res => {
            // util.alertDialog('提示', res.data || '退款失败，请稍后再试！')
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