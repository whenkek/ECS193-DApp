const electron = require('electron');
const settings = require('electron-settings');

const ipc = electron.ipcRenderer;

function bind ()
{
    //console.log('Bind');

    document.getElementById('email-send-email').innerHTML = 'Email: ' + settings.get('email');

    document.getElementById('email-send-verify').addEventListener('click', function (event) {
        event.preventDefault();
        ipc.send('email-send-verify', document.getElementById('email-send-password').value);
    });
}

ipc.on('email-send-verify-response', function (err, arg) {
    console.log(arg);
});

module.exports.bind = bind;