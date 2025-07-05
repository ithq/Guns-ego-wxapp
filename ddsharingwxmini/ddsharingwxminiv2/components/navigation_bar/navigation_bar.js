// components/navigation_bar/navigation_bar.js
/**
   * background 导航栏背景颜色 默认 rgba(255, 255, 255, 1) #fff 白色
   * color 标题颜色 默认 rgba(0, 0, 0, 1) #000 黑色
   * title 标题
   * searchText 搜索提示文字
   * searchBar 搜素框 默认 false
   * back 返回键 默认 false
   * home 首页icon 默认 false
   * iconTheme icon颜色 默认 black
   * delta 返回的页面数 默认 1 返回上一页
   * */ 
Component({
  options: { // 定义一些组件选项
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持，默认情况下，一个组件的wxml只可能有一个slot。需要使用多个时，可以在组件js中声明启用。
    addGlobalClass: true // 使组件接受全局样式。
  },

  /**
   * 组件的对外属性，属性设置中可包含三个字段,
   * type 表示属性类型、 
   * value 表示属性初始值、 
   * observer 表示属性值被更改时的响应函数。
   * */
  properties: {
    extClass: { // 类名 class name
      type: String,
      value: ''
    },
    background: { 
      type: String,
      value: 'rgba(255, 255, 255, 1)',
      observer: '_showChange'
    }, 
    navImg: {
      type: String,
      value: ''
    },
    backgroundImg: {  // 背景图
      type: String,
      value: '',
    },
    backgroundClass: {  // 类名 class name
      type: String,
      value: ''
    },
    color: {
      type: String,
      value: 'rgba(0, 0, 0, 1)'
    },
    title: {
      type: String,
      value: ''
    },
    leftTitle: {
      type: String,
      value: ''
    },
    searchText: {
      type: String,
      value: '点我搜索'
    },
    searchBar: {
      type: Boolean,
      value: false
    },
    back: { // 是否有返回键
      type: Boolean,
      value: false
    },
    home: { // 是否返回首页
      type: Boolean,
      value: false
    },
    iconTheme: {  // 图标
      type: String,
      value: 'black'
    },
    delta: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件生命周期函数-在组件实例刚刚被创建时执行，注意此时不能调用 setData
   * */
  created: function () {
    this.getSystemInfo();
  },

  /**
   * 组件生命周期函数-在组件实例进入页面节点树时执行)
   * */
  attached: function () {
    this.setStyle(); //设置样式
  },

  data: {
    imageWidth: wx.getSystemInfoSync().windowWidth, // 背景图片的高度
    imageHeight: '' // 背景图片的长度，通过计算获取
  },

  /**
   * 组件所在页面的生命周期
   * */
  pageLifetimes: { 
    show: function () { //组件所在的页面被展示时执行
      if (getApp().globalSystemInfo.ios) {
        this.getSystemInfo();
        this.setStyle(); //设置样式1
      }
    },
    hide: function () {}
  },

  /**
   * 组件的方法，包括事件响应函数和任意的自定义方法
   * */
  methods: { 
    setStyle: function (life) {

      // ES6语法写法 
      // getApp().globalSystemInfo 等同于 wx.getSystemInfoSync()
      const {
        statusBarHeight,    
        navBarHeight,      
        capsulePosition,    
        navBarExtendHeight,
        ios,                
        windowWidth         
      } = getApp().globalSystemInfo;

      const { back, home, title, backgroundImg} = this.data;
      let rightDistance = windowWidth - capsulePosition.right; //胶囊按钮右侧到屏幕右侧的边距
      let leftWidth = windowWidth - capsulePosition.left; //胶囊按钮左侧到屏幕右侧的边距

      let navigationbarinnerStyle = [ // 导航栏样式
        `color: ${this.data.color}`,
        `background: ${this.data.background}`,
        `height:${navBarHeight + navBarExtendHeight}px`,
        `padding-top:${statusBarHeight}px`,
        `padding-right:${leftWidth}px`,
        `padding-bottom:${navBarExtendHeight}px`
      ].join(';');


      let navBarLeft = []; // 导航栏左边样式
      let bgImg = '';

      if ((back && !home) || (!back && home)) {
        navBarLeft = [`width:40px`, `height:${capsulePosition.height}px`].join(';');

      } else if ((back && home) || title) {
        navBarLeft = [
          `width:${capsulePosition.width}px`,
          `height:${capsulePosition.height}px`,
          `margin-left:${rightDistance}px`
        ].join(';');
      } else {
        navBarLeft = [`width:auto`, `margin-left:0px`].join(';');
      }

      if (backgroundImg) {
        bgImg = `background-image: url(${backgroundImg});`
      }

      if (life === 'created') {
        this.data = {
          navigationbarinnerStyle,
          navBarLeft,
          navBarHeight,
          capsulePosition,
          navBarExtendHeight,
          ios,
          bgImg: bgImg
        };
      } else {
        this.setData({
          navigationbarinnerStyle,
          navBarLeft,
          navBarHeight,
          capsulePosition,
          navBarExtendHeight,
          ios,
          bgImg: bgImg
        });
      }
    },

    /**
     * 自定义组件触发事件时，需要使用 triggerEvent 方法，指定事件名、detail对象和事件选项
     * this.triggerEvent('customevent', {}, { bubbles: true, composed: true })
     * **/

    // 背景变化事件
    _showChange: function (value) { 
      this.setStyle();
    },

    // 返回事件
    back: function () {
      this.triggerEvent('back', { delta: this.data.delta });
    },
    home: function () {
      this.triggerEvent('home', {});
    },
    search: function () {
      this.triggerEvent('search', {});
    },
    // 计算图片高度
    imgLoaded(e) {
      this.setData({
        imageHeight:
          e.detail.height *
          (wx.getSystemInfoSync().windowWidth / e.detail.width)
      })
    },
    
    // 初始化
    getSystemInfo() {
      var app = getApp();
      if (app.globalSystemInfo && !app.globalSystemInfo.ios) {
        return app.globalSystemInfo;
      } else {
        let systemInfo = wx.getSystemInfoSync();
        let ios = !!(systemInfo.system.toLowerCase().search('ios') + 1);
        let rect;  // 胶囊位置信息

        // wx.getMenuButtonBoundingClientRect 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
        try {
          rect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
          if (rect === null) {
            throw 'getMenuButtonBoundingClientRect error';
          }
          //取值为0的情况  有可能width不为0 top为0的情况
          if (!rect.width || !rect.top || !rect.left || !rect.height) {
            throw 'getMenuButtonBoundingClientRect error';
          }
        } catch (error) {
          let gap = ''; // 胶囊按钮上下间距 使导航内容居中
          let width = 96; // 胶囊的宽度
          if (systemInfo.platform === 'android') {
            gap = 8;
            width = 96;
          } else if (systemInfo.platform === 'devtools') {
            if (ios) {
              gap = 5.5; //开发工具中ios手机
            } else {
              gap = 7.5; //开发工具中android和其他手机
            }
          } else {
            gap = 4;
            width = 88;
          }
          if (!systemInfo.statusBarHeight) {
            //开启wifi的情况下修复statusBarHeight 状态栏的高度 值获取不到
            systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
          }

          // 获取不到胶囊信息就自定义重置一个
          rect = {
            bottom: systemInfo.statusBarHeight + gap + 32,
            height: 32,
            left: systemInfo.windowWidth - width - 10,
            right: systemInfo.windowWidth - 10,
            top: systemInfo.statusBarHeight + gap,
            width: width
          };
        }

        let navBarHeight = '';
        if (!systemInfo.statusBarHeight) {
          systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20;
          navBarHeight = (function () {
            let gap = rect.top - systemInfo.statusBarHeight;
            return 2 * gap + rect.height;
          })();

          systemInfo.statusBarHeight = 0;
          systemInfo.navBarExtendHeight = 0; //下方扩展4像素高度 防止下方边距太小
        } else {
          navBarHeight = (function () {
            let gap = rect.top - systemInfo.statusBarHeight;
            return systemInfo.statusBarHeight + 2 * gap + rect.height;
          })();
          if (ios) {
            systemInfo.navBarExtendHeight = 4; //下方扩展4像素高度 防止下方边距太小
          } else {
            systemInfo.navBarExtendHeight = 0;
          }
        }
        
        /**
         * 导航栏高度不包括statusBarHeight
         * 右上角胶囊按钮信息bottom: 58 height: 32 left: 317 right: 404 top: 26 width: 87 
         * 目前发现在大多机型都是固定值 为防止不一样所以会使用动态值来计算nav元素大小
        */
        systemInfo.navBarHeight = navBarHeight;
        systemInfo.capsulePosition = rect; 
        systemInfo.ios = ios; //是否ios

        app.globalSystemInfo = systemInfo; //将信息保存到全局变量中,后边再用就不用重新异步获取了

        return systemInfo;
      }
    }
  }
});
