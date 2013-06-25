/**
 * Content Type: Tabs
 */

// all windows
const windows = require("sdk/windows").browserWindows;

/**
 * Get all browser tabs for all windows
 */
var getContent = function (callback) {
  var currentTabs = [];

  for each(var window in windows) {
    for each(var tab in window.tabs) {
      var thumb = '';
      try {
        thumb = tab.getThumbnail();
      } catch(e) {
        console.log('Failed to getThumbnail');
      }

      // store title , url and the date the tab was listed
      currentTabs.push({ title: tab.title, url: tab.url, thumb: thumb, visit: new Date().getTime()});
    }
  }
  // clean up the tab list
  currentTabs = _parseTabList(currentTabs);

  callback(currentTabs);
};

var _parseTabList = function (tabs) {
  var goodTabs = [];

  tabs.forEach(function (tab) {
    if (!tab.url.match((/about:/gi))) {
      goodTabs.push(tab);
    }
  });
  return goodTabs;
};

exports.getContent = getContent;
