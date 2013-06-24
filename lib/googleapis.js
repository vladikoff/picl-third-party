var api = {
  authenticate: function() {
    var scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
      // Add other scopes needed by your application.
    ];
    var config = {
      clientId: '842089045128.apps.googleusercontent.com',
      apiScope: scopes.join(' ')
    };

    var url = this.authorizationCodeURL(config);

    var tabs = require("tabs");
    var data = require("self").data;
    tabs.open({
      url: url,
      onReady: onReady = function (tab) {
        if (tab.url.indexOf('https://www.google.com/robots.txt?') === 0) {
          console.log('got to tab');
          console.log(tab.url);

          var url = decodeURIComponent(tab.url);
          var index = url.indexOf('?');
          if (index > -1) {
            url = url.substring(0, index);
          }

          // Derive adapter name from URI and then finish the process.
          var adapterName = OAuth2.lookupAdapterName(url);
          var finisher = new OAuth2(adapterName, OAuth2.FINISH);

        }
      }
    });
  },

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
    return 'http://www.google.com/robots.txt';
  },

  parseAuthorizationCode: function(url) {
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
};

exports.api = api;
