# Firefox add-on helper for dropbox-js library

## Setup

Include __dropbox.js__ (or dropbox.min.js) library file with your content scripts:

```javascript
pagemod.PageMod({
    // your front-end file
    include: data.url("main.html"),
    contentScriptFile: [
        data.url("js/dropbox.js"),
        // other scripts here ...
    ],
    contentScriptWhen: "end",
    // attach handler
    onAttach: addControlPage
});
```

In your add-on file require `const dropbox = require('ff-dropbox');`
In the attach handler call, pass the worker to the dropbox.js function `dropbox.FFDropbox(worker);`.

That's it!
You are now ready to use the client library, make sure to use the Firefox client driver `new Dropbox.Drivers.Firefox(...)`:

```javascript
var client = new Dropbox.Client({
    key: "APP_KEY_HERE", sandbox: true
});

// Firefox client driver
client.authDriver(new Dropbox.Drivers.Firefox({ rememberUser: true }));
```


You can find more usage information in the official
[dropbox-js](https://github.com/dropbox/dropbox-js/blob/master/doc/getting_started.md#browser-and-open-source-applications)
docs or you can view the [example](#) add-on.
