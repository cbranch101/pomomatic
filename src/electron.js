var app = require('app');  
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var path = require("path")
var globalShortcut = require('global-shortcut');
var Tray = require('tray');
var Timer = require('./models/timer.js');
var Menu = require('menu');

var program = require("commander")
  .option("-d, --dev-tools", "Open Dev Tools on start up")
  .parse(process.argv)

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

module.exports.appIcon = null;
module.exports.mainWindow = null;
module.exports.Timer = Timer;

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {

  app.commandLine.appendSwitch('js-flags', '--harmony_iteration');
  app.commandLine.appendSwitch('js-flags', '--harmony_symbols');
  app.commandLine.appendSwitch('js-flags', '--harmony_observation');
  app.commandLine.appendSwitch('js-flags', '--harmony_scoping');
  app.commandLine.appendSwitch('js-flags', '--harmony_modules');
  app.commandLine.appendSwitch('js-flags', '--harmony_proxies');
  app.commandLine.appendSwitch('js-flags', '--harmony_collections');
  app.commandLine.appendSwitch('js-flags', '--harmony_generators');
  app.commandLine.appendSwitch('js-flags', '--harmony_arrow_functions');


  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 600, frame : false});

  var popupMainWindow = function() {
    mainWindow.show() && mainWindow.focus();
  }

  var iconPath = path.join(__dirname, 'assets/check.png');
  appIcon = new Tray(iconPath);
  module.exports.mainWindow = mainWindow;

  // start the timer

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + path.resolve(__dirname,'../index.html'));

  // Open the devtools.
  program.devTools && mainWindow.openDevTools({detached:true});

  mainWindow.setAlwaysOnTop(true);

  var ret = globalShortcut.register('ctrl+e', function() { 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show(); 
  });

  mainWindow.on('close', function(event){
    mainWindow.hide();
  });

  Timer.onTick(function(time, formattedTime){
    appIcon.setTitle(formattedTime);
  });

  Timer.onChange(function(timerState){
      if(timerState === 'pre_pomodoro' || 'pre_break') {
        popupMainWindow();
        appIcon.setTitle(''); 
      }

      if(timerState === 'in_break' || 'in_pomodoro') {
        mainWindow.hide();
      }
  });

  // Emitted when the window is closed.
});