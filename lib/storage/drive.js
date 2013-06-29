const L = require('components/logger');
const menu = require('menuitems');
const main = require('main');
const { api } = require('libs/googleapis');

const { OAuth2 } = require('libs/oauth2');
const sc = require('components/sync-client');


function init () {
  var syncClient = null;

  var api_access = {
    adapter: 'googledrive',
    client_id: '883869750843.apps.googleusercontent.com',
    client_secret: 'N-etUQGp6MB0ng_NQe4WIG6O',
    api_scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install'
  };

  var googleAuth = new OAuth2(api_access.adapter, api_access);


  let client = {
    name: 'drive',
    readFile: function (filename, callback) {
      console.log('readFile');
    },
    writeFile: function (filename, data, callback) {
      console.log('writeFile');
    }
  };

  console.log('checking auth');
  googleAuth.authorize({interactive: false} ,function() {
    console.log('wheres the callback?');
    // create new sync client
    syncClient = new sc.SyncClient(client);

    L.log('Token:');
    L.log(googleAuth.getAccessToken());
    // if authenticated then all ready to poll
    if(googleAuth.getAccessToken()) {
      syncClient._poll();
    }

    var driveSync = menu.Menuitem({
      id: "syncGoogleDrive",
      menuid: "menu_ToolsPopup",
      label: "Sync with Google Drive",
      onCommand: function () {
        startAuth();
      },
      insertbefore: "menu_pageInfo"
    });

  });

  function startAuth() {
    googleAuth.authorize(api_access, function () {
      if (googleAuth.getAccessToken()) {
        console.log('syncClient._poll();');
        syncClient._poll();
      }
    });
  }

  return syncClient;
}

exports.init = init;