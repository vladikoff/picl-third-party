/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Class } = require("sdk/core/heritage");
const { Ci } = require("chrome");
const tabs = require("tabs");
const events = require("sdk/system/events");
const data = require("self").data;

let FFDropbox = Class({
    initialize: function (worker) {
        // got an event to auth
        worker.port.on("doAuthorize", function (data) {
            // open a new browser tab
            tabs.open({
                // open a tab with the oauth flow url
                url: data.authUrl,
                onReady: function onReady(tab) {
                    // if the title of the page has about:blank and oauth tokens
                    if (tab.title.indexOf('about:blank#?') == 0) {
                        // splits to get the tokens
                        var path = "oauth_receiver.html#?" + tab.title.split("#?")[1];
                        // send to the client add-on
                        worker.port.emit("doAuthorize", { path: path });
                        // close the tab, oauth confirmed
                        tab.close();
                    }
                }
            });
        });
    }
});

function FFDropboxExport(worker) {
    return FFDropbox(worker);
}

exports.FFDropbox = FFDropboxExport;
