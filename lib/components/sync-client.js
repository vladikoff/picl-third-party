const L = require('./logger');
// browser tabs
const tabs = require("tabs");
// add-on data folder
const self = require("self");
const _ = require("./../libs/lodash");
const { setTimeout } = require('timers');
// if polling is allowed
var POLL = true;


const { Class } = require("sdk/core/heritage");

let SyncClient = Class({
  initialize: function (client, options) {

    // TODO: temp store for snippets
    this.SNIPPETS = [];
    this.name = 'test';
    this.client = client;

  },
  syncContent: function () {

    var file = require("sdk/io/file");
    var info = {
      host: require("./hostname").hostname,
      profileDir: file.basename(require("sdk/system").pathFor("ProfD"))
    };
    info.profileID = (info.host + "-" + info.profileDir).replace(/[\.\$\[\]\#\/]/g, "");
    this.clientId = info.profileID;

    this._processContentType('tabs');
    this._processContentType('downloads');
    this._processContentType('addons');
    this._processContentType('favicons');
    this._processContentType('snippets');
  },
  _processContentType: function (type) {
    var _this = this;

    var file = [];
    // read the current tab data
    _this.client.readFile('.' + type + '.json', function (error, data) {
      // don't poll when reading files
      POLL = false;
      if (error) {
        _this.client.writeFile('.' + type + '.json', JSON.stringify(file), function () {
          _this._saveTypeList(data, type);
        });
        POLL = true;
      } else {
        _this._saveTypeList(data, type);
      }
    });
  },
  _saveTypeList: function (data, type) {
    var _this = this;

    // content type callback
    var callback = function (contentData) {

      // the new data that will be pushed to dropbox
      var newData;

      // if undefined, set new data
      if (data == null) {
        // new array of all devices
        newData = [];
      }
      // else there's something in the file
      else {
        newData = data;
      }
      // if the client already exists in the tab list
      // then find it and only modify that client
      var existingData = _.find(newData, { 'name': _this.clientId });

      // if we found that client
      if (existingData) {
        // get a unique lift of tabs, match by url
        // set the unique list for this client
        var existingDataContent = existingData[type];
        var uniqContent = _.uniq(existingDataContent.concat(contentData), function (i) {
          return (i.name) ? i.name.toString() : i.url.toString();
        });
        existingData[type] = uniqContent;
      }
      // else there are no tabs for this client
      else {
        // create a new client
        var obj = {
          name: _this.clientId
        };
        // save brand new data
        obj[type] = contentData;
        newData.push(obj);
      }

      // stringify the tab list
      var save = JSON.stringify(newData);
      // update this type for this client
      _this.client.writeFile('.' + type + '.json', save, function (error) {
        if (error) {
          console.log(error);
        }
        POLL = true;
      });
    };

    // get items by content type
    switch (type) {
      case 'tabs':
        require('./../content/tabs').getContent(callback);
        break;
      case 'addons':
        require('./../content/addons').getContent(callback);
        break;
      case 'downloads':
        require('./../content/downloads').getContent(callback);
        break;
      case 'favicons':
        require('./../content/mostUsed').getContent(callback);
        break;
      case 'snippets':
        this._getCurrentSnippets(callback);
        break;
    }

  },
  _poll: function () {
    if (POLL) {
      this.syncContent();
    }
    setTimeout(this._poll.bind(this), 10000);
  },
  _getCurrentSnippets: function (callback) {
    // TODO
    var snippets = [];
    snippets = this.SNIPPETS;

    callback(snippets);
  },
  pushType: function (type, data) {
    // TOOD: update this if needed

    // IF snippet type image
    // push it to dropbox

    this.SNIPPETS.push(data);
  }

});

function SyncClientExport(client, options) {
  return SyncClient(client, options);
}

exports.SyncClient = SyncClientExport;
