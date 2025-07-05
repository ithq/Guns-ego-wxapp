if(!self.__appxInited) {
self.__appxInited = 1;


require('./config$');
require('./importScripts$');

var AFAppX = self.AFAppX;
self.getCurrentPages = AFAppX.getCurrentPages;
self.getApp = AFAppX.getApp;
self.Page = AFAppX.Page;
self.App = AFAppX.App;
self.my = AFAppX.bridge || AFAppX.abridge;
self.abridge = self.my;
self.Component = AFAppX.WorkerComponent || function(){};
self.$global = AFAppX.$global;


function success() {
require('../..//app');
require('../../pages/index/index');
require('../../pages/kp/kp');
require('../../pages/flwRcd/flwRcd');
require('../../pages/cntuAndFnsh/cntuAndFnsh');
require('../../pages/myMsg/myMsg');
require('../../pages/fnhRchg/fnhRchg');
require('../../pages/myOrds/myOrds');
require('../../pages/rdyToRchg/rdyToRchg');
require('../../pages/scnRslt/scnRslt');
require('../../pages/wthDrwPrgs/wthDrwPrgs');
require('../../pages/usrCt/usrCt');
require('../../pages/myWlt/myWlt');
require('../../pages/wthDrwl/wthDrwl');
require('../../pages/commentPro/commentPro');
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}