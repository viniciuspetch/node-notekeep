let Note = require('./Note.js');
let express = require('express');
let bodyParser = require('body-parser');
let sqlite = require('sqlite3');

let app = express();

let router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

noteList = [];
noteController = {
    lastCreatedId: null,
    nextCreatedId: 0,
    lastReadId: null,
};

app.get('/', function(req, res) {
    res.sendFile(__dirname+'/public/index.html');
});

app.get('/create', function(req, res) {
    res.sendFile(__dirname+'/public/create.html');
});

app.get('/read', function(req, res) {
    res.sendFile(__dirname+'/public/read.html');
});

app.get('/edit/:id', function(req, res) {
    let id = req.params.id;
    res.sendFile(__dirname+'/public/edit.html');
});

app.post('/api/create', function(req, res) {
    console.log(req.body);

    let content = req.body.content;
    let tags = req.body.tags;
    let datetime = new Date();
    newNote = new Note(noteController, content, tags, datetime);
    noteList.push(newNote);
    console.log(newNote);

    if (req.body.red = true) {
        res.redirect('/read');
    }
    else {
        res.json(newNote);
    }
});

app.get('/api/read', function(req, res) {
    console.log('/api/read');
    let id = req.query.id;
    console.log(id);

    if (id === undefined) {
        console.log('Returning list of all notes');
        result = noteList;
    }
    else {
        console.log('Returning specific note - id: ' + id);
        result = noteList[id];
    }

    res.send(result);
});

app.post('/api/edit', function(req, res) {
    console.log('/api/edit');
    console.log(req.body);

    let id = req.body.id;
    let content = req.body.content;
    let tags = req.body.tags;
    let datetime = new Date();

    let getNote = noteList.find(note => note.id == id);
    console.log(getNote);
    getNote.content = content;
    getNote.tags = tags;
    getNote.datetime = datetime;

    console.log(getNote);

    if (req.body.red = true) {
        res.redirect('/read');
    }
    else {
        res.json(getNote);
    }
});

app.post('/api/delete', function(req, res) {
    console.log('api/delete');

    let id = req.body.id;

    let getNote = noteList.find(note => note.id == id);
    console.log(getNote);

    res.send('Deleted, dude');
});

app.listen(8000, function() {
    console.log('Ready');
});