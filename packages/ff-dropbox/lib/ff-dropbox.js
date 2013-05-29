/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Class } = require("sdk/core/heritage");
const { Ci } = require("chrome");
const tabs = require("tabs");
const events = require("sdk/system/events");
const data = require("self").data;

var tabV;
var workerV;

var listener = function (event) {
    // if the page worker present
    // listen to http events
    var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
    // find the http event url
    var url = channel.URI.spec;
    //console.log(url);
    // match it with the api auth
    if (url.indexOf('http://localhost/#?') == 0) {
    //if (url.indexOf('https://www.dropbox.com/1/oauth/authorize?') == 0) {
        // splits to get the tokens
        var path = "oauth_receiver.html#?" + url.split("#?")[1];
        // send to the client add-on
        workerV.port.emit("doAuthorize", { path: path });
        //tabV.close();

        // unsubscribe
        //events.off("http-on-modify-request", listener);
        //events.off("http-on-opening-request", listener);
    }
};

let FFDropbox = Class({
    initialize: function (worker) {
        workerV = worker;
        var self = this;
        worker.port.on("doAuthorize", function (data) {
            tabs.open({
                url: data.authUrl,
                onOpen: function onOpen(tab) {
                    tabV = tab;
                    /*
                    events.on("http-on-modify-request", function (event) {
                        self.listener(event, tab, worker);
                        //listener(event, tab, worker);
                    });
                      */
                    //events.on("http-on-modify-request", listener);
                },
                onReady: function onReady(tab) {
                    if (tab.title.indexOf('about:blank#?') == 0) {
                        //if (url.indexOf('https://www.dropbox.com/1/oauth/authorize?') == 0) {
                        // splits to get the tokens
                        var path = "oauth_receiver.html#?" + tab.title.split("#?")[1];
                        // send to the client add-on
                        worker.port.emit("doAuthorize", { path: path });
                        tab.close();
                    }

                }
            });
        });
    },
    listener: function (event, tab, worker) {
        // if the page worker present
        // listen to http events
        var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
        // find the http event url
        var url = channel.URI.spec;
        // match it with the api auth
        if (url.indexOf('about:blank#?') == 0) {
            // splits to get the tokens
            var path = "oauth_receiver.html#?" + url.split("#?")[1];
            // send to the client add-on
            worker.port.emit("doAuthorize", { path: path });
            tab.close();
            // unsubscribe
            //events.off("http-on-modify-request", listener);
            //events.off("http-on-opening-request", listener);
        }
    }
});

function FFDropboxExport(worker) {
    return FFDropbox(worker);
}

exports.FFDropbox = FFDropboxExport;
