const L = require('logger');
// simple preferences
const sp = require("sdk/simple-prefs");
// system events
const events = require("sdk/system/events");
// browser chrome
const { Ci } = require("chrome");
// tabs
const tabs = require("tabs");


function addControlPage(worker) {
    // save the pagemod worker
    // on event
    worker.port.on("from-content", function (data) {
        if (data.name == "authTab") {
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
                        if (url.indexOf('http://www.dropbox.com/home#?') == 0) {
                            // splits to get the tokens
                            var path = "oauth_receiver.html#?" + url.split("#?")[1];
                            // send to the client add-on
                            worker.port.emit("to-content", {name: 'dropboxConnect', data: { path: path }});
                            tab.close();
                        }
                    };

                    // listen for http system events
                    events.on("http-on-modify-request", listener);
                    events.on("http-on-opening-request", listener);
                }
            });

        }
        //worker.port.emit("to-content", {name: 'loadCredsResult', storageKey: sp.storageKey, other: 'test'});
    });
}

const pagemod = require("page-mod");
const data = require("self").data;

exports.setupComms = function () {
    // setup pagemod for client page
    pagemod.PageMod({ include: data.url("main.html"),
        contentScriptFile: data.url("js/addon-comms.js"),
        contentScriptWhen: "end",
        onAttach: addControlPage
    });
};

