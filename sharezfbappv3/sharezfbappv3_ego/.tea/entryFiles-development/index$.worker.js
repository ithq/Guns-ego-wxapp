if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');


  var AFAppX = self.AFAppX.getAppContext
    ? self.AFAppX.getAppContext().AFAppX
    : self.AFAppX;
  self.getCurrentPages = AFAppX.getCurrentPages;
  self.getApp = AFAppX.getApp;
  self.Page = AFAppX.Page;
  self.App = AFAppX.App;
  self.my = AFAppX.bridge || AFAppX.abridge;
  self.abridge = self.my;
  self.Component = AFAppX.WorkerComponent || function(){};
  self.$global = AFAppX.$global;
  self.requirePlugin = AFAppX.requirePlugin;
          

if(AFAppX.registerApp) {
  AFAppX.registerApp({
    appJSON: appXAppJson,
  });
}



function success() {
require('../../app');
require('../../pages/index/index?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/kp/kp?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/flwRcd/flwRcd?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/cntuAndFnsh/cntuAndFnsh?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/myMsg/myMsg?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/fnhRchg/fnhRchg?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/myOrds/myOrds?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/rdyToRchg/rdyToRchg?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/scnRslt/scnRslt?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/wthDrwPrgs/wthDrwPrgs?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/usrCt/usrCt?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/myWlt/myWlt?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/wthDrwl/wthDrwl?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/commentPro/commentPro?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/webView/webView?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/faultOption/faultOption?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/faultReport/faultReport?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/rdyToBleRchg/rdyToBleRchg?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
require('../../pages/bleConnect/bleConnect?hash=32d7d2807ed4e666ef03b4b3fe8c38ecf2e34e68');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}