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
