// /page/commentPro/commentPro
const app = getApp()
Page({
  data: {
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    app.homeBtnOnBind(this);
  }
})