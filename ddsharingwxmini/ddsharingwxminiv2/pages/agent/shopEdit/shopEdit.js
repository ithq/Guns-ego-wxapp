// pages/agent/shopEdit/shopEdit.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/addShop.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,
    shopId,type = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        commonLg: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        icon1: "addShop/icon1.png",
        icon2: "addShop/icon2.png",
        icon3: "addShop/icon3.png",
        icon4: "addShop/icon4.png",
        icon5: "addShop/icon5.png",
        icon6: "addShop/icon6.png",
        icon7: "addShop/icon7.png",
        icon8: "addShop/icon8.png",
        icon9: "addShop/icon9.png",
        icon10: "addShop/icon10.png",
        icon11: "addShop/icon11.png",
        icon12: "addShop/icon12.png",
        icon13: "addShop/icon13.png",
        icon14: "addShop/icon14.png",
        icon15: "addShop/icon15.png",
        icon16: "addShop/icon16.png",
        icon17: "addShop/icon17.png",
        icon18: "addShop/icon18.png",
        iconAdd: "addShop/add.png",
        logoImg: app.globalData.imgUrlAgent + "addShop/add.png",
        region: [],
        customItem: util.getLanguage(language).all,
        ywId: "",//选择业务管理员后选择店铺管理员需要的业务员ID；默认空，选择业务员后赋值
        ywTc: "",
        ywName:"",
        dpId: "",
        dpTc: "",
        dpName:"",
        longitude: "",
        latitude: "",
        coordinate: "",
        sceneId: "",
        sceneName: "",
        info:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.editTitle
        });
        type = wx.getStorageSync('productType');            
        self.setData({
            type: type
        });
        shopId = options.shopid;
        self.getData();
    },
    //获取数据agentShopDetails
    getData() {
        console.log(shopId);
        request.post(api.agentShopDetails,{
            shopId: shopId
        }).then((res) => {
            if(res.code == 1){
                self.setData({
                    info: res.data,
                    region: [res.data.province,res.data.city,res.data.district],
                    ywId: res.data.agentId4 == 0 ? '' : res.data.agentId4,
                    ywName: res.data.businessName,
                    ywTc: res.data.agentMoney4,
                    dpId: res.data.agentId5,
                    dpName: res.data.networkName,
                    dpTc: res.data.agentMoney5,
                    longitude: res.data.longitude,
                    latitude: res.data.latitude,
                    coordinate: res.data.longitude + "," +res.data.latitude,
                    sceneId: res.data.industry,
                    sceneName: res.data.industryName,
                    logoImg: res.data.logo
                })
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //提交保存
    submitShop: function(data) {
        var submitData = data.detail.value;
        submitData.id = shopId;
        
        if(!submitData.shopName 
            || !submitData.province 
            || !submitData.address 
            // || !submitData.industry 
            // || submitData.logo 
            || !submitData.coordinate 
            // || !submitData.businessHours 
            || !submitData.deposit 
            || !submitData.freeTime 
            || !submitData.priceDayMax 
            || !submitData.tel){
                util.myShowToast(self.data.lg.formCheck);
                return;
            }
        
        if(submitData.agentId4 == 0){
            submitData.agentId4 = ""
        };
        if(submitData.agentId5 == 0){
            submitData.agentId5 = ""
        };
        console.log(JSON.stringify(submitData));
        request.post(api.updateShop,submitData).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.editSuccess)
            };
            setTimeout(function(){
                wx.navigateBack();
            },1500);
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //选择经纬度
    getLocation(){
        wx.chooseLocation({
            success: function(res) {
                console.info(JSON.stringify(res));
                self.setData({
                    longitude: res.longitude,
                    latitude: res.latitude,
                    coordinate: res.longitude+","+res.latitude
                });
            }
        })
    },
    // 选择上传图片 
    addImage: function (e) {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                console.log("图片："+JSON.stringify(res));
                var tempFilePaths = res.tempFilePaths[0];
                self.setData({
                    logoImg: tempFilePaths
                });
                wx.compressImage({
                    src: tempFilePaths, // 图片路径
                    quality: 80, // 压缩质量
                    success: result => {
                        console.log("压缩结果："+JSON.stringify(result));
                        self.uploadOneByOne(result.tempFilePath);                        
                    },
                    fail: err => {

                    }
                });
                // self.uploadOneByOne(tempFilePaths);
            }
        })
    },

    /**
   * 上传图片：递归的方式上传
   * url:上传地址
   * imgPaths：上传的图片列表
   * successUp：上传成功的个数，初始化为0
   * failUp：上传失败的个数，初始化为0
   * count：第几张
   * length：图片列表的长度
   */
    uploadOneByOne(imgPaths) {
        wx.uploadFile({
            url: api.upLoad,
            filePath: imgPaths,
            name: "file",
            header: {
                'Content-Type': 'multipart/form-data',
                'token': wx.getStorageSync('token'),
                'lang': 'zh_CN'
            },
            formData: {
                lang: wx.getStorageSync('language'),
                token: wx.getStorageSync('token')
            },
            success: res => {
                console.log("上传图片："+JSON.stringify(res));
                var imgData = JSON.parse(res.data);
                if(imgData.code == 1){
                    self.setData({
                        logoImg: imgData.data.url
                    });
                    util.myShowToast(self.data.lg.uploadSuccess);
                }else{
                    util.myShowToast(imgData.msg);
                }
            },
            fail: err => {
                console.log("上传图片err："+JSON.stringify(err));
            },
            complete: e => {
                
            }
        })
    },
    //获取区域选择三级联动
    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
          region: e.detail.value
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
        //选择业务或者店铺之后，返回参数
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1]; //当前页面
        var mydata = currPage.data.mydata;//为传过来的值
        console.log("返回的数据："+JSON.stringify(mydata));
        if(mydata){
            if(mydata.sceneId){
                self.setData({
                    sceneId: mydata.sceneId,
                    sceneName: mydata.sceneName
                })
                return;
            };
            if(mydata.groupId == 5){
                self.setData({
                    ywId: mydata.agentId,
                    ywTc: mydata.agentratio,
                    ywName: mydata.agentName
                })
            }else if(mydata.groupId == 6){
                self.setData({
                    dpId: mydata.agentId,
                    dpTc: mydata.agentratio,
                    dpName: mydata.agentName
                })
            }
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