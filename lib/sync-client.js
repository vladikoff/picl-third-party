const L = require('logger');
// browser tabs
const tabs = require("tabs");
// add-on data folder
const self = require("self");
const _ = require("lodash");
// all windows
const windows = require("sdk/windows").browserWindows;

const { open } = require("sdk/io/file");

const { setTimeout } = require('timers');

// system info
let sys = require("sdk/system");

// if polling is allowed
var POLL = true;

/**
 * Third Party Sync Frame
 */
function SyncClient(client) {
    this.client = client;
}

/**
 * Shows the Sync Frame app
 */
SyncClient.prototype.syncTabs = function () {
    var _this = this;
    var file = {};
    // read the current tab data
    _this.client.readFile('.tabs.json', function(error, data){
        // don't poll when reading files
        POLL = false;
        if (error) {
            console.log(error);
            // TODO: this should create a file and continue flow
            _this.client.writeFile('.tabs.json', JSON.stringify(file), function () {
                _this._saveTabList(data);
            });
            POLL = true;
        } else {
            _this._saveTabList(data);
        }
    });
};

SyncClient.prototype._saveTabList = function (data) {
    var _this = this;
    var currentTabs = [];

    for each (var window in windows) {
        for each (var tab in window.tabs) {
            // store title , url and the date the tab was listed
            currentTabs.push({ title:tab.title, url: tab.url , visit: new Date().getTime()});
        }
    }

    // system id
    var clientId = sys.id.toString();
    var file;

    // if undefined, set new data
    if (data == null) {
        file = {};
    }
    // else there's something in the file
    else {
        // try to parse the json data from the file
        try {
            file = JSON.parse(data);
        } catch (e) {
            // could not parse it, resetting the tabs
            console.log(e);
            file = {};
        }
    }
    // get a valid list of tabs
    currentTabs = this._parseTabList(currentTabs);
    // if the client already exists in the tab list
    if (clientId in file) {
        // get a unique lift of tabs, match by url
        // set the unique list for this client
        file[clientId] = _.uniq(file[clientId].concat(currentTabs), function (i) {
            return i.url.toString();
        });
    }
    // else there are no tabs for this client
    else {
        file[clientId] = currentTabs;
    }

    // stringify the tab list
    var save = JSON.stringify(file);
    L.log('Saving', save);
    // update the tabs file with the tab list

    this.client.writeFile('.tabs.json', save, function() {
        var mainContent = self.data.load("main.html");
        _this.client.writeFile('Firefox.html', mainContent);
        POLL = true;
    });


    //L.log(mainF);



};

SyncClient.prototype._poll = function () {
    if (POLL) {
        this.syncTabs();
    }
    setTimeout(this._poll.bind(this), 7000);
};

/**
 * Parse the tab list, removes illegal tabs
 */
SyncClient.prototype._parseTabList = function (tabs) {
    var goodTabs = [];

    tabs.forEach(function(tab) {
        if (! tab.url.match((/about:/gi))) {
            goodTabs.push(tab);
        }
    });
    return goodTabs;
};

//comms.setupComms();
//tabs.open(data.url("main.html"));

module.exports = SyncClient;
