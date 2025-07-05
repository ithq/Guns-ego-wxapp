// pages/agent/agent/agent.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/agent.js");  //语言包
const common = require("../../../language/common.js");
const event = require("../../../utils/event.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,
    key = "",
    page = 1,
    groupId,
    agentType,
    type = 1,
    isreFresh = true;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        iconAdd: "shop/icon_add3.png",
        listData: [],
        agentArr: [],
        statu: 0,
        iconSearch: "device/icon_search3.png", //放大镜
        triggered: true,
        loadMore: true,
        showData: false,
        key: ""
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
        self.getAgentNav();

        event.$on({
            name:"reflashAgent",
            tg:this,
            success:(res)=>{
              self.getAgentNav();
            }
        })

    },
    //导航栏切换
    changeNav(e) {
        agentType = e.target.dataset.i;
        groupId = e.target.dataset.groupid;
        this.setData({
            statu: agentType
        });
        page = 1;
        this.getData();
    },
    //获取代理导航栏
    getAgentNav(){
        request.post(api.agentLevel,{
            type: type,
            key: key
        }).then(res => {
            console.log("导航栏");
            if(res.code == 1){
                if(!groupId){
                    groupId = res.data[0].groupId;
                };
                self.setData({
                    agentArr: res.data,
                    listData: []
                });
                self.getData();
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取数据
    getData(){
        console.log("page:"+page);
        console.log("分组ID："+groupId);
        request.post(api.agentList, {
            groupId: groupId,         //代理类型
            page: page,
            pageSize: 10,
            key: key,
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
                            showData: true
                        });
                    } else {
                        self.setData({
                            listData: res.data,
                            loadMore: true,
                            showData: false
                        });
                    };
                    self.setData({ //下拉刷新复位
                        triggered: false
                    });
                    this._freshing = false;
                } else {
                    if (res.data.length > 0) {
                        self.setData({
                            listData: self.data.listData.concat(res.data)
                        });
                    } else {
                        //加载完毕,没有更多了
                        self.setData({
                            loadMore: false
                        })
                    }
                };
            };
            wx.stopPullDownRefresh();
        }).catch((err) => {
            wx.stopPullDownRefresh();
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },

    //删除代理
    deleteAgent(e){
        console.log(JSON.stringify(e));
        var id = e.target.dataset.id;
        var index = e.target.dataset.index; //删除成功移除该项

        wx.showModal({
            title: self.data.common.tips,
            content: self.data.lg.isDelete,
            success (res) {
                if (res.confirm) {
                    request.post(api.removeAgent,{
                        id: id
                    }).then(res => {
                        if(res.code == 1){
                            util.myShowToast(self.data.lg.deleteSuccess);
                            // self.setData({
                            //     listData: self.data.listData.splice(index,1)
                            // });
                            self.getAgentNav();
                        };
                    }).catch(err => {
                        wx.showModal({
                            content: JSON.stringify(err)
                        });
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //扫码绑定设备给代理
    scan (e){
        console.log(JSON.stringify(e));
        isreFresh = false;
        var agentId = e.target.dataset.agintid;
        //type  agentBindDevice
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                console.log("扫码结果：" + JSON.stringify(res));
                if (res.errMsg == "scanCode:ok") {
                    var qrCodeUrl = res.result;
                    var qrCodeArr = qrCodeUrl.split("/");
                    var qrCode = qrCodeArr[qrCodeArr.length - 1];
                    self.bindDevice(qrCode,agentId);
                } else {
                    console.log("扫码失败");
                }
                isreFresh = true;
            },
            fail: (err) => {
                // util.myShowToast(errMsg);
                isreFresh = true;
            }
        })
    },
    bindDevice(qrCode,agentId){
        request.post(api.agentBindDevice,{
            sceneStr: qrCode,
            agentId: agentId,
            type: type 
        }).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.bindSuccess);
                //e.target.dataset.agintid
                var mjson = {
                    target:{
                        dataset: {
                            agintid: agentId
                        }
                    }
                }
                self.scan(mjson);
            }else{
                wx.showModal({
                    content: JSON.stringify(res.msg)
                });
            };
            // wx.hideLoading();
        }).catch((err) => {
            wx.hideLoading();
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    // 点击键盘上的搜索
    bindconfirm (e) {
        var discountName = e.detail.value['search - input'] ? e.detail.value['search - input'] : e.detail.value
        key = discountName;
        page = 1;
        self.setData({
            key: key
        });
        // this.getData();
        this.getAgentNav();
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
        page = 1;
        key = '';
        this.getAgentNav();
        // this.getData();
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
        // if(isreFresh){
        //     this.setData({
        //         statu: 0
        //     });
        //     page = 1;
        //     this.getAgentNav();
        // }
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
        groupId = "";
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