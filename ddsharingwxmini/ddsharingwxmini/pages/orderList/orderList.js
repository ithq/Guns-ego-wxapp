// pages/order/order.js
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderList: [],
        limit: 10,
        lastId: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getOrderList();
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
     * 查询订单列表
     */
    getOrderList: function () {
        let that = this;
        // 提示是否结束订单
        if (!app.firstOperate(that, '正在加载...')) {
            return;
        }
        var params = {
            limit: that.data.limit,
            lastId: that.data.lastId
        }
        util.request(api.OrderList, params, 'GET').then(res => {
            console.log(res.data)
            var dataList = res.data.data;
            if (dataList.length == 0) {
                return;
            }
            for (var i in dataList) {
                /*1微信支付 2金币支付 3免费使用 5微信支付*/
                if (dataList[i].package_type == 5) {
                    var singlePackageName = dataList[i].fee + "元";
                } else if (dataList[i].package_type == 2) {
                    var singlePackageName = dataList[i].golds + "金币";
                } else {
                    var singlePackageName = "免费使用";
                }
                singlePackageName += that.timeStamp(dataList[i].secound);
                dataList[i].singlePackageName = singlePackageName;
            }
            var orderList = that.data.orderList.concat(dataList);
            that.setData({
                orderList: orderList,
                lastId: dataList[dataList.length - 1].id
            })
        }).catch(res => {
            util.alertDialog('提示', res.data || '查询失败，请稍后再试！')
        }).complete(res => {
            app.endOperate(that);
        })
    },
    /**
     * 查看订单详情
     * @param {*} e 
     */
    onViewOrder: function (e) {
        var orderId = e.currentTarget.dataset.orderid;
        wx.navigateTo({
            url: "/pages/orderDetail/orderDetail?orderId=" + orderId
        });
    },
    timeStamp: function (secound) {
        var s = Math.floor(secound % 60); //计算秒
        var minite = Math.floor((secound / 60) % 60); //计算分
        var hour = Math.floor((secound / 3600) % 24); //计算小时
        var day = Math.floor((secound / 3600) / 24); //计算天
        var time = "";
        if (day > 0) {
            time += day + "天";
        }
        if (hour > 0) {
            time += hour + "小时";
        }
        if (minite > 0) {
            time += minite + "分";
        }
        if (s > 0) {
            time += s + "秒";
        }
        return time;
    },
    /**
     * 滚动
     * @param {*} params 
     */
    onReachBottom: function (params) {
        this.getOrderList();
    }
})