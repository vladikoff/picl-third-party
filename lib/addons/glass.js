const L = require('components/logger');
const { makeRequest } = require('components/request');
const menu = require('menuitems');
const main = require('main');
const XMLHttpRequest = require("sdk/addon/window").window.XMLHttpRequest;

const { OAuth2 } = require('libs/oauth2');

const SYNC_ENABLE = "PiCL Addon: Send to Glass";
const SYNC_DISABLE = "PiCL Addon: Disable Send To Glass";


/**
 * Addon menu item
 */
var glassMenu = menu.Menuitem({
  id: "syncThirdParty",
  menuid: "menu_ToolsPopup",
  label: SYNC_ENABLE,
  onCommand: function () {
    var api_access = {
      adapter: 'googleglass',
      client_id: '883869750843.apps.googleusercontent.com',
      client_secret: 'N-etUQGp6MB0ng_NQe4WIG6O',
      api_scope: 'https://www.googleapis.com/auth/glass.timeline'
    };

    var googleAuth = new OAuth2(api_access.adapter, api_access);


    googleAuth.authorize(api_access, function (googleAuth) {
      glassMenu.label = SYNC_DISABLE;
      main.storageClients.push( init(googleAuth) );
    });
  },
  insertbefore: "menu_pageInfo"
});


function init(client) {
// local addon sync client
  var syncClient = {
    name: 'glass',
    client: client,

    pushType: function(type, data) {

      var card = {
        menuItems: [
          {
            action: "READ_ALOUD"
          },
          {
            action: "SHARE"
          },
          {
            action: "TOGGLE_PINNED"
          },
          {
            action: "DELETE"
          }
        ],
        notification: {
          level: "DEFAULT"
        }
      };

      if (data.type === 'image' && data.name && data.name.length > 0) {
        card.html = '<article class="photo"><img src="' + data.name + '" width="100%" height="100%"><div class="photo-overlay"/></article>';
        card.text = data.name;
        card.speakableText = '';
      } else if (data.type === 'text' && data.name && data.name.length > 0) {
        card.text = data.name;
      } else {
        card.text = 'Hello from PiCL!';
      }

      // Make an XHR that creates the task
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function (event) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            // good
          } else {
            // bad
          }

          //L.log(xhr.response);
        }
      };

      xhr.open('POST', 'https://www.googleapis.com/mirror/v1/timeline', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'OAuth ' + this.client.getAccessToken());
      xhr.send(JSON.stringify(card));

    }
  };


  return syncClient;
}
