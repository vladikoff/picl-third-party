
    var sync = new SyncFlow();
    $("#loginDropbox").on("click", sync.authDropbox.bind(sync));
    $("#logoutDropbox").on("click", sync.signOut.bind(sync));

    function msgFromBackend(name, data) {
        if (name == "syncTabs") {
            sync.loadTabs(data.tabs);
        }

    }

    function syncListener(e) {
        var msg = JSON.parse(e.detail);
        try {
            msgFromBackend(msg.name, msg.data);
        } catch (e) {
            // apparently exceptions raised during event listener
            // functions aren't printed to the error console
            console.log("exception in msgFromBackend");
            console.log(e);
        }
    }
    window.addEventListener("to-content", syncListener);

