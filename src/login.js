const electronOauth2 = require('electron-oauth2');
const poster = require('./utils/poster.js');
const indexImporter = require('../assets/imports.js');
const settings = require('electron-settings');
const nodemailer = require('nodemailer');
const electron = require('electron');
const url = require('url');
const path = require('path');

const BrowserWindow = electron.remote.BrowserWindow;
const ipc = electron.remote.ipcMain;

var myApiOauth = null;

function bindButtons ()
{
    //console.log('Bind');
    document.getElementById('button-oauth-signin').addEventListener('click', signIn);
    document.getElementById('button-test-email').addEventListener('click', testEmail);
}

function signIn ()
{
    settings.set('clientID', '671445578517-ju2jvd1beiofp9qqddn3cn6ai1dehmru.apps.googleusercontent.com');
    var config = {
        clientId: settings.get('clientID'),
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://www.googleapis.com/oauth2/v4/token',
        useBasicAuthorizationHeader: false,
        redirectUri: 'http://localhost'
    };

    const windowParams = {
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        }
    }

    const options = {
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send',
        accessType: 'offline'
    };

    try {
        myApiOauth = electronOauth2(config, windowParams);

        myApiOauth.getAccessToken(options)
            .then(function (token) {
                // use your token.access_token 
                console.log(token);
                settings.set('refreshToken', token.refresh_token);
    
                myApiOauth.refreshToken(token.refresh_token)
                    .then(function (newToken) {
                        //use your new token
                        settings.set('accessToken', newToken.access_token);
    
                        var token = { idToken: newToken.id_token };
                        poster.post(token, '/check/token', tokenCB);
                    });
            });
    }
    catch (e) {
        console.log(e);
    }
}

function tokenCB (res)
{
    res.setEncoding('utf8');
    res.on('data', function (body) {
        console.log(body);
        var resObj = JSON.parse(body);
        settings.set('email', resObj.email);
        settings.set('accType', resObj.accType);
        settings.set('name', resObj.name);
        indexImporter.loadImports();
    });
}

var verifyWindow = null;
function testEmail ()
{
    if (settings.get('email') == 'NULL')
    {
        console.log('Not logged in');
        return;
    }

    var w = 800;
    var h = 600;

    verifyWindow = new BrowserWindow({
        width: w,
        height: h,
        minWidth: w,
        minHeight: h,
        maxWidth: w,
        maxHeight: h,
        alwaysOnTop: true,
        autoHideMenuBar: true
    });
    verifyWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/../view/popups/emailSend.html'),
        protocol: 'file:',
        slashes: true
    }));
    verifyWindow.show();
    verifyWindow.on('closed', function()
    {
        verifyWindow = null;
    });
}

var emailEvent = null;
ipc.on('email-send-verify', function (event, arg) {
    //console.log(arg);

    emailEvent = event;

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth : {
            user: settings.get('email'),
            pass: arg
        }
    });

    var mailOptions = {
        from: '"' + settings.get('name') + '" <' + settings.get('email') + '>',
        to: 'huhuang@ucdavis.edu',
        subject: 'Account Activation',
        html: 'Account activation link would go <a href="www.google.com">here</a>.'
    };

    transporter.sendMail(mailOptions, function (err, info) {
        arg = null;
        if (err)
            emailEvent.sender.send('email-send-verify-response', 'Error');
        else
            emailEvent.sender.send('email-send-verify-response', 'Success');
    });
});

module.exports.bindButtons = bindButtons;