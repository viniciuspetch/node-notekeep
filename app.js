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
    function note_tag_link(db, noteId, tagId) {
        db.run(`INSERT INTO notes_tags(notes_id, tags_id) VALUES (?, ?)`,
        [noteId, tagId], function (err) {
            if (err) { console.error(err.message); }
            console.log('tagId ' + tagId + ' added to noteId ' + noteId);
        });
    }

    console.log('\n/api/create');

    let db = new sqlite3.Database('note.db');

    let content = req.body.content;
    let tagsString = req.body.tags;
    let datetime = new Date();

    let tags = tagsString.split(','); //new RegExp("/ *[,.;] *")

    db.run(`INSERT INTO notes(content, datetime) VALUES (?, ?)`,
        [content, datetime], function (err) {
        if (err) { console.error(err.message); }
        let noteId = this.lastID;
        console.log('noteId: ' + noteId);

        if (noteId != null) {
            console.log('Adding tags');
            for (i in tags) {
                tag = tags[i];
                console.log('tag: ' + tag);
                db.all(`SELECT * FROM tags WHERE tag = ?`, [tag],
                function (err, rows) {
                    if (err) { console.error(err.message); }
                    if (rows.length == 0) {
                        db.run(`INSERT INTO tags(tag) VALUES (?)`, [tag],
                        function (err) {
                            if (err) { console.error(err.message); }
                            console.log('tag ' + tag + ' created');
                            note_tag_link(db, noteId, this.lastID);
                        });
                    }
                    else {
                        console.log('tag ' + tag + ' already exists');
                        note_tag_link(db, noteId, rows[0].id);
                    }
                });
            }
        }
    });    
    
    if (req.body.red = true) {
        res.redirect('/read');
    }
    else {
        res.json({status: 'Ok'});
    }
});

app.get('/api/read', function(req, res) {
    console.log('\n/api/read');

    let id = req.query.id;
    let db = new sqlite3.Database('note.db');

    if (id === undefined) {
        let noteList;
        db.each(`SELECT * FROM notes`, [], function (err, row) {
            db.all(`SELECT tags.tag FROM notes_tags JOIN tags ON notes_tags.tags_id = tags.id WHERE notes_tags.notes_id = ?`, [row.id], function (err, rows) {
                let note = row;
                note.tags = [];
                for (i in rows) {
                    note.tags.push(rows[i].tag);
                }
                console.log(note);                
            });
        });
    }

    /*
    
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
    */
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