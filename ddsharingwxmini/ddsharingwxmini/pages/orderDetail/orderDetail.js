// pages/orderDetail/orderDetail.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderDetail: {
            orderId: '',
            siteName: '',
            packageName: '',
            create_time: '',
            statusName: '完成'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let orderId = options.orderId;
        this.loadView(orderId);
    },
    /**
     * 加载订单
     * @param {long} orderId 
     */
    loadView: function (orderId) {
        let that = this;
        // 2.登录服务
        app.firstOperate(that, '加载中...');
        var params = {
            singleOrderId: orderId
        }
        util.request(api.OrderDetail, params).then(res => {
            console.log(res.data);
            var orderInfo = res.data;
            var orderDetail = {
                orderId: orderInfo.orderId,
                siteName: orderInfo.detailmap.siteName,
                merge_area: orderInfo.detailmap.merge_area,
                packageName: (orderInfo.detailmap.secound/3600) + '小时',
                create_time: orderInfo.detailmap.create_time,
                statusName: (orderInfo.detailmap.using_status ? '完成' : '进行中')
            }
            that.setData({
                orderDetail: orderDetail
            })
        }).catch(res => {
            util.alertDialog('提示信息', '加载订单信息异常。')
        }).complete(res => {
            app.endOperate(that);
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