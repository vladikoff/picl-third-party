const { Cc, Ci, Cu } = require("chrome");
// dropbox js client library
const Dropbox = require('libs/dropbox');
const sc = require('components/sync-client');
const menu = require('menuitems');

function init() {
  var syncClient;
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
    syncClient = new sc.SyncClient(client);

    // check if authentication is stored
    if (client.isAuthenticated()) {
      // force sync right away
      //syncClient.syncContent();
      // poll for changes
      syncClient._poll();
    } else {
      // temporary auth here if needed
    }

    // Firefox For Android menu item
    let appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    if (appInfo.ID === '{aa3c5121-dab2-40e2-81ca-7ea25febc110}') {
      // native window for Firefox for Android
      let nw = require('components/nativewindow');
      var mobileMenu = nw.addMenu({
        label: client.isAuthenticated() ? SYNC_DISABLE : SYNC_ENABLE,
        callback: function () {
          openAuth(client, syncClient, mobileMenu);
        }
      });
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
  return syncClient;
}

exports.init = init;
