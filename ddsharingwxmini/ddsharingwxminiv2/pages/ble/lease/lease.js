// pages/bluetooth/lease/lease.js

const app = getApp();
const util = require("../../../utils/util.js");
const language = require("../../../language/bluetooth/lease.js");  //语言包
const common = require("../../../language/common.js");

const request = app.globalData.request;  // 接口请求
const api =  app.globalData.api;

let qrcode = '';


var connectID;//用于链接蓝牙的ID
var servieID;//服务器返回的蓝牙ID
var serviceID;//蓝牙服务ID
var searchID;      //匹配成功的蓝牙编号
var characteristicId;//蓝牙特征值
var notycharacteristicsId = "";
var writecharacteristicsId = "";
var hasOrder = false;//判断用户是否有订单
var orderSn; //订单id
var command;//发送的指令
var gtTime,beginTime;//归还时间
var that;

var selectId,payType;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lg: util.getLanguage(language), 
    commonLg: util.getLanguage(common),
    back: true, 
    advertisement_2: {}, // 广告
    advertisement_3: {}, 
    lock: false, // true上锁 、false解锁 避免多次点击请求
    priceArray: [{
      id: 1, 
      timeLong: 1, 
      price: 1
    },{
      id: 2, 
      timeLong: 2, 
      price: 2
    },{
      id: 3, 
      timeLong: 3, 
      price: 3
    }],
    showAd: false      //是否显示广告
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.q) {
      var externalId = decodeURIComponent(options.q); // 解码
      externalId = externalId.split("/");
      qrcode = externalId[externalId.length - 1];
      var externalCode = {
        type: externalId[externalId.length - 3],
        qrcode: qrcode
      };
      wx.setStorageSync('externalCode', JSON.stringify(externalCode));

      this.borrowCheck(qrcode);
    }
    
    if (options.qrcode) {
      qrcode = options.qrcode;
      this.borrowCheck(qrcode);
    }
  },

  // 返回上一页
  goBack: function(e) {
    this.closeBluetooth();
    // util.goBack();
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  
  // 租借前检查/收费规则
  borrowCheck: function(qrcode) {
    request.post(api.mmxBorrowCheck,{
      qrcode: qrcode,
      type: 4       
    }).then((res) => {
      wx.removeStorageSync('externalCode');
      servieID = qrcode;//用于匹配设备
      this.setData({
        priceArray: res.data,
        showAd: true
      });
      // isBorrow 是否本人正在租借（0不是，1是）
      if (res.data.isBorrow == 1) {
        hasOrder = true;
        orderSn = res.data.orderId;
        command = res.data.pwd;
        gtTime = res.data.endTime;
        beginTime = res.data.borrowTime;
        that.openBluetooth();//先链接蓝牙
      };
    }).catch(err => {
      if(err.code == -1){
        wx.navigateTo({
          url: '../../login/login'
        })
      } else{ // 租借失败
        // this.jumpPage(0, err.msg);
      }
    });
  },

  // 选择时长
  chooseDuration: function(e) {
    wx.showLoading({
      title: '加载中...',
    })
    const {priceArray, lock} = this.data;
    if (lock) return false;

    let selectedData = e.currentTarget.dataset.data;
    let balance = priceArray.balance;

    let difference = parseFloat(balance - selectedData.price)
    // let payType = difference > 0 ? 9 : 0;
    payType = difference >= 0 ? 9 : 0;
    selectId = selectedData.id;

    that.openBluetooth();//先链接蓝牙

    // this.mmxBorrow(selectedData.id, payType).then(res => { // 发起租借
    //   wx.hideLoading();
    //   this.setData({
    //     lock: true
    //   })
    //   let leaseData = res.data;

    //   // 余额租借
    //   if (payType == 9) {
    //     this.borrowFinish(leaseData.orderId)// 租借完成
    //     return false;
    //   }

    //   // 支付租借
    //   this.doWxPay(leaseData.wechatPayResult).then(event => { // 微信支付
    //     wx.hideLoading();
    //     this.borrowFinish(leaseData.orderId)// 租借完成
    //   }).catch(error => {
    //     this.setData({
    //       lock: false
    //     })
    //     console.log(error)  // 用catch(e)来捕获错误{"errMsg":"requestPayment:fail cancel"}
    //   })
    // }).catch(err => {
    //   wx.hideLoading();
    //   this.setData({
    //     lock: false
    //   })
    // //   this.jumpPage(0, err.msg)
    // });
  },

  // 发起支付
  mmxBorrow: function(priceId, payType) {
    return request.post(api.mmxBorrow,{
      latitude: 22.60768,
      longitude: 113.85526,
      payType: payType, // 支付方式 0.微信支付 1.支付宝预授权 ，2.微信支付分，3.支付宝支付 9.余额支付
      priceId: priceId,
      qrcode: qrcode,
      type: 3 
    })
  },

  // 微信支付
	doWxPay: function(param) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({ //小程序发起微信支付
        timeStamp: param.timeStamp, //时间戳 timeStamp一定要是字符串类型的，不然会报错
        nonceStr: param.nonceStr, // 随机字符串，长度为32个字符以下
        package: param.packages,  // 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
        signType: param.signType, // 签名类型，默认为MD5，
        paySign: param.paySign, // 签名
        success: event => {
          resolve(event);
        },
        fail: error => {
          if (error.errMsg != "requestPayment:fail cancel") {
            request.showModal(error.errMsg);
          } 
          reject(error);
        }
      })
    })
  },

  // 租借完成
	borrowFinish: function(orderId) {
    wx.showLoading({
      title: '加载中...',
    })
    return request.post(api.mmxBorrowFinish + '?orderId=' + orderId ,{
      orderId: orderId
    }).then(res => {
      // wx.hideLoading();
      console.log("租借成功："+JSON.stringify(res));
      this.setData({
        lock: false
      });
  
      orderSn = orderId
      //租借成功，下发指令
      command = res.data.pwd;
      gtTime = res.data.endTime;
      beginTime = res.data.borrowTime;
      that.getService();
    }).catch(err => {
      wx.hideLoading();
      this.setData({
        lock: false
      })
    });
  },
  
  // 租借上报
  borrowReport: function(orderId, bleCmd, bleCmdResult){
    wx.showLoading({
      title: '加载中...',
    })
    return request.post(api.mmxBorrowReport ,{
      orderId: orderId,
      bleCmd: bleCmd,
      bleCmdResult: bleCmdResult
    }).then(res => {
      wx.hideLoading();
      this.setData({
        lock: false
      })
      if (res.data.isSuccess) {
        //指令解析成功，开始充电
        wx.redirectTo({
          url: '../leaseSuccess/leaseSuccess?ghtime=' + gtTime + "&beginTime=" + beginTime
        })
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({
        lock: false
      })
    });
  },
  

  /*********************************************************蓝牙模块开始************************************************************************/
  openBluetooth: function () {         //开启蓝牙适配
    wx.showLoading({
      title: '搜索蓝牙...',
      mask: true
    });
    wx.openBluetoothAdapter({
      success: res => {
        console.log("初始化蓝牙：" + JSON.stringify(res));
        if (res && res.errMsg == "openBluetoothAdapter:ok") {
          that.startBluetoothDiscovery();             //开始扫描设备+
        }
      },
      fail: err => {
        // console.log("开启蓝牙适配器失败：" + JSON.stringify(err));
        wx.hideLoading();
        wx.showModal({
          title: '温馨提示',
          content: '请检查蓝牙是否开启',
          showCancel: false,
          success: function () {
            wx.navigateBack({
            });
          }
        })
      }
    });
  },

  //开始搜索蓝牙设备
  startBluetoothDiscovery: function () {     //开始扫描设备
    wx.startBluetoothDevicesDiscovery({
      services: ['FFE0'],
      allowDuplicatesKey: false,
      success: function (res) {
        console.log("开始扫描："+JSON.stringify(res));
        // that.getDevice();
        wx.onBluetoothDeviceFound(function (res) {          //监听搜索到设备
          console.log("附近蓝牙设备:" + JSON.stringify(res));
          console.log("编号:" + servieID);
          if(res.devices[0].localName){//有些其他的设备没有localName,避免报错
            if (res.devices[0].localName.indexOf(servieID) != -1 || res.devices[0].localName.indexOf(servieID.substr(-8)) != -1) {
              // wx.hideLoading();
              that.stopBluetooth();//匹配成功，停止搜索
              connectID = res.devices[0].deviceId;
              wx.showLoading({
                title: '正在链接',
                mask: true
              });
              that.bluetoothConect();//开始链接
            } else {
              // console.log("不匹配");
            }
          }
        });
      },
    });
  },

  stopBluetooth() {                     //停止蓝牙搜索
    wx.stopBluetoothDevicesDiscovery({
      success: res => {
        console.log("停止搜索成功："+JSON.stringify(res));
      },
      fail: res => {
        console.log("停止搜索失败："+JSON.stringify(res));
      }
    })
  },


  //建立蓝牙连接
  bluetoothConect: function () {
    wx.createBLEConnection({
      deviceId: connectID,             // 充电宝里蓝牙的设备ID
      success: res => {
        wx.hideLoading();
        // console.log("创建连接成功：" + JSON.stringify(res));
        wx.showToast({
          title: '蓝牙链接成功',
        });
        // 设置蓝牙mtu，安卓才需要设置
        const sysInfo = wx.getSystemInfoSync()
        if(wx.canIUse('setBLEMTU') && sysInfo.platform == 'android'){
          wx.setBLEMTU({
            deviceId: connectID,
            mtu: 50,
            success:(res)=>{ },
            fail:(res)=>{ }
          });
        }
        if (hasOrder){
          that.getService();//有订单，直接发送指令
          return;
        };
        wx.showLoading({
          title: '付款中...',
          mask: true
        });
        that.mmxBorrow(selectId, payType).then(res => { // 发起租借
          wx.hideLoading();
          that.setData({
            lock: true
          })
          let leaseData = res.data;
    
          // 余额租借
          if (payType == 9) {
            that.borrowFinish(leaseData.orderId)// 租借完成
            return false;
          }
    
          // 支付租借
          that.doWxPay(leaseData.wechatPayResult).then(event => { // 微信支付
            wx.hideLoading();
            that.borrowFinish(leaseData.orderId)// 租借完成
          }).catch(error => {
            that.setData({
              lock: false
            })
            console.log(error)  // 用catch(e)来捕获错误{"errMsg":"requestPayment:fail cancel"}
            console.log("取消支付");
            that.breakConnect();//断开蓝牙链接
            that.closeBluetooth();
          })
        }).catch(err => {
          wx.hideLoading();
          that.setData({
            lock: false
          })
        //   this.jumpPage(0, err.msg)
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: '温馨提示',
          content: '蓝牙连接失败，请断开蓝牙线电源重新通电扫码',
          confirmText: "重新链接",
          success: function (res) {
            if(res.confirm){
              that.bluetoothConect();
            }
          }
        })
        return;
      }
    });
  },


  getService: function () {           // 蓝牙连接后， 获取设备的服务列表，每个蓝牙设备都有一些服务
    wx.showLoading({
      title: '租借中...'
    });
    wx.getBLEDeviceServices({
      deviceId: connectID,
      success: function (service) {
        console.log("蓝牙服务：" + JSON.stringify(service));
        var all_UUID = service.services;    //取出所有的服务
        /* 遍历服务数组 */
        for (var index = 0; index < all_UUID.length; index++) {
          var ergodic_UUID = all_UUID[index].uuid;    //取出服务里面的UUID
          var UUID_slice = ergodic_UUID.slice(4, 8);   //截取4到8位
          /* 判断是否是我们需要的FEE0 */
          if (UUID_slice == 'FFE0' || UUID_slice == 'ffe0') {
            serviceID = all_UUID[index].uuid;          //确定需要的服务UUID
          };
        };
        that.getCharacter();              //调用获取特征值函数
      }
    });
  },
  getCharacter: function () {             // 蓝牙连接成功后 并且已获取设备的服务列表 获取某个服务中的特征值（服务号id必填）
    //获取某个服务中的特征值（服务号id必填）
    wx.getBLEDeviceCharacteristics({
      deviceId: connectID,
      serviceId: serviceID,
      success: function (res) {
        console.log("特征值获取成功：" + JSON.stringify(res));
        var characteristics = res.characteristics;      //获取到所有特征值
        var characteristics_length = characteristics.length;    //获取到特征值数组的长度
        /* 遍历数组获取notycharacteristicsId（通知特征值的uuid）,获取characteristicsId（写入特征值的uuid）*/
        for (var index = 0; index < characteristics_length; index++) {
          var noty_characteristics_UUID = characteristics[index].uuid;    //取出特征值里面的UUID
          var characteristics_slice = noty_characteristics_UUID.slice(4, 8);   //截取4到8位
          /* 判断是否是我们需要的FEE1 */
          if (characteristics_slice == 'FFE1' || characteristics_slice == 'ffe1') {       //可写
            var index_uuid = index;
            writecharacteristicsId = characteristics[index_uuid].uuid;         //写入UUID
          }
          /* 判断是否是我们需要的FEE2 */
          if (characteristics_slice == 'FFE2' || characteristics_slice == 'ffe2') {       //可读
            var index_uuid = index;
            notycharacteristicsId = characteristics[index_uuid].uuid;         //写入UUID
            that.notycharacteristicsId();       //开启notify
          }
        };
      },
      fail: function (err) {
        wx.showModal({
          title: '温馨提示',
          content: '特征值获取失败，请重新扫码租借',
          showCancel: false,
          success: function () {
            app.globalData.myFlag = true;
            wx.navigateBack({

            });
          }
        })
      }
    })
  },
 
  notycharacteristicsId: function () {
    wx.notifyBLECharacteristicValueChange({             //启用低功耗蓝牙设备特征值变化时的 notify 功能
      deviceId: connectID,
      serviceId: serviceID,
      characteristicId: notycharacteristicsId,
      state: true,
      success: function (res) {
        //监听设备回复信息
        that.notycharacteristicsIdListen();
        that.send(command);//发送指令到蓝牙  ; 跳转页面倒计时；           
      },
      fail: function (res) {
          console.log("启用notify失败："+JSON.stringify(res));
        wx.showModal({
          title: '温馨提示',
          content: '接受数据失败，请重新扫码租借',
          showCancel: false,
          success: function () {
            app.globalData.myFlag = true;
          }
        })
      }
    })
  },

  //监听设备回复信息
  notycharacteristicsIdListen: function(){
    wx.onBLECharacteristicValueChange((characteristic) => {
      console.log("回调监听："+JSON.stringify(characteristic));
      //开始解析蓝牙返回数据
      var result = characteristic.value;
      var hex = that.ab2hex(result);
      if(hex == ""){
        return;
      }
      console.log(hex);
      
      //调用后台服务判断是否解析成功
      that.borrowReport(orderSn, command, hex)          
    })
  },


  send: function (pasd) {  // 处理指令发送数据 
    console.log("写入的指令1："+pasd);
    var buffer = this.hex2buf(pasd);
    that.write(buffer);
    
  },

  //写入数据
  write: function (buffer) {
    wx.writeBLECharacteristicValue({
      deviceId: connectID,
      serviceId: serviceID,
      characteristicId: writecharacteristicsId,//写入FFE1
      value: buffer,
      success: function (res) {
        console.log("写入结果：" + JSON.stringify(res));
        wx.readBLECharacteristicValue({
          deviceId: connectID,
          serviceId: serviceID,
          characteristicId: notycharacteristicsId,
        });

        if (res.errMsg == "writeBLECharacteristicValue:ok") {
          console.log("指令写入成功");
          that.breakConnect();//断开蓝牙链接
          setTimeout(function(){
            that.closeBluetooth(); 
          },300);  
        } else {
          wx.showModal({
            title: '系统提示',
            content: res.errMsg,
          });
        }
        
        
      },
      fail: function (err) {
        wx.showModal({
          title: '温馨提示',
          content: '蓝牙匹配失败，请重新扫码',
          showCancel: false,
          success: function () {

          }
        })
      }
    });
  },


  hex2as: function (f_hex) {
    var length_hex = [];
    var recve_value = "";
    var turn_back = "";
    var length_soy = f_hex.length / 2;
    var length = Math.round(length_soy);
    for (var i = 0; i < length; i++) {
      var hex_spalit = f_hex.slice(0, 2);
      length_hex.push(hex_spalit);
      f_hex = f_hex.substring(2);
    }
    for (var j = 0; j < length_hex.length; j++) {

      var integar = length_hex[j];    //十六进制
      recve_value = parseInt(integar, 16);    //十进制

      turn_back = turn_back + String.fromCharCode(recve_value);
    }
    return turn_back;
  },
  /**
* 16进制字符串转ArrayBuffer
*/
  hex2buf: function (hexStr) {
    var count = hexStr.length / 2;
    let buffer = new ArrayBuffer(count);
    let dataView = new DataView(buffer);

    for (var i = 0; i < count; i++) {
      var curCharCode = parseInt(hexStr.substr(i * 2, 2), 16);
      dataView.setUint8(i, curCharCode);
    }
    return buffer;
  },

  // 16进制转10进制
  ex16hex (value){
    var res = parseInt(value, 16);    //十进制
    return res;
  },
  

   // ArrayBuffer转16进制字符串示例
   ab2hex(buffer) {
    let hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },


  //断开蓝牙链接
  breakConnect: function () {
    console.log(connectID);
    wx.closeBLEConnection({
      deviceId: connectID,
      success(res) {
        console.log("断开蓝牙链接：" + JSON.stringify(res));
      },
      fail(res) {
        console.log("断开蓝牙链接失败：" + JSON.stringify(res));
      }
    })
  },
  //关闭蓝牙
  closeBluetooth: function () {
    wx.closeBluetoothAdapter({
      success (res) {
        console.log("关闭蓝牙服务："+JSON.stringify(res))
      }
    })
  },
  //关闭广告
  closeAd() {
    this.setData({
      showAd: false
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
    // this.breakConnect();//断开蓝牙链接
    // that.closeBluetooth(); 
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
    // this.stopBluetooth();
    this.breakConnect();//断开蓝牙链接
    setTimeout(function(){
      that.closeBluetooth(); 
    },300);    
    hasOrder = false;//判断用户是否有订单  
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