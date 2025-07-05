// pages/agent/userEdit/userEdit.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/user.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,id;
var clicktype=""; //选择类容， 0表示选择的是用户类型，1表示选择的是提现许可
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconRightArrow: "public/rightArrow.png",//右箭头
        empty: "agent/iconEmpty.png",
        full: "agent/iconFull.png",
        closeImg: "public/close.png",
        info: {},
        statu: 1,
        showBgBox: false,
        showContent: false,
        showAlert: false,
        chooseTitle: "",
        choose1: "",
        choose2: "",
        clicktype: "",
        showValue: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        id = options.id;        //用户ID
        wx.setNavigationBarTitle({
            title: self.data.lg.editTitle
        });
        this.getData();
    },
    //获取数据
    getData() {
        request.post(api.userDetails,{
            id: id
        }).then(res => {
            if(res.code == 1){
                self.setData({
                    info: res.data
                })
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //显示选择框
    showChoose(e){
        clicktype = e.target.dataset.clicktype;
        if(clicktype == 0 || clicktype == 1){
            self.setData({
                showAlert: true,
                showBgBox: true,
                showContent: true,
                chooseTitle: e.target.dataset.title,
                choose1: e.target.dataset.choose1,
                choose2: e.target.dataset.choose2,
                statu: e.target.dataset.statu,
                clicktype: clicktype
            })
        }else if(clicktype == 2){
            self.setData({
                showAlert: true,
                showBgBox: true,
                showContent: true,
                showValue: self.data.info.accountYajin,
                chooseTitle: e.target.dataset.title,
                clicktype: clicktype
            })
        }else if(clicktype == 3){
            self.setData({
                showAlert: true,
                showBgBox: true,
                showContent: true,
                showValue: self.data.info.accountMy,
                chooseTitle: e.target.dataset.title,
                clicktype: clicktype
            })
        }
    },
    //隐藏选择框
    hideChoose(){
        self.setData({
            showBgBox: false,
            showContent: false
        });
        setTimeout(function(){
            self.setData({
                showAlert: false
            })
        },1000);
    },
    //选择
    chooseChange(e){
        var statu = e.target.dataset.statu;
        self.setData({
            statu: statu
        });
        console.log(statu);
        if(clicktype == 0){
            //用户类型
            self.data.info.userClass = statu;
            self.setData({
                info: self.data.info
            });
        }else if(clicktype == 1){
            //提现许可
            self.data.info.withdraw = statu;
            self.setData({
                info: self.data.info
            });
        };
        this.hideChoose();
    },
    //获取填写金额
    sureMoney(data) {
        var money = data.detail.value.money;
        if(clicktype == 2){
            //用户押金
            self.data.info.accountYajin = money;
            self.setData({
                info: self.data.info
            });
        }else if(clicktype == 3){
            self.data.info.accountMy = money;
            self.setData({
                info: self.data.info
            });
        };
        this.hideChoose();
    },
    //提交修改
    submitInfo(){
        var subData = self.data.info;
        request.post(api.updateUser,subData).then(res => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.editSuccess);
            };
            setTimeout(function(){
                wx.navigateBack()
            },1500)
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
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