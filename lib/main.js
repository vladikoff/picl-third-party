// pretty logging
const L = require('logger');
// menuitems addon
const menu = require('menuitems');
// sync client control
const SyncClient = require('sync-client');
// dropbox js client library
const Dropbox = require('./libs/dropbox');
const GoogleDrive = require('drive');
// add-on data folder
const data = require("self").data;
// component module
const { Cc, Ci, Cu } = require("chrome");

// the Sync client that does all the content type work
let syncClient;
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
  syncClient = new SyncClient(client);

  // check if authentication is stored
  if (client.isAuthenticated()) {
    // force sync right away
    //syncClient.syncContent();
                    // poll for changes
    syncClient._poll();
  } else {
    // temporary auth here if needed
  }

  let appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
  if (appInfo.ID === '{aa3c5121-dab2-40e2-81ca-7ea25febc110}') {
    // native window for Firefox for Android
    let nw = require('./components/nativewindow');
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

var cm = require("sdk/context-menu");

cm.Item({
  label: "Save text to PiCL",
  context: cm.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
    '  var text = window.getSelection().toString();' +
    ' var loc = window.location.href;' +
    '  self.postMessage(text, loc);' +
    '});',
  onMessage: function (selection, location) {
    var data = {
      name: selection,
      type: 'text',
      visit: new Date().getTime(),
      location: location
    };

    syncClient.pushType('snippets', data);
  }
});


cm.Item({
  label: "Save image to PiCL",

  context: cm.SelectorContext("img"),
  contentScript: 'self.on("click", function (node) {' +
    ' var loc = window.location.href;' +
    '  self.postMessage(node.src, loc);' +
    '});',
  onMessage: function (src, location) {
    var data = {
      name: src,
      type: 'image',
      visit: new Date().getTime(),
      location: location
    };

    syncClient.pushType('snippets', data);
  }
});
