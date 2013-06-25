/**
 * Content Type: Most Used Sites
 */

const L = require('components/logger');
const { Cc, Ci } = require("chrome");

/**
 * Returns a list of most visited sites and a link to their meta touch icons.
 * @param callback
 */
var getContent = function (callback) {
  try {
    var hs = Cc["@mozilla.org/browser/nav-history-service;1"].
      getService(Ci.nsINavHistoryService);
    var pip = hs.QueryInterface(Ci.nsPIPlacesDatabase);
    var dbConn = pip.DBConnection;

    var favicons = [];
    //var stmt = dbConn.createStatement("SELECT * FROM moz_favicons");
    var q = "select m.url " +
      'FROM moz_places as m ' +
      'INNER JOIN ( ' +
      'select m.rev_host as rev_host, max(m.frecency) as frec from moz_places as m ' +
      "where m.typed = 1 and m.hidden = 0 " + // and m.rev_host <> 'moc.elgoog.liam.' " +
      'group by rev_host ' +
      'order by max(m.frecency) desc ' +
      'limit ' + 15 + ' ' +
      ') as X ON m.rev_host = X.rev_host AND m.frecency = X.frec ';
    var stmt = dbConn.createStatement(q);
    while (stmt.executeStep()) {
      favicons.push(stmt.row.url);
    }
    stmt.reset();

    var goodIcons = [];
    var Request = require("sdk/request").Request;
    favicons.forEach(function(url, i) {
      var r = Request({
        url: url + '/apple-touch-icon.png',
        onComplete: function (response) {
          if (response.status === 200) {
            var cT = response.headers['Content-Type'];
            if (cT == 'image/png') {
              goodIcons.push({ url: url});
            }
          }
          if (favicons.length - 1 === i) {
            return callback(goodIcons);
          }
        }
      });

      r.get();

    });
    //L.log(favicons);

  } catch (e) {
    L.log(e);
    return callback([]);
  }
};

exports.getContent = getContent;
