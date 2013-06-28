/**
 * Main file that loads add-on functionality
 */

// Adds Google drive support
const GoogleDrive = require('storage/drive');
// Adds Dropbox Support
const dropbox = require('storage/dropbox');
const glass = require('addons/glass');


// array of active storage clients
var storageClients = [];
storageClients.push( dropbox.init() );

// Adds context menus for snippets
const ContextMenu = require('context-menus');

// publish storageClients for context menus
exports.storageClients = storageClients;
