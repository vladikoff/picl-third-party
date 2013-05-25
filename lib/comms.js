const L = require('logger');
// simple preferences
const sp = require("sdk/simple-prefs");
// system events
const events = require("sdk/system/events");
// browser chrome
const { Ci } = require("chrome");
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

    worker.port.on("doAuthorize", function(data) {
        console.log("doAuthorize");
        console.log(data);

        // open OAuth tab
        tabs.open({
            url: data.authUrl,
            onOpen: function onOpen(tab) {
                listener = function (event) {
                    // if the page worker present
                    // listen to http events
                    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
                    // find the http event url
                    var url = channel.URI.spec;
                    // match it with the api auth
                    if (url.indexOf('https://www.dropbox.com/home#?') == 0) {
                        // splits to get the tokens
                        var path = "oauth_receiver.html#?" + url.split("#?")[1];
                        // send to the client add-on
                        worker.port.emit("doAuthorize", { path: path });
                        tab.close();
                        // unsubscribe
                        events.off("http-on-modify-request", listener);
                        events.off("http-on-opening-request", listener);
                    }
                };

                // listen for http system events
                events.on("http-on-modify-request", listener);
                events.on("http-on-opening-request", listener);
            }
        });
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
