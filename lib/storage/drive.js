const L = require('components/logger');
const menu = require('menuitems');
const main = require('main');
const { api } = require('libs/googleapis');

const { OAuth2 } = require('libs/oauth2');
const sc = require('components/sync-client');

var XMLHttpRequest = require("sdk/addon/window").window.XMLHttpRequest;


function req(opts, callback) {
  var opts = (opts) ? opts : {};

  var url = opts.url ? opts.url : 'https://www.googleapis.com/drive/v2/files';
  var method = opts.method ? opts.method : 'GET';

  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  };

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function (event) {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        callback(null, xhr.response);
      } else if (xhr.status == 404) {
        callback('File Not Found', xhr.response);
      } else {
        callback('Unknown Error', xhr.response);
      }
    }
  };

  var query = opts.query ? serialize(opts.query) : '';
  xhr.open(method, url + '?' + query, true);
  if (opts.multiPart) {
    xhr.setRequestHeader("Content-Type",  'multipart/related; boundary="END_OF_PART"');
  } else {
    xhr.setRequestHeader('Content-Type', 'application/json');
  }

  if (opts.auth) {
    xhr.setRequestHeader('Authorization', 'OAuth ' + opts.auth);
  }
  xhr.send();
}

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
    _that: this,
    name: 'drive',
    prepareFile: function(filename, callback) {
      var fileIdReq = {
        query: {
          q: "title = '" + filename + "' and " + "trashed = false",
          maxResults: 1
        },
        auth: googleAuth.getAccessToken()
      };

      var getFileReq = {
        auth: googleAuth.getAccessToken()
      };

      // request to get the file by name
      req(fileIdReq, function(error, response) {
        var r = JSON.parse(response);
        var file = r.items[0];

        if (!error) {
          getFileReq.url = file.downloadUrl;
          L.log(r.items[0]);
          // request to download the file using the downloadUrl
          req(getFileReq, function(error, response) {
            callback(error, file.id, file.response);
          });
        } else {
          createFile(filename, function() {

          });
          L.log(error);
        }
      });
    },

    readFile: function (filename, callback) {
      console.log('readFile');
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function (event) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            callback(null, xhr.response);
          } else if (xhr.status == 404) {
            callback('File Not Found', xhr.response);
          } else {
            // bad
            callback('Unknown Error', xhr.response);
          }

          L.log(xhr.status);
          L.log(xhr.responseText);
          L.log('....');
          L.log(xhr.response);
        }
      };
      xhr.open('GET', 'https://www.googleapis.com/drive/v2/files/' + filename, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'OAuth ' + googleAuth.getAccessToken());
      xhr.send();
    },
    createFile: function(filename, callback) {
      var fileIdReq = {
        method: 'POST',
        data: JSON.stringify({
          mimeType: 'application/json',
          title: filename,
          newRevision: false
        }),
        auth: googleAuth.getAccessToken()
      };

      req(fileIdReq, callback);
    },
    writeFile: function (filename, data, callback) {
      var sendData = [
        //mimePart("END_OF_PART", "application/json", data),
        mimePart("END_OF_PART", "application/json", data),
        "\r\n--END_OF_PART--\r\n"
      ].join('');

      console.log('Sending to :', 'https://www.googleapis.com/upload/drive/v2/files/' + filename + '?uploadType=multipart');

      var fileIdReq = {
        method: 'PUT',
        url: 'https://www.googleapis.com/upload/drive/v2/files/' + filename + '?uploadType=multipart',
        auth: googleAuth.getAccessToken(),
        send: sendData,
        multiPart: true
      };

      console.log('trying to write a file...');
      req(fileIdReq, callback);

      function mimePart(boundary, mimeType, content) {
        return [
          "\r\n--", boundary, "\r\n",
          "Content-Type: ", mimeType, "\r\n",
          "Content-Length: ", content.length, "\r\n",
          "\r\n",
          content
        ].join('');
      }
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