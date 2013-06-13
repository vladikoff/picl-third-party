const L = require('logger');
// menuitems addon
const menu = require('menuitems');
// sync client control
const SyncClient = require('sync-client');
// dropbox js client library
const Dropbox = require('dropbox');
// add-on data folder
const data = require("self").data;
// snippet saving

// UI Constants
const SYNC_ENABLE = "Sync with Third Party";
const SYNC_DISABLE = "Disable Dropbox Sync";

let syncClient;

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
    syncClient = new SyncClient(client);

    if (client.isAuthenticated()) {
        syncClient.syncContent();
        syncClient._poll();
    } else {
        // temporary auth
        openAuth(client, syncClient);
    }

    // add a menu item to connect or disconnect from dropbox
    var dropboxSync = menu.Menuitem({
        id: "syncThirdParty",
        menuid: "menu_ToolsPopup",
        label: client.isAuthenticated() ? SYNC_DISABLE : SYNC_ENABLE,
        onCommand: function () {
            openAuth(client, syncClient, dropboxSync);
        },
        insertbefore: "menu_pageInfo"
    });
});

function openAuth(client, syncClient, menuItem) {
    // if connected, user clicks to disconnect
    if (client.isAuthenticated()) {
        client.signOut();
        if (menuItem) {
            menuItem.label = SYNC_ENABLE;
        }
    }
    // else we want to connect
    else {
        client.authenticate(function (error, client) {
            if (error) {
                console.log(error);
                return;
            }
            if (menuItem) {
                menuItem.label = SYNC_DISABLE;
            }
            syncClient.syncContent();
            syncClient._poll();
            client.getUserInfo(function (error, userInfo) {
                console.log("Hello, " + userInfo.name + "!");
            });
        });
    }
}

var cm = require("sdk/context-menu");
cm.Item({
  label: "Save text to PiCL",
  context: cm.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
    '  var text = window.getSelection().toString();' +
    '  self.postMessage(text);' +
    '});',
  onMessage: function (selection) {
    var data = {
      name: selection,
      visit: new Date().getTime()
    };

    syncClient.pushType('snippets', data);
  }
});
