// components/show_modal/show_modal.js
Component({
  options: { 
    multipleSlots: true, 
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: { // 弹框标题
      type: String,
      value: '温馨提示',
    },
    btnText: { // 弹框按钮
      type: String,
      value: '',
    },
    btnBackground: { // 弹框按钮
      type: String,
      value: '#00C176',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    modalShow: function (e) { // 开启弹框
      this.setData({
        showModal: true
      })
    },

    modalColse: function (e) { // 关闭弹框
      this.setData({
        showModal: false
      })
    },

    modalConfirm: function () {
      this.triggerEvent('modalConfirm', {});
    }
  }
})
