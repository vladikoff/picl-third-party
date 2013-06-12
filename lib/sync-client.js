const L = require('logger');
// browser tabs
const tabs = require("tabs");
// add-on data folder
const self = require("self");
const _ = require("lodash");
// all windows
const windows = require("sdk/windows").browserWindows;
const { open } = require("sdk/io/file");
const { setTimeout } = require('timers');
// system info
let sys = require("sdk/system");

const { Cc, Ci, Cu } = require("chrome");
try {
  Cu.import("resource://gre/modules/AddonManager.jsm");
} catch(e) {

}
// if polling is allowed
var POLL = true;

/**
 * Third Party Sync Frame
 */
function SyncClient(client) {
  this.client = client;
}

/**
 * Shows the Sync Frame app
 */
SyncClient.prototype.syncContent = function () {

  var file = require("sdk/io/file");
  var info = {
    host: require("./hostname").hostname,
    profileDir: file.basename(sys.pathFor("ProfD"))
  };
  info.profileID = (info.host+"-"+info.profileDir).replace(/[\.\$\[\]\#\/]/g, "");
  this.clientId = info.profileID;

  // process the tabs
  this._processContentType('tabs');
  // process downloads if module available
  this._processContentType('downloads');
  // process addons if module available
  if (AddonManager) {
    this._processContentType('addons');
  }
};


SyncClient.prototype._processContentType = function (type) {
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
};



SyncClient.prototype._saveTypeList = function (data, type) {
  var _this = this;

  // content type callback
  var callback = function(contentData) {

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
        return (i.url) ? i.url.toString() : i.name.toString();
      });
      existingData[type] = uniqContent;
    }
    // else there are no tabs for this client
    else {
      var obj = {
        name: _this.clientId
      };
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
  switch(type) {
    case 'tabs':
      this._getCurrentTabs(callback);
      break;
    case 'addons':
      this._getCurrentAddons(callback);
      break;
    case 'downloads':
      this._getCurrentDownloads(callback);
      break;
  }

};

/**
 * Poll and sync content
 */
SyncClient.prototype._poll = function () {
  if (POLL) {
    this.syncContent();
  }
  setTimeout(this._poll.bind(this), 7000);
};

/**
 * Parse the tab list, removes illegal tabs
 */
SyncClient.prototype._parseTabList = function (tabs) {
  var goodTabs = [];

  tabs.forEach(function (tab) {
    if (!tab.url.match((/about:/gi))) {
      goodTabs.push(tab);
    }
  });
  return goodTabs;
};

/**
 * Get all browser tabs for all windows
 */
SyncClient.prototype._getCurrentTabs = function (callback) {
  var currentTabs = [];

  for each(var window in windows) {
    for each(var tab in window.tabs) {
      // store title , url and the date the tab was listed
      currentTabs.push({ title: tab.title, url: tab.url, visit: new Date().getTime()});
    }
  }
  // clean up the tab list
  currentTabs = this._parseTabList(currentTabs);

  callback(currentTabs);
};


SyncClient.prototype._getCurrentAddons = function (callback) {
  try {
    AddonManager.getAllAddons(function (data) {
      var goodAddons = [];
      data.forEach(function (addon) {
        if (addon.id && addon.name) {
          var obj = {
            id: addon.id,
            name: addon.name
          };

          if (addon.sourceURI) {
            obj.url = addon.sourceURI;
          }
          goodAddons.push(obj);
        }
      });

      callback(goodAddons);
    });
  } catch (e) {
    callback([]);
  }
};


SyncClient.prototype._getCurrentDownloads = function (callback) {
  try {
    var dM = Cc["@mozilla.org/download-manager;1"]
      .getService(Ci.nsIDownloadManager);
    var db = dM.DBConnection;

    var dbConn = dM.DBConnection;
    var stmt = null;

    if (dbConn.schemaVersion < 3)
      return new Array();

    // Run a SQL query and iterate through all results which have been found
    var downloads = [];
    stmt = dbConn.createStatement("SELECT * FROM moz_downloads");
    while (stmt.executeStep()) {
      downloads.push({
        name: stmt.row.name, target: stmt.row.target,
        tempPath: stmt.row.tempPath, startTime: stmt.row.startTime,
        endTime: stmt.row.endTime, state: stmt.row.state,
        referrer: stmt.row.referrer, maxBytes: stmt.row.maxBytes
      });
    }
    stmt.reset();
    callback(downloads);
  } catch (e) {
    L.log(e);
    callback([]);
  }
};


module.exports = SyncClient;
