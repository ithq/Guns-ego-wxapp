// pages/agent/fencheng/fencheng.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/fencheng.js"); //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self, key = "",type = "",
    page = 1,deviceType = 1;
const pageSize = 10; 
let lastMonth = 0; // 每月数据最后一组数据的月份
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconSearch: "device/icon_search3.png", //放大镜
        statu: 0,
        shareStatistics:{},
        showData: false,
        loadMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        deviceType = wx.getStorageSync('productType');           
        this.getTotal();
        this.getData();
    },
    //状态切换
    changeNav(e) {
        var index = e.target.dataset.i;
        this.setData({
            statu: e.target.dataset.i,
            listData: []
        });
        if(index == 0){
            type = "";
        }else if(index == 1){
            type = 5;
        }else if(index == 2){
            type = 6;
        }else if(index == 3){
            type = 1;
        }
        page = 1;
        this.getData();
    },
    //获取统计总金额
    getTotal(){
        request.post(api.shareStatistics,{
            type: deviceType,
            key: key
        }).then(res => {
            if(res.code == 1){
                self.setData({
                    shareStatistics: res.data
                })
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取数据shareList
    getData() {
        var override;
        if(page == 1){
            override = true;
        }else{
            override = false;
        };
        lastMonth = override ? 0 : lastMonth;
        request.post(api.shareList, {
            endTime: "",
            key: key,
            page: page,
            pageSize: pageSize,
            startTime: "",
            type: deviceType,         
            userType: type        //1 账号登录 2 facebook 3 google 4 ios 5 微信 6 支付宝
        }).then((res) => {
            if (res.data.length > 0) {
                let pageData = res.data;
                let pageArrayData = []
                
                pageData.map(item => {
                    item.monthShow = true // 显示月份
                    pageArrayData = pageArrayData.concat(item.data)

                    if (item.month == lastMonth) { // 如果当前月份和上一页数据最后的月份相同则隐藏月份
                        item.monthShow = false
                    }
                });
               
                lastMonth = pageData[res.data.length - 1].month // 重新赋值
                if(page == 1){
                    self.setData({
                        listData: []
                    });
                };
                
                let dataLength = 0;
                for(var i=0;i<pageData.length;i++){
                    dataLength += pageData[i].orderCommissionList.length;       //计算数组中不同月份订单的数量
                }
                self.setData({
                    listData: override ? pageData : self.data.listData.concat(pageData),
                    loadMore: parseInt(dataLength % pageSize) == 0 ? true : false,
                    showData: false
                });
            } else {
                if(page == 1){
                    self.setData({
                        showData: true,
                        loadMore: true
                    })
                }
            }
        }).then((res) => {
            this.setData({
                loadingData: false,
                triggered: false
            })
            this._freshing = false
        }).catch((err) => {
            this.setData({
                loadMore: true,
                loadingData: true,
                triggered: false
            })
            this._freshing = false;
            wx.showModal({
                content: JSON.stringify(err)
            });
        });
    },
     /**
   * 页面上拉触底事件的处理函数
   */
    scrollToLower: function (e) {
        let loadingData = this.data.loadingData
        if (loadingData || !this.data.loadMore) return
        this.setData({
            loadingData: true
        });
        
        // 加载下一页数据
        if (this.data.loadMore) {
            page++;
            this.getData()
        }
    },
      /**
       * 页面相关事件处理函数--监听用户下拉动作
       */
    onRefresh() { // 自定义下拉刷新被触发
        if (this._freshing) return;
        this._freshing = true;
        page = 1;
        key = "";
        this.getData();
    },
    //页面跳转
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
    },
    // 点击键盘上的搜索
    bindconfirm:function(e){
        var discountName=e.detail.value['search - input'] ?e.detail.value['search - input'] : e.detail.value 
        console.log('e.detail.value', discountName)
        key = discountName;
        page = 1;
        this.getTotal();
        this.getData();
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
        type = "";
        key = "";
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