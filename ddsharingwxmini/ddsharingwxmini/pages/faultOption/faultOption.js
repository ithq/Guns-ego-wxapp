// pages/faultOption/faultOption.js
var util = require('../../utils/util.js');
var check = require('../../utils/check.js');
var api = require('../../config/api.js');

var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        replacePassWdHid: true,
        replacePassWdText: "如果输入密码无法开机,请点击此按钮,更换新的密码",
        replaceDeviceText: "如果设备出现故障,请联系客房服务,更换新的设备。请点击此按钮，重新扫描设备二维码,即可使用",
        faultReportText: "如果设备无法使用,请点击此按钮上报故障", //,自动退款(5分钟内有效)
        singleOrderId: null,
        refundTime: 0, // 自动退款时间，单位分钟;0表示关闭
        faultOption: null,
        fromPage: null, //从那个页面跳转过来
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.loadview(options);
    },
    /**
     * 加载显示
     */
    loadview: function (options) {
        var responseInfo = wx.getStorageSync('responseInfo');
        var faultOption = responseInfo.faultOption;
        this.setData({
            faultOption: faultOption,
            replacePassWdHid: (faultOption.indexOf("1") == -1),
            replacePassWdHid: (faultOption.indexOf("2") == -1),
            faultReportHid: (faultOption.indexOf("3") == -1),
            singleOrderId: responseInfo.orderId,
            fromPage: (options.fromPage || '')
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

    },
    /**
     * 更新密码
     */
    replacePassWd: function () {
        let that = this;
        // 提示是否结束订单
        if (!app.firstOperate(that, '正在加载...')) {
            return;
        }
        var params = {
            orderId: that.data.singleOrderId
        }
        util.request(api.ReplacePassWd, params, 'GET').then(res => {
            var pageList = {
                'using1': '/pages/using1/using1',
                'using2': '/pages/using2/using2'
            };
            var url = pageList[that.data.fromPage];
            wx.redirectTo({
                url: url + '?singleOrderId=' + res.data.singleOrderId
            })
        }).catch(res => {
            util.alertDialog('提示', res.data || '更新失败，请稍后再试！')
        }).complete(res => {
            app.endOperate(that);
        })
    },
    /**
     * 更换设备
     */
    replaceDevice: function () {
        let that = this;
        if (!app.firstOperate(that, '正在加载...')) {
            return;
        }
        wx.scanCode({
            success: (res) => {
                var deviceInfo = app.getParamByUrl(res.result);
                if (deviceInfo.productId == '' || deviceInfo.deviceId == '') {
                    util.alertDialog('提示信息', '请扫码正确的二维码！', '确定');
                    return;
                }
                that.replaceDeviceService(that.data.singleOrderId, deviceInfo);
            },
            complete: (res) => {
                app.endOperate(that);
            }
        })
    },
    /**
     * 更换设备服务
     * @param {int} singleOrderId
     * @param {object} deviceInfo
     */
    replaceDeviceService: function (singleOrderId, deviceInfo) {
        let that = this;
        var params = {
            orderId: singleOrderId,
            iotProductId: deviceInfo.productId,
            iotDeviceId: deviceInfo.deviceId
        }
        util.request(api.ReplaceDevice, params, 'GET').then(res => {
            wx.setStorageSync('responseInfo', res.data);
            wx.redirectTo({
                url: '/pages/using/using',
            })
        }).catch(res => {
            util.alertDialog('提示', res.data || '更换设备失败，请稍后再试！')
        }).complete(res => {
            app.endOperate(that);
        })
    },
    /**
     * 故障上报
     */
    faultReport: function () {
        wx.navigateTo({
            url: '/pages/faultReport/faultReport',
        })
    }
})