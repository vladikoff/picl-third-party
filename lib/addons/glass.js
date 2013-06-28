const { api } = require('libs/googleapis');
const L = require('components/logger');
const { makeRequest } = require('components/request');
const menu = require('menuitems');
const main = require('main');
const XMLHttpRequest = require("sdk/addon/window").window.XMLHttpRequest;

/**
 * Addon menu item
 */
menu.Menuitem({
  id: "syncThirdParty",
  menuid: "menu_ToolsPopup",
  label: 'PiCL Addon: Send to Glass',
  onCommand: function () {
    api.authenticate('https://www.googleapis.com/auth/glass.timeline', function (googleAuth) {
      main.storageClients.push( init(googleAuth) );
    });
  },
  insertbefore: "menu_pageInfo"
});


function init(client) {
// local addon sync client
  var syncClient = {
    client: client,

    pushType: function(type, data) {
      L.log('Glass', type, data);


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

      if (type === 'image' && data.name && data.name.length > 0) {
        card.html = '<article class="photo"><img src="' + data.name + '" width="100%" height="100%"><div class="photo-overlay"/></article>';
        card.text = data.name;
        card.speakableText = '';
      } else if (type === 'text' && data.name && data.name.length > 0) {
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
          L.log(xhr.statusText);
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
