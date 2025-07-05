const app = getApp()
const util = require("../../utils/util");
const api = require('../../config/api.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        index: 0,
        singleOrderId: null,
        passlist: [],
        closeOrderBtn: null,
        singleFaultTorefund: null,
        audioContext: null, // 音频对象
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let singleOrderId = options.singleOrderId;
        this.loadview(singleOrderId);
    },
    /**
     * 加载
     * @param {*} singleOrderId 
     */
    loadview: function (singleOrderId) {
        let that = this;
        // 1.创建音频
        if (wx.createInnerAudioContext) {
            that.setData({
                audioContext: wx.createInnerAudioContext()
            })
        }
        // 2.加载订单信息
        util.showLoading('加载中...');
        var params = {
            singleOrderId: singleOrderId
        }
        util.request(api.OrderDetail, params, 'GET').then(res => {
            let responseInfo = res.data;
            wx.setStorageSync('responseInfo', res.data);
            that.setData({
                singleOrderId: singleOrderId,
                index: responseInfo.index,
                passlist: responseInfo.passlist,
                closeOrderBtn: responseInfo.closeOrderBtn,
                singleFaultTorefund: responseInfo.singleFaultTorefund
            })
        }).catch(res => {
            util.alertDialog('提示', res.data || '加载失败，请稍后再试！')
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
        that.data.audioContext.src = '/static/video/get_password.mp3';
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
     * 更新密码
     */
    replacePassWd: function () {
        let that = this;
        // 提示是否结束订单
        util.showLoading('加载中...');
        var params = {
            orderId: that.data.singleOrderId
        }
        util.request(api.ReplacePassWd, params, 'GET').then(res => {
            that.loadview(that.data.singleOrderId);
        }).catch(res => {
            util.alertDialog('提示', res.data || '更新失败，请稍后再试！')
        }).complete(res => {
            util.hideLoading();
        })
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
                util.alertDialog('提示', message, '确认', function () {
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
     * 故障上报
     */
    singleFaultTorefund: function () {
        this.setData({
            singleOrderId: this.data.singleOrderId
        })
        wx.navigateTo({
            url: '/pages/faultOption/faultOption?fromPage=using2'
        })
    }
})