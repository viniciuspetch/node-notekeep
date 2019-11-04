let Note = require('./Note.js');
let express = require('express');
let bodyParser = require('body-parser');
let sqlite3 = require('sqlite3');

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
    console.log('/api/create');

    let db = new sqlite3.Database('note.db');

    let content = req.body.content;
    let tagsString = req.body.tags;
    let datetime = new Date();

    let tags = tagsString.split(','); //new RegExp("/ *[,.;] *")

    console.log('before db');

    db.run(`INSERT INTO notes(content, datetime) VALUES (?, ?)`, [content, datetime], function (err) {
        if (err) { console.error(err.message); }
        console.log('during db');
    });

    console.log('after db');

    db.close();

    res.send('done');
    /*
    console.log('noteId: ' + noteId);
    if (noteId != null) {
        for (i in tags) {
            console.log('i: ' + i);
            console.log(typeof(i));
            tag = tags[i];
            console.log('tag: ' + tag);
            db.all(`SELECT * FROM tags WHERE tag = ?`, [tag], (err, rows) => {
                if (err) { console.error(err.message); }
                console.log(rows);
                let tagId = null;
                if (rows.length == 0) {
                    db.run(`INSERT INTO tags(tag) VALUES (?)`, [tag], (err) => {
                        if (err) { console.error(err.message); }
                        console.log('New tag created');
                        tagId = this.lastId;
                    });
                }
            });
        }
    }

    //newNote = new Note(noteController, content, tags, datetime);

    //noteList.push(newNote);
    //console.log(newNote);

    res.send('/api/create');
    if (req.body.red = true) {
        //res.redirect('/read');
    }
    else {
        //res.json(newNote);
        //res.send('/api/create');
    }
    */
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