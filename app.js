let Note = require('./Note.js');
let express = require('express');
let bodyParser = require('body-parser');
let sqlite3 = require('sqlite3');

let app = express();

let router = express.Router();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

    let db = new sqlite3.Database('note.db');
    let id = req.query.id;

    if (id === undefined) {
        db.all(`SELECT notes.id, notes.content, notes.datetime, tags.tag
        FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id
        LEFT JOIN tags ON notes_tags.tags_id = tags.id ORDER BY notes.id`,
        function (err, rows) {
            console.log(rows);
            let init = null;
            let noteList = [];
            let note;
            for (let i = 0; i < rows.length; i++) {
                if (init == null) {
                    init = rows[i].id;
                    note = {
                        id: rows[i].id,
                        content: rows[i].content,
                        datetime: rows[i].datetime,
                        tags: [rows[i].tag],
                    };
                }
                else if (init == rows[i].id) {
                    note.tags.push(rows[i].tag);
                }
                else {
                    init = null;
                    noteList.push(note);
                    i--;
                }
            }
            noteList.push(note);
            console.log(noteList);
            res.send(noteList);
        });
    }
    else {
        db.all(`SELECT notes.id, notes.content, notes.datetime, tags.tag
        FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id
        LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.id = ?`,
        [id], function (err, rows) {
            console.log(rows);
            let note = {
                id: rows[0].id,
                content: rows[0].content,
                datetime: rows[0].datetime,
                tags: [],
            };
            for (let i = 0; i < rows.length; i++) {
                note.tags.push(rows[i].tag);
            }
            res.send(note);
        });
    }    
});

app.post('/api/edit', function(req, res) {
    console.log('\n/api/edit');
    console.log(req.body);

    let db = new sqlite3.Database('note.db');
    let id = req.body.id;
    let content = req.body.content;
    let tags = req.body.tags;
    let newTags = tags.split(',');
    console.log('tags: ' + tags);
    console.log('newTags: ' + newTags);
    
    db.all(`SELECT tags.id, tags.tag FROM notes_tags LEFT JOIN tags
    ON notes_tags.tags_id = tags.id WHERE notes_tags.notes_id = ?`, [id],
    function (err, rows) {
        oldTags = [];
        for (let i = 0; i < rows.length; i++) {
            oldTags.push(rows[i].tag);
        }
        console.log('oldTags: ' + oldTags);
        for (let i = 0; i < newTags.length; i++) {
            if (newTags[i] != null && oldTags.indexOf(newTags[i]) == -1) {
                console.log('insert -> ' + newTags[i]);
                db.run(`INSERT INTO tags(tag) VALUES (?)`, [newTags[i]],
                function(err) {
                    newTagId = this.lastID;
                    db.run(`INSERT INTO notes_tags(notes_id, tags_id)
                    VALUES (?, ?)`, [id, newTagId]);
                })
            }
        }
        for (let i = 0; i < oldTags.length; i++) {
            if (newTags.indexOf(oldTags[i]) == -1) {
                console.log('remove -> ' + oldTags[i]);
                db.run(`DELETE FROM notes_tags WHERE notes_id = ? 
                AND tags_id = ?`, [id, oldTags[i]]);
            }
        }        
    })
    /*
    db.run(`UPDATE notes SET content = ? WHERE id = ?`, [content, id]);
    
    if (req.body.red = true) {
        res.redirect('/read');
    }
    else {
        res.json({status: 'Ok'});
    }
    */
    res.send('fart');
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