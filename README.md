# picl-third-party


## Development

* Sending files to third party storage requires ArrayBuffers, XHR and FormData.
Please download the latest copy of the [Addon SDK](https://github.com/mozilla/addon-sdk) or use one that this was tested with at [https://github.com/vladikoff/addon-sdk](https://github.com/vladikoff/addon-sdk)
(Addon SDK 1.14 does NOT have proper XHR support for this).
* enable addon-sdk sdk, use `source bin/activate`
* `cfx run` from project directory
* see Tools -> Sync with ...

#### Deployment

Desktop:

`cfx run`

Mobile:

`cfx run -a fennec-on-device -b adb --mobile-app firefox_beta --force-mobile`
Log: `adb logcat | grep info:`

### Grunt workflow

This allows for faster cfx reload.

* npm install
* run `grunt watch` (make sure cfx is loaded)
* after you make changes to the project files, cfx will run.
* note: you need to close Firefox first, before cfx can relaunch the browser

* other grunt options: `grunt cfx` and `grunt cfx --mobile` - manually run cfx run with profile parameters.
