const apiRootUrl = 'https://bluetooth.qzsinotec.com';//正式服
module.exports = {
  apiRootUrl: apiRootUrl, // 

  getSessionKey: apiRootUrl + '/cdb/app/user/login/getSessionKey', // 获取sessionKey

  getMobile: apiRootUrl + '/cdb/app/user/login/getMobile', // 获取手机号

  login: apiRootUrl + '/cdb/app/user/login/login', // 登录

  getUserInfo: apiRootUrl + '/cdb/app/user/getUserInfo', // 获取用户信息

  nearbyNoPager: apiRootUrl + '/cdb/app/shop/nearbyNoPager', // 获取附近商家-地图

  nearbyShop: apiRootUrl + '/cdb/app/shop/nearby', // 获取附近商家-分页

  borrowInfo: apiRootUrl + '/cdb/app/borrow/borrowInfo',  // 首页查询租借信息

  selectAdvertising: apiRootUrl + '/cdb/app/shop/selectAdvertising',  // 首页广告

  shopDetails: apiRootUrl + '/cdb/app/shop/details', //  获取店铺详情

  orderList: apiRootUrl + '/cdb/app/order/list', //  订单列表，租借记录

  orderDetail: apiRootUrl + '/cdb/app/order/detail', //  获取订单详情

  tranlist: apiRootUrl + '/cdb/app/order/tranlist', //  交易明细，消费

  consumption: apiRootUrl + '/cdb/app/order/consumption', //  用户消费详情

  recahargeDetail: apiRootUrl + '/cdb/app/order/recahargeDetail', // 充值详情

  rechargeList: apiRootUrl + '/cdb/app/order/recharge', //  交易明细，充值

  aboutUs: apiRootUrl + '/cdb/app/more/about', //  关于我们

  agreement: apiRootUrl + '/cdb/app/more/agreement', //  用户协议

  privacy: apiRootUrl + '/cdb/app/more/privacy', //  隐私协议

  faultSubmit: apiRootUrl + '/cdb/app/more/faultSubmit', //  故障问题提交

  upLoad: apiRootUrl + '/cdb/app/common/upLoad', //  文件上传

  problem: apiRootUrl + '/cdb/app/more/problem', //  常见问题

  countFeek: apiRootUrl + '/cdb/app/feedbackReply/countFeek', // 统计未查看

  feedbackList: apiRootUrl + '/cdb/app/feedbackReply/feedbackList', // 问题反馈列表

  feedbackReply: apiRootUrl + '/cdb/app/feedbackReply/feedbackReply', //  回复列表

  isLike: apiRootUrl + '/cdb/app/feedbackReply/isLike', // 点赞

  reply: apiRootUrl + '/cdb/app/feedbackReply/reply', // 新增回复

  borrowCheck: apiRootUrl + '/cdb/app/borrow/Check', //  租借前检查

  borrow: apiRootUrl + '/cdb/app/borrow/borrow', //  扫码租借

  checkWechatNum: apiRootUrl + '/cdb/app/borrow/checkWechatNum', // 微信支付分订单状态

  borrowFinish: apiRootUrl + '/cdb/app/borrow/borrowFinish', //  租借完成（1租借完成，0租界失败，2正在请求中）

  rechargeMoney: apiRootUrl + '/cdb/app/payment/rechargeMoney', //  充值金额列表

  recharge: apiRootUrl + '/cdb/app/payment/recharge', //  发起充值

  rechargeFinish: apiRootUrl + '/cdb/app/payment/rechargeFinish', //  充值完成

  withdraw: apiRootUrl + '/cdb/app/payment/withdraw', //  用户提现

  mmxBorrowCheck: apiRootUrl + '/mmx/app/borrow/Check', //  密码线租借前检查

  mmxBorrow: apiRootUrl + '/mmx/app/borrow/borrow', //  密码线扫码租借

  mmxBorrowFinish: apiRootUrl + '/mmx/app/borrow/borrowFinish', //  密码线租借完成

  mmxBorrowReport: apiRootUrl + '/mmx/app/borrow/borrowReport', //  密码线租借上报





  // 代理端接口
  appindex: apiRootUrl + '/cdb/agent/agentHomepage/appindex', // 代理首页数据

  agentDeviceList: apiRootUrl + '/cdb/agent/deviceModule/agentDeviceList', // 代理商设备列表

  deviceBindingAgent: apiRootUrl + '/cdb/agent/deviceModule/deviceBindingAgent', //设备绑定代理

  deviceRevokeAgent: apiRootUrl + '/cdb/agent/deviceModule/deviceRevokeAgent',//设备撤销代理

  deviceStateCount: apiRootUrl + '/cdb/agent/deviceModule/deviceStateCount',//代理商设备数量

  withdrawalAmount: apiRootUrl + '/cdb/agent/agentAgentWithdrawal/withdrawalAmount', // 代理商提现信息

  agentWithdrawalList: apiRootUrl + '/cdb/agent/agentAgentWithdrawal/agentWithdrawalList', //代理商提现记录

  agentWithdrawal: apiRootUrl + '/cdb/agent/agentAgentWithdrawal/agentWithdrawal', //代理商提现

  agentRebootDevice: apiRootUrl + '/cdb/agent/deviceModule/agentRebootDevice',// 重启设备

  agentBatteryList: apiRootUrl + '/cdb/agent/deviceModule/agentBatteryList',// 设备电池列表

  agentBatteryEject:apiRootUrl + '/cdb/agent/deviceModule/agentBatteryEject',//弹出充电宝

  agentDeviceDetails: apiRootUrl + '/cdb/agent/deviceModule/agentDeviceDetails',// 设备详情

  emptyShop: apiRootUrl + '/cdb/agent/deviceModule/emptyShop',// 设备详情，清空店铺绑定

  shopList: apiRootUrl + '/cdb/agent/shopModule/shopList',// 店铺列表

  shopCount: apiRootUrl + '/cdb/agent/shopModule/shopCount',// 店铺数量

  bindingShop: apiRootUrl + '/cdb/agent/deviceModule/bindingShop', //设备绑定店铺

  agentOrderList: apiRootUrl + '/cdb/agent/orderModule/orderList',// 订单列表

  orderStatusCount: apiRootUrl + '/cdb/agent/orderModule/orderStatusCount',// 订单数量

  orderDetails: apiRootUrl + '/cdb/agent/orderModule/orderDetails',// 订单详情

  levelLinkage: apiRootUrl + '/cdb/admin/region/levelLinkage',// 三级联动

  shopChoiceAgent: apiRootUrl + '/cdb/agent/shopModule/shopChoiceAgent',// 新增店铺选择业务员跟店铺管理员

  saveShop: apiRootUrl + '/cdb/agent/shopModule/saveShop',// 添加店铺

  shopDeviceList: apiRootUrl + '/cdb/agent/shopModule/shopDeviceList',// 店铺设备列表

  industryList: apiRootUrl + '/cdb/agent/shopModule/industryList',// 行业列表

  shopBindingDevice: apiRootUrl + '/cdb/agent/shopModule/shopBindingDevice',//店铺绑定设备

  agentShopDetails: apiRootUrl + '/cdb/agent/shopModule/shopDetails', //店铺详情

  updateShop: apiRootUrl + '/cdb/agent/shopModule/updateShop',// 编辑店铺

  agentLevel: apiRootUrl + '/cdb/agent/agentAdministration/agentLevel',// 代理商导航栏，级别

  agentList: apiRootUrl + '/cdb/agent/agentAdministration/agentList',// 代理商列表

  addAgent: apiRootUrl + '/cdb/agent/agentAdministration/addAgent',// 添加代理

  updateAgent: apiRootUrl + '/cdb/agent/agentAdministration/updateAgent', // 编辑代理

  agentUserList: apiRootUrl + '/cdb/agent/agentAdministration/userList',// 创建代理时选择的用户列表

  userDetails: apiRootUrl + '/cdb/agent/userManagement/userDetails', //用户详情

  userStatistics: apiRootUrl + '/cdb/agent/userManagement/userStatistics',//用户数量统计

  updateUser: apiRootUrl + '/cdb/agent/userManagement/updateUser',// 编辑用户

  removeAgent: apiRootUrl + '/cdb/agent/agentAdministration/removeAgent', // 删除代理

  agentDetails: apiRootUrl + '/cdb/agent/agentAdministration/agentDetails',// 代理商详情

  shareList: apiRootUrl + '/cdb/agent/agentHomepage/shareList', // 分成列表

  shareStatistics: apiRootUrl + '/cdb/agent/agentHomepage/shareStatistics',//分成金额统计

  shareDetails: apiRootUrl + '/cdb/agent/agentHomepage/shareDetails',// 分成详情

  agentStatistics: apiRootUrl + '/cdb/agent/agentHomepage/agentStatistics',//统计

  proportionScenes: apiRootUrl + '/cdb/agent/agentHomepage/proportionScenes',// 饼状图数据(场景比例)

  monthlyIncome: apiRootUrl + '/cdb/agent/agentHomepage/monthlyIncome',//柱状图数据（月份数据）

  saveLineShop: apiRootUrl + '/cdb/agent/shopLineModule/saveLineShop',// 添加密码线店铺

  xianMealTypeList: apiRootUrl + '/cdb/agent/shopLineModule/xianMealTypeList',// 套餐类型列表

  lineshopDetails: apiRootUrl + '/cdb/agent/shopLineModule/lineshopDetails',// 密码线店铺详情

  updateLineShop: apiRootUrl + '/cdb/agent/shopLineModule/updateLineShop',// 编辑密码线店铺

  agentBindDevice: apiRootUrl + '/cdb/agent/deviceModule/agentScanCodeDevice',  // 代理列表，绑定设备
}
