// components/toast/toast.js
  /**
   * 使用方法
  showToast:function(){
    this.toast.showToast({
      type: 'success',
      txt: '测试弹出消息',
      duration: 1000,
      compelete: function () {
        console.log('toast框隐藏之后，会调用该函数')
        //例如：跳转页面wx.navigateTo({ url: 'xxx' });
      }
    })
  },
   */

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,
    type: '',
    txt: '',
    animationData: '',
    success: 'http://app.zhengdejishu.com/client/miniprogramicon/prompt/icon_success3.png',
    failure: 'http://app.zhengdejishu.com/client/miniprogramicon/prompt/icon_fail3.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showToast: function (data) {
      const self = this;
      if (this._showTimer) {
        clearTimeout(this._showTimer)
      }
      if (this._animationTimer) {
        clearTimeout(this._animationTimer)
      }
      // 显示toast，定义动画
      // display需要先设置为block之后，才能执行动画
      this.setData({
        isShow: true,
        type: data.type,
        txt: data.txt,
      });
      this._animationTimer = setTimeout(() => {
        const animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease',
          delay: 0
        })
        animation.opacity(1).step();
        self.setData({
          animationData: animation.export(),
        })
      }, 50)
      
      // 延时消失
      this._showTimer = setTimeout(function () {
        self.hideToast();
        if (data.compelete && (typeof data.compelete === 'function')) {
          data.compelete()
        }
      }, 1200 || (50 + data.duration))
    },

    hideToast: function () {
      if (this._hideTimer) {
        clearTimeout(this._hideTimer)
      }
      let animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease',
        delay: 0
      })
      animation.opacity(0).step();
      this.setData({
        animationData: animation.export(),
      })
      this._hideTimer = setTimeout(() => {
        this.setData({
          isShow: false,
          type: '',
          txt: '',
        })
      }, 250)
    }
  }
})
