let express = require('express');
let bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.json());

noteList = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/create', function(req, res) {
    res.sendFile(__dirname+'/public/create.html');
});

app.get('/read', function(req, res) {
    res.sendFile(__dirname+'/public/read.html');
});

app.get('/api/create', function(req, res) {
    let id = req.body.id;
    let content = req.body.content;
    let result;

    if (id === undefined) {
        //res.redirect('/create');
        //res.sendStatus(404);
        res.send('No ID specified');
        console.log('No ID specified');
    }
    else if (id <= 0) {
        //res.sendStatus(404);
        res.send('ID out of range');
    }
    else if (noteList[id] !== undefined) {
        //res.sendStatus(404);
        res.send('ID already exists');
    }
    else if (content === undefined) {
        //res.sendStatus(404);
        res.send('No content specified');
    }
    else {
        noteList[id] = {
            content: content,
        };
        //res.redirect('/api/create');
        //res.sendStatus(200);
        res.send("Content created");
    }
});

app.get('/api/read', function(req, res) {
    let id = req.query.id;

    if (id === undefined) {
        result = noteList;
    }
    else {
        result = noteList[id];
    }

    res.send(result);
});

app.listen(8000, function() {
    console.log('Ready');
});