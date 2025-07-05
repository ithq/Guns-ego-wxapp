// 以下是业务服务器API地址
// 本机开发API地址
// var WxApiRoot = 'http://localhost:8080/ddsharing/1';
// 测试环境部署api地址
// var WxApiRoot = 'http://192.168.0.101:8070/wx/';
// 线上云平台api地址
var WxApiRoot = 'https://d.flypowersz.com/ddsharing/1';

module.exports = {
  UploadSignature: WxApiRoot + '/api/fileupload/params/get/mini', //图片上传,
  FaultReport: WxApiRoot + '/app/question/save/mini', //上报故障
  
  WxpayUrl: WxApiRoot + '/app/single/wxpay/package/wechatmini',  //微信支付
  OrderDetail: WxApiRoot + '/app/single/order/detail/mini', //订单详情

  SingleScan: WxApiRoot + '/app/single/scan/mini', //扫码
  SingleSelectPage : WxApiRoot + '/app/single/select/page/mini', // 订单跳转页面
  Login: WxApiRoot + '/app/login_by_weixin', //登录

  SingleDetail : WxApiRoot + '/app/single/detail/mini', // 设备订单详情
  WxpayPackage: WxApiRoot + '/app/single/wxpay/package/mini', // 订单详情
  OrderCheckPay: WxApiRoot + '/app/single/order/checkPay/mini', // 检查是否支付成功

  OrderClose: WxApiRoot + '/app/single/order/close/mini', // 订单结束

  UpdatePassWd: WxApiRoot + '/app/single/update/pw/mini', // 更新密码
  ReplacePassWd: WxApiRoot + '/app/question/replacePassWd/mini', // 更换密码
  ReplaceDevice: WxApiRoot + '/app/question/replaceDevice/mini', //更换设备

  OrderList: WxApiRoot + '/app/single/order/list/mini', //订单列表

};