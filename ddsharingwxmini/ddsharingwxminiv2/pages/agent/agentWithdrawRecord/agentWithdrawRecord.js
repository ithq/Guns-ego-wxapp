// pages/agent/agentWithdrawRecord/agentWithdrawRecord.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/agentWithdrawRecord.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,
    key = "",
    page = 1,
    type = "",
    isload = true;
const pageSize = 10; 
let lastMonth = 0; // 每月数据最后一组数据的月份
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrl,
        imgUrlAgent: app.globalData.imgUrlAgent,
        listData: [],
        loadMore: true,
        showData: false,
        showBgBox: false,
        showAgentLevel: false,
        showContent: false,
        info: {},
        showStatu: util.getLanguage(language).statuAll,
        iconAll: "withdraw/all.png",
        icon1: "withdraw/icon1.png",
        icon2: "withdraw/icon2.png",
        icon3: "withdraw/icon3.png",
        icon4: "withdraw/icon4.png",
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        this.getMoney();
        this.getData();
    },
    //获取金额
    getMoney() {
        request.post(api.appindex).then((res) => {
            if(res.code == 1){
                self.setData({
                    info: res.data
                })
            }
        }).catch((err) => {
            self.setData({
                expired: true
            })
        });
    },
    //提现记录
    getData() {
        var override;
        if(page == 1){
            override = true;
        }else{
            override = false;
        }
        lastMonth = override ? 0 : lastMonth;
        request.post(api.agentWithdrawalList, {
            key: key,
            page: page,
            pageSize: pageSize,
            type: 3,       
            withdrawalStatus: type     //提现状态 1通过 0未通过 2 申请中(不传值，查询所有)
        }).then((res) => {
            if (res.data.length > 0) {
                let pageData = res.data;
                let pageArrayData = [];
                
                pageData.map(item => {
                    item.monthShow = true // 显示月份
                    pageArrayData = pageArrayData.concat(item.data)

                    if (item.month == lastMonth) { // 如果当前月份和上一页数据最后的月份相同则隐藏月份
                        item.monthShow = false
                    }
                });
               
                lastMonth = pageData[res.data.length - 1].month // 重新赋值
                
                self.setData({
                    listData: override ? pageData : self.data.listData.concat(pageData),
                    loadMore: parseInt(pageArrayData.length % pageSize) == 0 ? true : false,
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
            this._freshing = false
        });
    },

    //页面跳转
    jumpPage: function(e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
        })
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
            this.getData(this.data.page + 1)
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
    
    //选择
    chooseStatu(e){
        self.setData({
            showStatu: e.currentTarget.dataset.showtxt,
            listData: []
        });
        this.chooseHide();
        type = e.currentTarget.dataset.type;
        page = 1;
        this.getData();
    },

    //显示选择框
    chooseShow(){
        self.setData({
            showAgentLevel: true,
            showBgBox: true,
            showContent: true
        })
    },
    //隐藏选择框
    chooseHide(){
        self.setData({
            showBgBox: false,
            showContent: false
        });
        setTimeout(function(){
            self.setData({
                showAgentLevel: false
            })
        },1000);
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
        page = 1;
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        // page = 1;
        // key = '';
        // this.getData();
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