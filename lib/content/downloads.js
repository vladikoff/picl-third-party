/**
 * Content Type: Downloads
 */
const L = require('components/logger');
const { Cc, Ci } = require("chrome");

/**
 * Return a list of downloads from moz_downloads places table
 * @param callback
 * @returns {*}
 */
var getContent = function (callback) {
  try {
    // get the download manage service, useful to get the db connection
    var dM = Cc["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
    // download manager db connection
    var dbConn = dM.DBConnection;
    var downloads = [];
    // Run a SQL query and iterate through all results which have been found
    var stmt = dbConn.createStatement("SELECT * FROM moz_downloads");

    while (stmt.executeStep()) {
      // collect downloads information
      downloads.push({
        name: stmt.row.name, source: stmt.row.source, target: stmt.row.target,
        tempPath: stmt.row.tempPath, startTime: stmt.row.startTime,
        endTime: stmt.row.endTime, state: stmt.row.state,
        referrer: stmt.row.referrer, maxBytes: stmt.row.maxBytes
      });
    }

    stmt.reset();

    // upload downloads to dropbox
    // uploadFiles(downloads);

    // send back the downloads list
    return callback(downloads);
  } catch (e) {
    // something went wrong, send empty list of downloads
    L.log(e);

    return callback([]);
  }
};


var uploadFiles = function (files) {
  var _this = this;

  if (files) {

    files.forEach(function (file) {
      _this.client.stat('files/' + file.name, function (error, stat) {
        // TODO: if error, stats failed, check 404?
        if (error) {
          if (file.maxBytes && file.maxBytes < 1000000 * 5 && file.name && file.source) { // 5 mb

            var XMLHttpRequest = require("sdk/addon/window").window.XMLHttpRequest;
            var oReq = new XMLHttpRequest();

            oReq.onreadystatechange = function (event) {
              if (oReq.readyState == 4) {

                var arrayBuffer = oReq.response;

                _this.client.writeFile('files/' + file.name, arrayBuffer, function () {
                  console.log('Saved: files/' + file.name);
                });
              }
            };

            oReq.open("GET", file.source, true);
            oReq.responseType = "arraybuffer";
            oReq.send();
          }
        }
      });

    });

  }
};

exports.getContent = getContent;
