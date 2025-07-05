// components/refresh/refresh.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    description: { // 是否返回首页
      type: String,
      value: ''
    },
    btnTxt: { // 是否返回首页
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    refresh: function () {
      this.triggerEvent('refresh', {});
    }
  }
})
