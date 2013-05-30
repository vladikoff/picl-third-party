const L = require('logger');
const menu = require('menuitems');
const SyncFrame = require('sync-frame');

const Dropbox = require('dropbox');

var client = new Dropbox.Client({
    key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
});

client.authDriver(new Dropbox.Drivers.Firefox({ rememberUser: true }));

// new sync window
let frame = new SyncFrame();

// add a menu item to open the sync window
menu.Menuitem({
    id: "syncThirdParty",
    menuid: "menu_ToolsPopup",
    label: "Sync with Dropbox",
    onCommand: function () {

        client.authenticate(function (error, client) {
            console.log('Trying to AUTH');

            if (error) {
                console.log(error);
                return;
            }


            client.getUserInfo(function (error, userInfo) {
                console.log("Hello, " + userInfo.name + "!");
            });

            client.readdir("/", function (error, files) {
                var myFiles = "";
                files.forEach(function (file) {
                    console.log(file);
                    myFiles += file + "<br/>";
                });

                var panel = require("sdk/panel").Panel({
                    width: 280,
                    height: 280,
                    contentURL: "data:text/html;charset=utf-8," + myFiles
                });

                panel.show();
            });
        });
    },
    insertbefore: "menu_pageInfo"
});

const data = require("self").data;
