// pages/agent/chooseScene/chooseScene.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/chooseScene.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self;
var key = '',
    page = 1;
var pages,prevPage;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconSearch: "device/icon_search3.png",        //放大镜
        sceneArr: [],
        triggered: true,
        loadMore: true,
        showData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        //获取上个页面
        pages = getCurrentPages();
        prevPage = pages[pages.length - 2]; //上一个页面
        this.getData();
    },
    //获取场景
    getData(){
        request.post(api.industryList+"?key="+key).then((res) => {
            if(res.code == 1){
                self.setData({
                    sceneArr: res.data
                })
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //选择
    chooseScene(e) {
        console.log(JSON.stringify(e));
        var sceneId = e.currentTarget.dataset.sceneid;      //场景ID
        var sceneName = e.currentTarget.dataset.scenename;  //场景名称
        //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
        prevPage.setData({
            mydata: {
                sceneId: sceneId,
                sceneName: sceneName
            }
        });
        wx.navigateBack({//返回
            delta: 1
        });
    },
    // 点击键盘上的搜索
    bindconfirm:function(e){
        var discountName=e.detail.value['search - input'] ?e.detail.value['search - input'] : e.detail.value 
        key = discountName;
        page = 1;
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
            loadMore: true
        });
        page = 1;
        key = '';
        this.getData();
    },
    //加载更多
    lodeMore() {
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
        key = "";
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