const L = require("components/logger");
// add-on data folder
const data = require("self").data;
// component module
const { Cc, Ci, Cu } = require("chrome");

var main = require('main');

var cm = require("sdk/context-menu");

cm.Item({
  label: "Save text to PiCL",
  context: cm.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
    '  var text = window.getSelection().toString();' +
    ' var loc = window.location.href;' +
    '  self.postMessage({text: text, location: loc});' +
    '});',
  onMessage: function (data) {
    var data = {
      name: data.text,
      type: 'text',
      visit: new Date().getTime(),
      location: data.location
    };

    main.storageClients.forEach(function(storage) {
      storage.pushType('snippets', data);
    });

  }
});

cm.Item({
  label: "Save image to PiCL",
  context: cm.SelectorContext("img"),
  contentScript: 'self.on("click", function (node) {' +
    ' var loc = window.location.href;' +
    '  self.postMessage({ text: node.src, location: loc });' +
    '});',
  onMessage: function (data) {
    var data = {
      name: data.text,
      type: 'image',
      visit: new Date().getTime(),
      location: data.location
    };

    main.storageClients.forEach(function(storage) {
      storage.pushType('snippets', data);
    });

  }
});
