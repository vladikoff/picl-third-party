const L = require('logger');
const menu = require('menuitems');
const SyncFrame = require('sync-frame');

const Dropbox = require('dropbox');


var client = new Dropbox.Client({
    key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
});

client.authDriver(new Dropbox.Drivers.FirefoxAddon({ rememberUser: true }));

client.authenticate({interactive: false}, function (error, client) {
    if (error) {
        console.log(error);
    }
    if (client.isAuthenticated()) {
        console.log('isAuthenticated');
        console.log(client.isAuthenticated());
    }
});



client.authenticate(function (error, client) {
    console.log('Trying to AUTH');

    if (error) {
        console.log(error);
        return;
    }

    client.getUserInfo(function (error, userInfo) {
        console.log("Hello, " + userInfo.name + "!");
    });


});

// new sync window
let frame = new SyncFrame();

// add a menu item to open the sync window
menu.Menuitem({
    id: "syncThirdParty",
    menuid: "menu_ToolsPopup",
    label: "Sync with Third Party",
    onCommand: frame.show,
    insertbefore: "menu_pageInfo"
});

const data = require("self").data;

//require('about').add({what: 'dropbox-oauth', url: require('self').data.url('receiver.html')});

//require('about').add({what: 'dropbox-oauth', url: 'data:text/html;charset=utf-8,' + require('self').data.load('receiver.html')});
