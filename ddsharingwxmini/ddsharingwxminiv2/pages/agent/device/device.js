// pages/agent/device/device.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/device.js"); //语言包
const common = require("../../../language/common.js");
const { setLanguage } = require("../../../utils/util.js");

const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self, key = "",
    page = 1;
var isBind = "",
    isOnline = 1; //1已绑，0未绑      1在线，0离线
var bindIndex; //绑定代理设备数据下标
var type;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        deviceStatu: 0, //设备状态，默认0在线，1已绑，2离线，3未绑
        listData: {},
        deviceCount:{},
        loadMore: true,
        triggered: true,
        showData: false,
        qrcode: "",//搜索框值
        iconScan: "device/icon_scan3.png", //扫码
        iconCharge: "device/icon_charge3.png", //充电
        iconChooseEmpty: "device/icon_chooseEmpty3.png", //灰色圈空白
        iconChooseGreen3: "device/icon_chooseGreen3.png", //绿色选中
        iconChooseEmptyWhite: "device/icon_chooseEnptyWhite3.png", //空白白色圈
        iconChooseFullWhite: "device/icon_chooseFullWhite3.png", //选中白色圈
        iconSearch: "device/icon_search3.png", //放大镜
        key: "",
        type: "",
        groupId: wx.getStorageSync('loginGroupId')
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        isOnline = 1; //默认在线
        type = wx.getStorageSync('productType');            
        console.log("产品类型："+ type);
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        self.setData({
            type: type
        });
        if(type != 1){  //修改默认选择项
            self.setData({
                deviceStatu: 1
            })
        };
        if(type == 1){
            isOnline = 1; 
            isBind = "";
        }else if(type == 2){
            isOnline = ""; 
            isBind = 1;
        }
        this.getData();
        this.getDeviceCount();
    },
    
    //状态切换
    changeNav(e) {
        this.setData({
            deviceStatu: e.target.dataset.i
        });
        if(e.target.dataset.i == 0){
            isBind = "",
            isOnline = 1;
        }else if(e.target.dataset.i == 1){
            isBind = 1,
            isOnline = "";
        }else if(e.target.dataset.i == 2){
            isBind = "",
            isOnline = 0;
        }else if(e.target.dataset.i == 3){
            isBind = 0,
            isOnline = "";
        };
        page = 1;
        this.getData();
    },
    //获取设备数量
    getDeviceCount() {
        //deviceStateCount
        request.post(api.deviceStateCount,{
            key: key,
            type: type
        }).then((res) => {
            self.setData({
                deviceCount: res.data
            })
        }).catch((err) => {

        })
    },
    //获取设备数据
    getData() {
        //agentDeviceList
        console.log("搜索key："+key);
        console.log("page："+page);
        request.post(api.agentDeviceList, {
            deviceBinding: isBind,
            key: key,
            type: type,
            online: isOnline,
            page: page,
            pageSize: 10
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
                        page++;
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
                        console.log("拼接数据");
                        page++;
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
        page = 1;
        this.getData();
        this.getDeviceCount();
    },
    //扫码获取设备二维码
    // 打开扫码
    scan: util.throttle(function(e) {
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
              console.log("扫码结果：" + JSON.stringify(res));
              if (res.errMsg == "scanCode:ok") {
                var qrCodeUrl = res.result;
                var qrCodeArr = qrCodeUrl.split("/");
                var qrCode = qrCodeArr[qrCodeArr.length - 1];
                self.setData({
                    qrcode: qrCode
                });
                key = qrCode;
                //扫码成功自动搜索
                page = 1;
                self.getDeviceCount();
                self.getData();
              } else {
                console.log("扫码失败");
              }
            },
            fail: (err) => {
              // showToast(errMsg);
              console.log("取消扫码");
            }
        })
    }, 1000),

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
            qrcode: ""
        });
        key = '';
        page = 1;
        this.getDeviceCount();
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
    //重启设备
    //agentRebootDevice
    restart(e){
        var deviceId = e.target.dataset.deviceid;
        request.post(api.agentRebootDevice+"?deviceId="+deviceId).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.restartSuccess);
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //绑定代理
    bindAgent(e) {
        //deviceBindingAgent
        var deviceid = e.target.dataset.deviceid;
        bindIndex = e.target.dataset.index;
        wx.navigateTo({
          url: '../chooseAgentDevice/chooseAgentDevice?deviceId=' + deviceid,
        })
    },
    //撤销代理
    unBindAgent(e){
        wx.showModal({
            title: self.data.common.tips,
            content: self.data.lg.isUnBindDevie,
            success (res) {
                if (res.confirm) {
                    request.post(api.deviceRevokeAgent,{
                        agentId: e.target.dataset.agentid,
                        deviceId: e.target.dataset.deviceid
                    }).then(res => {
                        if(res.code == 1){
                            util.myShowToast(self.data.lg.unBindSuccess);
                            self.data.listData[e.target.dataset.index].agentBinding = 0;
                            self.setData({
                                listData: self.data.listData
                            });
                        }
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
    //页面跳转
    jumpPage: function(e) {
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
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var mydata = currPage.data.mydata;//为传过来的值
        if(mydata){
            console.log(bindIndex);
            self.data.listData[bindIndex].agentBinding = 1;//修改被绑定的设备的状态
            self.setData({
                listData: self.data.listData
            });
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
        page = 1;
        key = "";
        if(type == 1){
            isOnline = 1; 
            isBind = "";
        }else if(type == 2){
            isOnline = ""; 
            isBind = 1;
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        
    },
    
    loadMore() { // 触底加载更多
        //上拉加载更过
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