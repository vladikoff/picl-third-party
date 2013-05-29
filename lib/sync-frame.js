const L = require('logger');
// browser tabs
const tabs = require("tabs");
// add-on data folder
const data = require("self").data;
// add-on communication
const comms = require("comms");

/**
 * Third Party Sync Frame
 */
function SyncFrame() {}

/**
 * Shows the Sync Frame app
 */
SyncFrame.prototype.show = function () {
    comms.setupComms();
    tabs.open(data.url("main.html"));
};

comms.setupComms();
tabs.open(data.url("main.html"));

module.exports = SyncFrame;
