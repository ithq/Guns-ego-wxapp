// pages/agent/batteryList/batteryList.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/batteryList.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;
var self,
    deviceId;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        listData:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        self = this;
        wx.setNavigationBarTitle({
            title: self.data.lg.pageTitle
        });
        deviceId = options.id;
        this.getData();
    },
    //获取电池列表
    getData(){
        //agentBatteryList
        request.post(api.agentBatteryList + "?deviceId="+deviceId).then((res) => {
            if(res.code == 1){
                res.data.sort(self.compare("bayonetInt"));//排序
                self.setData({
                    listData: res.data
                });
                //循环绘制充电宝电量图
                for(let i=0;i<res.data.length;i++){
                    this.drawGrayWay(i);
                    if(res.data[i].capacity){//有充电宝，描绿边
                        this.drawGreenWay(i,2*res.data[i].capacity);
                    }
                }
            };
            wx.stopPullDownRefresh();
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //对象数组按属性排序
    compare(key){
        return function(i,j){
            var m=i[key];
            var n=j[key];
            return m-n;
        }
    },
    //弹出充电宝触发
    popupConfirm(e){
        var popupType = e.target.dataset.type;  //1：弹出所有 2：弹出单个
        if(popupType == 2){
            var bayonet = e.target.dataset.bayonet;
        }else{
            var bayonet = "";
        }
        wx.showModal({
            title: self.data.common.tips,
            content: self.data.lg.isPopup,
            success (res) {
                if (res.confirm) {
                    self.popup(popupType,bayonet);
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    //弹出充电宝单个
    popup(status,bayonet){
        console.log(bayonet,deviceId,status);
        request.post(api.agentBatteryEject,{
            bayonetint: bayonet,
            deviceId: deviceId,
            popupStatus: status  //1：弹出所有 2：弹出单个
        }).then((res) => {
            if(res.code == 1){
                util.myShowToast(self.data.lg.popupSuccess);
                setTimeout(function(){
                    self.getData();
                },2000);
            }else{
                wx.showModal({
                    content: JSON.stringify(res.msg)
                });
            }
        }).catch((err) => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //电量圈
    drawGrayWay: function(index){    // 使用 wx.createContext 获取绘图上下文 context
        var ctx = wx.createCanvasContext('canvasElectricQuantityBg'+index,this);
        ctx.setLineWidth(8);// 设置圆环的宽度
        ctx.setStrokeStyle('#F2F2F2'); // 设置圆环的颜色
        ctx.setLineCap('round') // 设置圆环端点的形状
        ctx.beginPath();//开始一个新的路径
        ctx.arc(38, 38, 31, 0, 2 * Math.PI, false); //设置一个原点(36,36)，半径为31的圆的路径到当前路径；均为px
        ctx.stroke();//对当前路径进行描边
        ctx.draw();
    },
    drawGreenWay: function (index,step){  
        var context = wx.createCanvasContext('canvasElectricQuantity'+index,this);
        // 设置渐变
        var gradient = context.createLinearGradient(200, 100, 100, 200);
        gradient.addColorStop("0", "#00C176");
        gradient.addColorStop("0.5", "#00C176");
        gradient.addColorStop("1.0", "#00C176"); 
        context.setLineWidth(10);
        context.setStrokeStyle(gradient);
        context.setLineCap('round')
        context.beginPath(); 
        // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
        context.arc(38, 38, 31, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
        context.stroke(); 
        context.draw() 
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
        this.getData();
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