/**
 * Content Type: Addons
 */

const L = require('components/logger');
const { Cc, Ci, Cu } = require("chrome");

try {
  Cu.import("resource://gre/modules/AddonManager.jsm");
} catch(e) {

}

/**
 * Returns a list of most visited sites and a link to their meta touch icons.
 * @param callback
 */
var getContent = function (callback) {
  try {
    // process addons if module available
    if (AddonManager) {
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
    } else {
      throw new Error('AddonManager not available');
    }
  } catch (e) {
    callback([]);
  }
};

exports.getContent = getContent;
