var electron = require('electron');
var poster = require('./utils/poster');

var {ipcRenderer} = electron;

var insertBtn = document.getElementById('insert-doctor');
var form = document.getElementById('insert-doctor-form');

insertBtn.addEventListener('click', function (event)
{
    event.preventDefault();
    var fDocName = form[0].value;
    if (fDocName == '')
    {
        console.log('Must enter a doctor\'s name');
        return;
    }

    //Time to POST!! Woo!!
    var postobj = {
        name: fDocName
    };
    console.log('Posting \'' + postobj + '\'');
    poster.post(postobj, '/insert/doctor', InsertCallback);
});

function InsertCallback (res)
{
    //console.log('Status: ' + res.statusCode);
    //console.log('Headers: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
        //console.log('Body: ' + body);
        var resDiv = document.getElementById('insert-doctor-response');
        resDiv.innerHTML = body;
    });
}