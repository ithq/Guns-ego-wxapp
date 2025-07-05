// pages/agent/agentAdd/agentAdd.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/agentDetail.js");  //语言包
const common = require("../../../language/common.js");
const event = require("../../../utils/event.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        icon1: "agent/icon1.png",
        icon2: "agent/icon2.png",
        icon3: "agent/icon3.png",
        icon4: "agent/icon4.png",
        icon5: "agent/icon5.png",
        icon6: "agent/icon6.png",
        icon7: "agent/icon7.png",
        icon8: "agent/icon8.png",
        icon9: "agent/icon9.png",
        empty: "agent/iconEmpty.png",
        full: "agent/iconFull.png",
        closeImg: "public/close.png",
        region: [],
        userId: "",//选择用户的id
        userName: "",//选择用户的昵称
        showBgBox: false,
        showContent: false,
        showAgentLevel: false,
        agentStatu: 0,
        agentArr:[],
        agentGroupName: "",
        groupId: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.addTitle
        });
        this.getAgentLevael();
    },
    //添加代理addAgent
    submitAgent(data){
        console.log(JSON.stringify(data.detail.value));
        var submitData = data.detail.value;
        request.post(api.addAgent,submitData).then(res => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.addSuccess);
                event.$emit({
                    name: "reflashAgent",
                    data: "刷新"
                });
            };
            setTimeout(function(){
                wx.navigateBack();
            },1500);
        }).then(err => {
           
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取代理商级别
    getAgentLevael(){
        request.post(api.agentLevel).then(res => {
            if(res.code == 1){
                self.setData({
                    agentArr: res.data,
                    groupId: res.data[0].groupId,
                    agentGroupName: res.data[0].name
                })
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //三级联动
    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          region: e.detail.value
        })
    },
    //显示代理等级选择框
    chooseAgentShow(){
        self.setData({
            showAgentLevel: true,
            showBgBox: true,
            showContent: true
        })
    },
    //隐藏代理等级选择框
    chooseAgentHide(){
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
    //选择代理
    chooseAgentLevel(e){
        var agentStatu = e.target.dataset.statu;
        var agentId = e.target.dataset.groupid;
        var agentGroupName = e.target.dataset.groupname;
        self.setData({
            agentStatu: agentStatu,
            groupId:agentId,
            agentGroupName: agentGroupName
        });
        this.chooseAgentHide();
    },
    //页面跳转
    jumpPage: function (e) {
        var url = e.currentTarget.dataset.url;
        wx.navigateTo({
            url: url
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
        //选择业务或者店铺之后，返回参数
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var mydata = currPage.data.mydata;//为传过来的值
        console.log("返回的数据："+JSON.stringify(mydata));
        if(mydata){
            self.setData({
                userId: mydata.userid,
                userName: mydata.username
            })
        }
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