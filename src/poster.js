var http = require('http');

function post (postobj, postpath)
{
    var options = {
        hostname: 'majestic-legend.requestcatcher.com',
        port: 80,
        path: postpath,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    var req = http.request(options, function(res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log('Body: ' + body);
        });
    });
    req.on('error', function(err) {
        console.log('problem with request: ' + err.message);
    });
    req.write(JSON.stringify(postobj));
    req.end();
}

module.exports.post = post;