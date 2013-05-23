const L = require('logger');
// simple preferences
const sp = require("sdk/simple-prefs");
// system events
const events = require("sdk/system/events");
// browser chrome
const { Ci } = require("chrome");
// tabs
const tabs = require("tabs");

var listener;
var work;


listener = function (event) {
    // if the page worker present
    if (work) {
        // listen to http events
        var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
        // find the http event url
        var url = channel.URI.spec;
        // match it with the api auth
        if (url.indexOf('http://www.dropbox.com/home#?') == 0) {
            // splits to get the tokens
            var path = "oauth_receiver.html#?" + url.split("#?")[1];
            // send to the client add-on
            work.port.emit("to-content", {name: 'dropboxConnect', path: path});
            //tabs.open(data.url(path));
        }
    }
};

function addControlPage(worker) {
    // save the pagemod worker
    work = worker;
    // on event
    worker.port.on("from-content", function (data) {
        // TODO: this sends a null storage key...
        worker.port.emit("to-content", {name: 'loadCredsResult', storageKey: sp.storageKey, other: 'test'});
    });
}

const pagemod = require("page-mod");
const data = require("self").data;

exports.setupComms = function() {
    // setup pagemod for client page
    pagemod.PageMod({ include: data.url("main.html"),
        contentScriptFile: data.url("js/addon-comms.js"),
        contentScriptWhen: "end",
        onAttach: addControlPage
    });
};

// listen for http system events
events.on("http-on-modify-request", listener);
events.on("http-on-opening-request", listener);
