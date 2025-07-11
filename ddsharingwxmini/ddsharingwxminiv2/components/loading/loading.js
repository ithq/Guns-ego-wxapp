// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLoading: { // 属性名  是否显示隐藏loading
      type: Boolean, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: true, // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    loadingTitle: { // loading文字
      type: String,
      value: '',
    },
    loadingImg: { // gif图
      type: String,
      value: '/components/images/loading.gif'
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

  }
})
