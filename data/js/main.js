$(function() {
    var sync = new SyncFlow();

    // start Dropbox Flow
    $("#syncDropbox").on('click', sync.authDropbox.bind(sync));
    $("#syncGoogleDrive").on('click', sync.authGoogleDrive.bind(sync));

});


