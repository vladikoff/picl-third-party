// pretty logging
const L = require('components/logger');
const { OAuth2 } = require('./oauth2');

var api = {
  authenticate: function() {
    var googleAuth = new OAuth2('google', {
      client_id: '842089045128.apps.googleusercontent.com',
      client_secret: 'aVUb5hKiBVT-dAqSCPFLWkPu',
      api_scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install'
    });

    googleAuth.authorize(function() {
      // Ready for action, can now make requests with
      googleAuth.getAccessToken();

      var XMLHttpRequest = require("sdk/addon/window").window.XMLHttpRequest;
      // Make an XHR that creates the task
      /*

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function (event) {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            // good
            var task = xhr.responseText;
            L.log(task);
          } else {
            // bad
          }

          if (cb) cb(event);
          //fields.className = 'animated bounceIn';
        }
      };
      xhr.open('GET', 'https://www.googleapis.com/drive/v2/files', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'OAuth ' + googleAuth.getAccessToken());

      xhr.send();
      */
      /////////////////////////////////////////////////////////////////////////////////
      var xhr = new XMLHttpRequest();
      var json = JSON.stringify({
        mimeType: 'application/json',
        title: 'Tabs.firefox'
      });

      xhr.onreadystatechange = function(event) {
        if (xhr.readyState == 4) {
          console.log("Uploaded file: " + xhr.responseText);
        }
        console.log(xhr.status);
      };

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart', true);
      //xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'OAuth ' + googleAuth.getAccessToken());
      xhr.setRequestHeader("Content-Type",  'multipart/related; boundary="END_OF_PART"');

      xhr.send([
        mimePart("END_OF_PART", "application/json", json),
        mimePart("END_OF_PART", "application/json", json),
        "\r\n--END_OF_PART--\r\n"
      ].join(''));

      function mimePart(boundary, mimeType, content) {
        return [
          "\r\n--", boundary, "\r\n",
          "Content-Type: ", mimeType, "\r\n",
          "Content-Length: ", content.length, "\r\n",
          "\r\n",
          content
        ].join('');
      }

      //xhr.send();



    });

  }
};

exports.api = api;



OAuth2.adapter('google', {
  authorizationCodeURL: function(config) {
    return ('https://accounts.google.com/o/oauth2/auth?' +
      'client_id={{CLIENT_ID}}&' +
      'redirect_uri={{REDIRECT_URI}}&' +
      'scope={{API_SCOPE}}&' +
      'access_type=offline&' +
      'response_type=code')
      .replace('{{CLIENT_ID}}', config.clientId)
      .replace('{{REDIRECT_URI}}', this.redirectURL(config))
      .replace('{{API_SCOPE}}', config.apiScope);
  },

  redirectURL: function(config) {
    return 'https://www.google.com/robots.txt';
  },

  parseAuthorizationCode: function(url) {
    console.log('parseAuthorizationCode')
    console.log(url)

    var error = url.match(/[&\?]error=([^&]+)/);
    if (error) {
      throw 'Error getting authorization code: ' + error[1];
    }
    return url.match(/[&\?]code=([\w\/\-]+)/)[1];
  },

  accessTokenURL: function() {
    return 'https://accounts.google.com/o/oauth2/token';
  },

  accessTokenMethod: function() {
    return 'POST';
  },

  accessTokenParams: function(authorizationCode, config) {
    return {
      code: authorizationCode,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: this.redirectURL(config),
      grant_type: 'authorization_code'
    };
  },

  parseAccessToken: function(response) {
    var parsedResponse = JSON.parse(response);
    return {
      accessToken: parsedResponse.access_token,
      refreshToken: parsedResponse.refresh_token,
      expiresIn: parsedResponse.expires_in
    };
  }
});
