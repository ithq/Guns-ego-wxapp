// pages/agent/statistics/statistics.js
const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/agent/statistics.js"); //语言包
const common = require("../../../language/common.js");
import * as echarts from '../../../components/ec-canvas/echarts.min';
const request = app.globalData.request; // 接口请求
const api = app.globalData.api;
var self;
var barX = [];
var barArr = [];
var pieArr = [];

var beginTime,endTime,type;
var colorArr = ["#8385FC", "#4BB9EC", "#00C176", "#EB5A57", "#F08B57", "#FEC142", "#FEC142"];//饼状图颜色
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lg: util.getLanguage(language),
        common: util.getLanguage(common),
        imgUrl: app.globalData.imgUrlAgent,
        headerBg: "statistics/headBg3.png",
        downArrow: "statistics/downArrow.png",
        balanceInfo: {},
        pie_ec: {},
        bar_ec: {},
        beginDate: "",
        endDate: "",
        showPie:{},
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
        var timestamp = Date.parse(new Date());
        var date = new Date(timestamp);
        //获取年份  
        var Y =date.getFullYear();
        //获取月份  
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        beginTime = Y + "-" + M;
        endTime = Y + "-" + M;
        type = wx.getStorageSync('productType');            
        this.setData({
            endDate: Y + "年" + M + "月",
            type: type
        });
        this.getData();
        this.getPieData();
        this.getBarData()
    },
    //获取数值数据
    getData(){
        //agentStatistics
        console.log(beginTime,endTime);
        request.post(api.agentStatistics,{            
            startTime: beginTime,
            endTime: endTime,
            type: type
        }).then(res => {
            console.log("数据："+JSON.stringify(res));
            var startT = res.data.startTime.split("-");
            beginTime  = startT[0] + "-" + startT[1];
            if(self.data.beginDate == ""){
                //第一次进入，开始时间为空
                self.setData({
                    beginDate: startT[0] + "年" + startT[1] + "月"
                })
            };
            self.setData({
                balanceInfo: res.data
            })
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取饼图数据
    getPieData(){
        request.post(api.proportionScenes+"?type="+type).then(res => {
            console.log("场景数据："+JSON.stringify(res));
            if(res.code == 1){
                pieArr = [];
                for(var i=0;i < res.data.length;i++){
                    res.data[i].color = colorArr[i];
                    pieArr.push({
                        value: res.data[i].proportion,
                        name: res.data[i].industryName
                    });
                }
                self.setData({
                    showPie: res.data,
                    pie_ec: {
                        onInit: initPieChart       //环形饼图
                    }
                })
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    //获取柱状图数据
    getBarData(){
        request.post(api.monthlyIncome+"?type="+type).then(res => {
            console.log("月份数据："+JSON.stringify(res));
            if(res.code == 1){
                barX = [];
                barArr = [];
                res.data.map(item => {
                    console.log(JSON.stringify(item));
                    barX.push(item.month);
                    barArr.push(item.monthMoney);
                });
                self.setData({
                    bar_ec: {
                        onInit: initBarChart        //柱状图
                    },
                });
            }
        }).catch(err => {
            wx.showModal({
                content: JSON.stringify(err)
            });
        })
    },
    // 返回上一页
    goBack: function(e) {
        util.goBack();
    },
    //月份选择器
    bindDateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        var str = e.detail.value;
        beginTime = e.detail.value;
        str = str.replace("-","年");
        str = str + "月";
        this.setData({
            beginDate: str
        });
        this.getData();
    },
    bindDateChange2: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        var str = e.detail.value;
        endTime = e.detail.value;
        str = str.replace("-","年");
        str = str + "月";
        this.setData({
            endDate: str
        });
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
});
// 初始化环形饼图
function initPieChart(canvas, width, height, dpr) {
    const pieChart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr // new
    });
    canvas.setChart(pieChart);
  
    var option = {
        backgroundColor: "#ffffff",
        color: ["#8385FC", "#4BB9EC", "#00C176", "#EB5A57", "#F08B57", "#FEC142", "#FEC142"],
        legend: {
            show: false,
            orient: 'vertical',
            right: 5,
            data: ['KTV', '餐饮', '医院', '旅馆', '健身房', '其他']
        },
        // tooltip: {
        //     trigger: 'item',
        //     formatter: '{a} <br/>{b}: {c} ({d}%)'
        // },
        series: [{
            type: 'pie',
            avoidLabelOverlap: false,
            label: {
                show: false,
                position: 'left'
            },
            labelLine: {
                show: false
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: '11',
                    fontWeight: '400'
                }
            },
            center: ['40%', '51%'],//中心点坐标
            radius: ['30', '50'],// 内圈半径，外圈半径，px
            data: pieArr
        }]
    };
  
    pieChart.setOption(option);
    return pieChart;
};

//柱状图
function initBarChart(canvas, width, height, dpr) {
    var barChart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
    });
    canvas.setChart(barChart);

    var option = {
        color: ['#b2ecd5'],
        tooltip: {
            show:true,                  //是否显示提示框,默认为true
            trigger:'item',             //数据项图形触发
            axisPointer:{               //坐标轴指示器，坐标轴触发有效
                type:'shadow',          //默认为直线，可选为：'line' | 'shadow'
                axis:'auto',   
            },
            padding:5,
            textStyle:{                 //提示框内容样式
                color:"#fff",          
            }
        },
        legend: {
            show: false
        },
        grid: {
            left: -20,
            right: 10,
            bottom: 15,
            top: 30,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: barX,
            axisLine: {
                lineStyle: {
                    color: '#b2ecd5'        //x轴坐标线颜色
                }
            },
            axisLabel: {
                color: '#999'        //文字颜色
            }
        },
        yAxis: [{
            show: false
        }],
        series: [{
            data: barArr,
            type: 'bar',
            name: '收益(￥)',
            barWidth: '20',
            
            label:{                     //---图形上的文本标签
                show:true,
                normal: {
                    formatter: "￥"+"{c}",
                    show: true,
                    position: 'outside',
                    color:'#999'
                }
            },
            itemStyle: {
                emphasis: {
                    color: '#00C176'
                }
            }
        }]
    };

    barChart.setOption(option);
    return barChart;
};