// miniprogram/pages/pay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serveUrl: 'https://it.frp.szego.net',
    localOrderId: '101381'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  },

  /**
   * 创建免押订单
   */
  create: function () {
    let _this = this;
    console.info("创建免押订单")
    _this.doGet("/api/create", function (res) {
      // debugger;
      // wx.navigateToMiniProgram({
      //   appId: 'wxd8f3793ea3b935b8',
      //   path: 'pages/use/enable',
      //   extraData: {
      //     mch_id: res.mch_id,
      //     package: res.package,
      //     timestamp: res.timestamp,
      //     nonce_str: res.nonce_str,
      //     sign_type: res.sign_type,
      //     sign: res.sign
      //   },
      //   success() {
      //     //dosomething
      //     console.info('租借成功')
      //   },
      //   fail() {
      //     //dosomething
      //     console.info('租借失败')
      //   },
      //   complete() {
      //     //dosomething
      //   }
      // });
      if (wx.openBusinessView) {
        wx.openBusinessView({
          businessType: 'wxpayScoreUse',
          extraData: {
            mch_id: res.mch_id,
            package: res.package,
            timestamp: res.timestamp,
            nonce_str: res.nonce_str,
            sign_type: res.sign_type,
            sign: res.sign
          },
          success() {
            _this.setData({
              localOrderId: res.outOrderNo
            })
            //dosomething
            console.info('租借成功,订单号=' + res.outOrderNo)
          },
          fail() {
            //dosomething
            console.info('租借失败')
          },
          complete() {
            //dosomething
          }
        });
      } else {
        //引导用户升级微信版本
      }

    })

  },

  /**
   * 查询订单
   */
  query: function () {
    let _this = this;
    _this.doGet("/api/query?localOrderId=" + _this.data.localOrderId, function (res) {
      wx.showModal({
        title: '测试',
        content: JSON.stringify(res),
      })
    })
  },


  /**
   * 取消订单
   */
  cancel: function () {
    let _this = this;
    _this.doGet("/api/cancel?localOrderId=" + _this.data.localOrderId, function (res) {
      console.info('取消成功')
    })
  },

  /**
   * 修改订单
   */
  change: function () {
    let _this = this;
    _this.doGet("/api/modify?localOrderId=" + _this.data.localOrderId + "&totalAmount=0.5", function (res) {
      console.info('修改订单')
    })
  },

  /**
   * 完结订单
   */
  complete: function () {
    let _this = this;
    _this.doGet("/api/complete?localOrderId=" + _this.data.localOrderId, function (res) {
      console.info('完结订单')
    })
  },

  /**
   * 支付分订单收款API
   */
  payOrder: function () {
    let _this = this;
    _this.doGet("/api/pay?localOrderId=" + _this.data.localOrderId, function (res) {
      console.info('完结订单')
    })
  },

  /**
   * 同步服务订单信息API
   */
  syncOrder: function () {
    let _this = this;
    _this.doGet("/api/sync?localOrderId=" + _this.data.localOrderId, function (res) {
      console.info('完结订单')
    })
  },

  doGet: function (url, success) {
    let _this = this;
    wx.request({
      url: _this.data.serveUrl + url,
      method: 'GET', //请求方式
      header: {
        'Content-Type': 'application/json',
      },
      success: function (res) {
        success && success(res.data);
      },
      fail: function () {
        console.info("doGet request fail")
      },
      complete: function () {
        // complete 
      }
    })
  },

  doPost: function (url, data, success) {
    let _this = this;
    wx.request({
      url: _this.data.serveUrl + url,
      method: 'POST', //请求方式
      header: {
        'Content-Type': "application/x-www-form-urlencoded",
      },
      data: data,
      success: function (res) {
        success && success(res.data);
      },
      fail: function () {
        console.info("do Post request fail")
      },
      complete: function () {
        // complete 
      }
    })
  }

})