//TODO: change the name of this file and Auth
//const tabs = require("tabs");

function SyncFlow() {

}

// TODO: reads the dropbox folder to test the sdk
SyncFlow.prototype.readFolder = function() {
    this.client.readdir("/", function(error, files) {
        console.log('folder');
        console.log(files);
    });
};

// dropbox auth
SyncFlow.prototype.authDropbox = function() {
    var self = this;
    this.client = new Dropbox.Client({
        key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
    });

    this.client.authDriver(new Dropbox.Drivers.Firefox({
        receiverUrl: "http://dropbox.com/home"
    }));

    this.client.authenticate(function(error, client) {
        if (error) {
            console.log(error);
            return;
        }

        client.getUserInfo(function(error, userInfo) {
            console.log("Hello, " + userInfo.name + "!");
        });
        client.writeFile(new Date().toString().replace(/ /g, '') + ".txt", 'Hello!', function(error, stat) {
            if (error) {
                console.log(error);
            }
            self.readFolder();
            // The image has been succesfully written.
        });
        self.readFolder();
    });
};


SyncFlow.prototype.authGoogleDrive = function() {
    console.log("authGoogleDrive");
};
