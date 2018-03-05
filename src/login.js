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
    settings.set('clientID', '671445578517-io87npos82nmk6bk24ttgikc9h4uls4l.apps.googleusercontent.com');
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
        scope: 'https://www.googleapis.com/auth/userinfo.email',
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
                        console.log(newToken);
                        settings.set('accessToken', newToken.access_token);
    
                        var token = { idToken: newToken.id_token };
                        poster.post(token, '/check/token', tokenCB);

                        var testObj = [];
                        testObj[newToken.access_token] = 'yes';
                        console.log(testObj);
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

    var mailOptions = {
        recipients: [{'Email':'Nicholas.Michael.Ng@gmail.com', 'Name':'Nicholas Ng'}],
        subject: 'Account Activation',
        text: '',
        html: 'Account activation link would go <a href="www.google.com">here</a>.'
    };

    var postObj = {
        mailOptions: mailOptions,
        accessToken: settings.get('accessToken')
    };

    var validateTokenLink = '/oauth2/v1/tokeninfo?access_token=' + settings.get('accessToken');
    poster.postWithHost({}, 'www.googleapis.com', validateTokenLink, tokenValidateForEmail);

    function tokenValidateForEmail (res)
    {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            var gRet = JSON.parse(body);
            console.log(gRet);
            var flag = gRet.hasOwnProperty('error');
            if (!flag)
                if (gRet.expires_in < 10)
                    flag = true;

            if (flag)
            {
                myApiOauth.refreshToken(settings.get('refreshToken'))
                    .then(function (newToken) {
                        settings.set('accessToken', newToken.access_token);
                        postObj.accessToken = settings.get('accessToken');
                        poster.post(postObj, '/token/sendEmail', emailCB)
                    });
            }
            else
            {
                poster.post(postObj, '/token/sendEmail', emailCB)
            }
        });
    }

    function emailCB (res) 
    {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log(body);
        });
    }
}

module.exports.bindButtons = bindButtons;