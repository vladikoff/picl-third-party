function SyncFlow() {
    this.client = new Dropbox.Client({
        key: "gBZIklF5PfA=|f3fms27tm69IELcc347Wmtex0IZ8k+n2y8Sy21+6Hg==", sandbox: true
    });

    this.client.authDriver(new Dropbox.Drivers.Firefox({ rememberUser: true }));

    this.client.authenticate({interactive: false}, function (error, client) {
        if (error) {
            console.log(error);
        }
        console.log(client.isAuthenticated());
        if (client.isAuthenticated()) {
            // Cached credentials are available, make Dropbox API calls.
            //readFolder(client);
            window.dispatchEvent(new CustomEvent("from-content", {detail: { name: "getTabs" }}));
        }
    });
}

SyncFlow.prototype.signOut = function () {
    this.client.signOut();
};


// dropbox auth
SyncFlow.prototype.authDropbox = function () {
    this.client.authenticate(function (error, client) {
        if (error) {
            console.log(error);
            return;
        }

        client.getUserInfo(function (error, userInfo) {
            console.log("Hello, " + userInfo.name + "!");
        });

        window.dispatchEvent(new CustomEvent("from-content", {detail: { name: "getTabs" }}));
    });
};

// load the tabs into the ui
SyncFlow.prototype.loadTabs = function (tabs) {
    var self = this;
    console.log('tabs');
    console.log(tabs);


    $("#dropboxData").html("");

    this.client.readdir("/", function (error, files) {
        files.forEach(function (file) {
            $("#dropboxData").append(file + "<br/>");
        });
    });

    tabs.forEach(function (tab) {
        $("#dropboxData").append("<a href='" + tab.url + ">" + tab.title + "</a><br/>");
        self.client.readFile(tab.title + ".html", function(error, data) {
            if (error) {
                self.client.writeFile(tab.title + ".html", tab.url, function(error, stat) {});
            }
        });

    });

};

SyncFlow.prototype.authGoogleDrive = function () {
    console.log("authGoogleDrive");
};
