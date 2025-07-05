Page({
  data: {
    url: ''
  },
  onLoad() {
    
  },
  onShow(){
    let res = my.getStorageSync({ key: 'webViewUrl' });
    if (res.data) {
      this.setData({
        'url': res.data
      })
    }
  }
});
