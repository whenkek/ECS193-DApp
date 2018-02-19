var electron = require('electron');
var path = require('path');
var url = require('url');

var {app, BrowserWindow, Menu} = electron;

app.setName('Electron Test');

var win = null;

app.on('ready', function ()
{
    win = new BrowserWindow({
        width: 1080,
        height: 720,
        title: app.getName()
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.show();

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    //if (process.env.NODE_ENV != 'production')
    //    win.toggleDevTools();

    win.on('closed', function()
    {
        app.quit();
    });
});

app.on('window-all-closed', function ()
{
    app.quit();
});

var template = [{}];

if (process.platform == 'darwin')
    template.unshift({});

if (process.env.NODE_ENV != 'production')
{
    template.push({
        label: 'Developer Tools',
        submenu: [{
            label: 'Toggle DevTools',
            accelerator: 'CmdOrCtrl+I',
            click(item, focusedWindow){
                focusedWindow.toggleDevTools();
            }
        }]
    });
}