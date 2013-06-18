# picl-third-party


## Development

* enable (addon-sdk-1.14 or later) sdk, use `source bin/activate`
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
* grunt watch
* after you make changes to the project files, cfx will run.
* note: you need to close Firefox first, before cfx can relaunch the browser

* other grunt options: `grunt cfx` and `grunt cfx --mobile` - manually run cfx run with profile parameters.