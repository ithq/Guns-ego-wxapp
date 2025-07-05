// pages/agent/order/order.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/order.js");  //语言包
const common = require("../../../language/common.js");
const { setLanguage } = require("../../../utils/util.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self, key = "",
    statu = 2,//租借状态，0 未租借 1 请求中 2 租借中 3 已撤销 4 故障单 5 已归还 6 购买单 8 超时单 9 已删除
    page = 1,
    type = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        commonLg: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        orderStatu: 0,     //设备状态，默认0租借中，1已完成，2逾期购买
        iconSearch: "device/icon_search3.png",        //放大镜
        loadMore: true,
        triggered: true,
        showData: false,
        orderCount: {},
        listData: [],
        key: "",
        type: ""
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
        this.setData({
            type: type
        });
        this.getOrderCount();
        this.getData();
    },
     //状态切换
    changeNav(e){
        var navType = e.target.dataset.i;
        this.setData({
            orderStatu: navType
        });
        if(navType == 0){
            statu = 2;
        }else if(navType == 1){
            statu = 5;
        }else if(navType == 2){
            statu = 6;
        }else if(navType == 3){
            statu = 8;
        };
        page = 1;
        this.getData();
    },
    //获取订单数量orderStatusCount
    getOrderCount() {
        request.post(api.orderStatusCount,{
            key: key,
            type: type
        }).then((res) => {
            self.setData({
                orderCount: res.data
            })
        }).catch((err) => {

        })
    },
    //获取订单列表
    getData() {
        //agentDeviceList
        request.post(api.agentOrderList, {
            borrowState: statu,
            endTime: "",
            key: key,
            page: page,
            pageSize: 10,
            startTime: "",
            type: type    
        }).then((res) => {
            if (res.code == 1) {
                if (page == 1) {
                    if (res.data.length <= 0) {
                        //没有数据
                        self.setData({
                            listData: []
                        });
                        self.setData({
                            showData: true,
                            loadMore: true
                        });
                    } else {
                        res.data.map(item => {
                            if (item.borrowState == 2) {
                                var diffTime = util.diffTime(item.borrowTime);
                                item.usedMinute =  util.diffTimeFormat(diffTime);
                            } else {
                                item.usedMinute = util.leaseUseTime(item.usedMinute);
                            }
                        });
                        console.log("渲染数据："+JSON.stringify(res.data));
                        // page++;
                        self.setData({
                            listData: res.data,
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
                        res.data.map(item => {
                            if (item.borrowState == 2) {
                                var diffTime = util.diffTime(item.borrowTime);
                                item.usedMinute =  util.diffTimeFormat(diffTime);
                            } else {
                                item.usedMinute = util.leaseUseTime(item.usedMinute)
                            }
                        });
                        // page++;
                        self.setData({
                            listData: self.data.listData.concat(res.data)
                        });
                    } else {
                        //加载完毕,没有更多了
                        self.setData({
                            loadMore: false
                        })
                    };
                };
            };
            wx.stopPullDownRefresh();
        }).catch((err) => {
            wx.stopPullDownRefresh();
            self.setData({
                expired: true
            })
        });
    },
    // 点击键盘上的搜索
    bindconfirm:function(e){
        var discountName=e.detail.value['search - input'] ?e.detail.value['search - input'] : e.detail.value 
        console.log('e.detail.value', discountName)
        key = discountName;
        self.setData({
            key: key
        });
        page = 1;
        this.getOrderCount();
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
            loadMore: true,
            key: ""
        });
        key = '';
        page = 1;
        this.getOrderCount();
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
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
      //一键复制
    copyTxt: util.throttle(function(e) {
        var txt = e.currentTarget.dataset.txt;
        wx.setClipboardData({
            data: txt,
            success (res) {
                util.showToast(self.data.commonLg.copySuccessful)
                wx.getClipboardData({
                    success (res) {
                        console.log(res.data) // data
                    }
                })
            }
        })
    }, 1000),
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
        console.log("页面卸载");
        //页面卸载后，参数复原，防止下次加载错误数据
        key = "";
        statu = 2,
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