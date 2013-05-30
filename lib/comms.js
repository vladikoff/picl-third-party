const L = require('logger');
// simple preferences
const sp = require("sdk/simple-prefs");
// tabs
const tabs = require("tabs");
const { getTabs } = require('sdk/tabs/utils');

function addControlPage(worker) {

    // save the pagemod worker
    // on event
    worker.port.on("from-content", function (data) {
        if (data.name == "getTabs") {
            // all windows
            var windows = require("sdk/windows").browserWindows;
            var brTabs = [];
            for each (var window in windows) {
                for each (var tab in window.tabs) {
                    brTabs.push({ title:tab.title, url: tab.url });
                }
            }
            worker.port.emit("to-content", {name: 'syncTabs', data: { tabs: brTabs }});
        }
    });
}

const pagemod = require("page-mod");
const data = require("self").data;

exports.setupComms = function () {
    // setup pagemod for client page
    pagemod.PageMod({
        include: data.url("main.html"),
        contentScriptFile: [
            data.url("js/dropbox.js"),
            data.url("js/jquery-2.0.0.min.js"),
            data.url("js/sync-flow.js"),
            data.url("js/main.js"),
            data.url("js/addon-comms.js")
        ],
        contentScriptWhen: "end",
        onAttach: addControlPage
    });
};
