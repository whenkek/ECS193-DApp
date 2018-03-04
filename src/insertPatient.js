var electron = require('electron');
var poster = require('./utils/poster');

var {ipcRenderer} = electron;

var doctorSelect = document.getElementById('insert-patient-doctor-select');
var insertBtn = document.getElementById('insert-patient');
var form = document.getElementById('insert-patient-form');
var sectionBtn = document.getElementById('button-insert-patient');

insertBtn.addEventListener('click', function (event)
{
    event.preventDefault();
    var fEmail = form[0].value;
    var fDocName = form[1].value;
    var fParamVal = form[2].value;
    if (fEmail == '')
    {
        console.log('Must enter an email.');
        return;
    }
    if (fDocName == '' || fDocName == 'NULL')
    {
        console.log('Must use a valid doctor.');
        return;
    }
    if (fParamVal == '')
    {
        console.log('Param is not a valid number.');
        return;
    }

    var postobj = {
        email: fEmail,
        doctor: fDocName,
        param: fParamVal
    };
    poster.post(postobj, '/insert/patient', InsertCallback);
});

function InsertCallback (res)
{
    res.setEncoding('utf8');
    res.on('data', function (body) {
        var resDiv = document.getElementById('insert-patient-response');
        resDiv.innerHTML = body;
    });
}

sectionBtn.addEventListener('click', GatherDoctorList);
function GatherDoctorList ()
{
    var postobj = {};
    poster.post(postobj, '/fetch/doctors', function (res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            doctorSelect.innerHTML = '';

            var opt = document.createElement('option');
            opt.value = 'NULL';
            opt.innerHTML = '--Select--';
            doctorSelect.appendChild(opt);

            var dlist = JSON.parse(body);
            Array.prototype.forEach.call(dlist, function (d) {
                var opt = document.createElement('option');
                opt.value = d;
                opt.innerHTML = d;
                doctorSelect.appendChild(opt);
            });
        });
    });
}