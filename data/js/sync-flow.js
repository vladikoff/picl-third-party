//TODO: change the name of this file and Auth

function SyncFlow() {

}

// TODO: reads the dropbox folder to test the sdk
SyncFlow.prototype.readFolder = function() {
    this.client.readdir("/", function(error, files) {
        $("#dropboxData").html("");
        files.forEach(function(file) {
            $("#dropboxData").append(file + "<br/>");
        });
    });
};

// dropbox auth
SyncFlow.prototype.authDropbox = function() {
    var self = this;
    this.client = new Dropbox.Client({
        key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
    });

    this.driver = new Dropbox.Drivers.Firefox();
    this.client.authDriver(this.driver);

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
    });
};

SyncFlow.prototype.authGoogleDrive = function() {
    console.log("authGoogleDrive");
};
