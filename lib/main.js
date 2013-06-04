const L = require('logger');
// menuitems addon
const menu = require('menuitems');
// sync client control
const SyncClient = require('sync-client');
// dropbox js client library
const Dropbox = require('dropbox');
// add-on data folder
const data = require("self").data;

// UI Constants
const SYNC_ENABLE = "Sync with Dropbox";
const SYNC_DISABLE = "Disable Dropbox Sync";


// init dropbox client
let client = new Dropbox.Client({
    key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
});

// set to use the Firefox add-on driver
client.authDriver(new Dropbox.Drivers.Firefox({ rememberUser: true }));

// authenticate with dropbox with no interactive features
// this just checks is the tokens are valid and does NOT trigger a pop-up
client.authenticate({interactive: false }, function (error, client) {

    // new sync window
    let syncClient = new SyncClient(client);


    if (client.isAuthenticated()) {
        syncClient.syncTabs();
        syncClient._poll();
    }

    // add a menu item to connect or disconnect from dropbox
    var dropboxSync = menu.Menuitem({
        id: "syncThirdParty",
        menuid: "menu_ToolsPopup",
        label: client.isAuthenticated() ? SYNC_DISABLE : SYNC_ENABLE,
        onCommand: function () {
            // if connected, user clicks to disconnect
            if (client.isAuthenticated()) {
                client.signOut();
                dropboxSync.label = SYNC_ENABLE;
            }
            // else we want to connect
            else {
                client.authenticate(function (error, client) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    dropboxSync.label = SYNC_DISABLE;
                    syncClient.syncTabs();
                    syncClient._poll();
                    client.getUserInfo(function (error, userInfo) {
                        console.log("Hello, " + userInfo.name + "!");
                    });
                });
            }
        },
        insertbefore: "menu_pageInfo"
    });
});
