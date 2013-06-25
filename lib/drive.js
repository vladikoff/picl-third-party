// menuitems addon
const menu = require('menuitems');
const { api } = require('libs/googleapis');


var driveSync = menu.Menuitem({
  id: "syncGoogleDrive",
  menuid: "menu_ToolsPopup",
  label: "Sync with Google Drive",
  onCommand: function () {
    // if not authenticated
    if (true) {
      api.authenticate();
    }

  },
  insertbefore: "menu_pageInfo"
});

