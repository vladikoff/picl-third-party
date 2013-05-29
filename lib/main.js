const menu = require('menuitems');
const SyncFrame = require('sync-frame');

// new sync window
let frame = new SyncFrame();

// add a menu item to open the sync window
menu.Menuitem({
    id: "syncThirdParty",
    menuid: "menu_ToolsPopup",
    label: "Sync with Third Party",
    onCommand: frame.show,
    insertbefore: "menu_pageInfo"
});

const data = require("self").data;

require('about').add({what: 'dropbox-oauth', url: require('self').data.url('receiver.html')});

//require('about').add({what: 'dropbox-oauth', url: 'data:text/html;charset=utf-8,' + require('self').data.load('receiver.html')});
