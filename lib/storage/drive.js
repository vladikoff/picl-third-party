const menu = require('menuitems');
const { api } = require('libs/googleapis');


var driveSync = menu.Menuitem({
  id: "syncGoogleDrive",
  menuid: "menu_ToolsPopup",
  label: "Sync with Google Drive",
  onCommand: function () {
    api.authenticate('https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install', function () {
      console.log('ready')
    });
  },
  insertbefore: "menu_pageInfo"
});

