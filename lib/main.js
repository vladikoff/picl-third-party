/**
 * Main file that loads add-on functionality
 */

// Adds Google Glass add-on
const glass = require('addons/glass');

// array of active storage clients
var storageClients = [];
// Adds Dropbox Support
storageClients.push( require('storage/dropbox').init() );
// Adds Google Support
storageClients.push( require('storage/drive').init() );

// Adds context menus for snippets
const contextMenu = require('context-menus');

// publish storageClients for context menus
exports.storageClients = storageClients;
