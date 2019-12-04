const path = require('path');
const sqlite3 = require('sqlite3');

exports.getAll = function (req, res, next) {
  console.log('Middleware: notes.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.all('SELECT content, lastupdated FROM notes WHERE user_id = ?', [res.locals.user_id], function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200);
    res.send(rows);
    return next();
  });
};

exports.post = function (req, res, next) {
  console.log('Middleware: notes.post');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  if (!req.body.content) {
    console.log("Client error: There's no content");
    res.sendStatus(400);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  let datetime = Date.now();
  db.run('INSERT INTO notes(user_id, content, creation, lastupdated) VALUES (?,?,?,?)', [res.locals.user_id, req.body.content, datetime, datetime], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return next();
  });
}

/*
exports.post = function (req, res, next) {
  function note_tag_link(db, noteId, tagId) {
    db.run(`INSERT INTO notes_tags(notes_id, tags_id) VALUES (?, ?)`, [noteId, tagId], function (err) {
      if (err) {
        console.error(err.message);
      }
      console.log('tagId ' + tagId + ' added to noteId ' + noteId);
    });
  }

  console.log('\nROUTE: /api/create POST');
  let token = req.headers['authorization'].split(' ')[1];
  let jwtResult = jwt.verifyJWT(token, jwtSecret);

  if (!jwtResult) {
    console.log('[LOG]\tJWT Verification failed');
    res.status(401);
    res.send('JWT Verification failed');
    return;
  }

  let username = jwtResult.username;
  console.log('[VAR] username: ' + username);

  if (!username) {
    console.log('[LOG]\tJWT does not contain username');
    res.status(401);
    res.send('JWT does not contain username');
    return;
  }

  let db = new sqlite3.Database('note.db');

  // Searching for user with this username
  db.get('SELECT id FROM user_acc WHERE usrn = ?', [username], function (err, row) {
    if (!row) {
      console.log('No user found');
      res.redirect('/login');
      return;
    }
    let userId = row.id;
    let content = req.body.content;
    let tags = req.body.tags.split(','); //new RegExp("/ *[,.;] *")     
    let datetime = Date.now();

    // Check for empty content
    if (!content) {
      console.log('LOG: Note content is empty');
      res.json({
        result: false,
        reason: 'contentEmpty'
      });
      return;
    }

    // Check for tags with invalid characters
    for (let i = 0; i < tags.length; i++) {
      if (!isAlphaNumeric(tags[i])) {
        console.log('LOG: Tag has invalid characters');
        res.json({
          result: false,
          reason: 'tagInvalidCharacter'
        });
        return;
      }
    }

    console.log('userId: ' + userId);
    console.log('content: ' + content);
    console.log('datetime: ' + datetime);
    console.log('tags: ' + tags);

    // Inserting note into DB
    db.run(`INSERT INTO notes(user_id, content, creation, lastupdated) VALUES (?,?,?,?)`, [userId, content, datetime, datetime], function (err) {
      let noteId = this.lastID;
      console.log('noteId: ' + noteId);

      if (noteId != null) {
        console.log('Note created');
        console.log('Adding tags');
        for (let i in tags) {
          let tag = tags[i];
          console.log('tag: ' + tag);

          db.all(`SELECT * FROM tags WHERE tag = ?`, [tag], function (err, rows) {
            if (rows.length == 0) {
              db.run(`INSERT INTO tags(tag) VALUES (?)`, [tag], function (err) {
                if (err) {
                  console.error(err.message);
                }
                console.log('tag ' + tag + ' created');
                note_tag_link(db, noteId, this.lastID);
              });
            } else {
              console.log('tag ' + tag + ' already exists');
              note_tag_link(db, noteId, rows[0].id);
            }
          });
        }
      }
      res.json({
        result: true
      });
      return;
    });
  });
};

exports.put = function (req, res, next) {
  console.log('\nROUTE: /api/note PUT');

  let db = new sqlite3.Database('note.db');
  let id = req.params.id;
  let content = req.body.content;
  let tags = req.body.tags;
  let newTags = tags.split(',');
  let token = req.headers['authorization'].split(' ')[1];
  console.log(content);
  console.log(tags);


  let jwtResult = jwt.verifyJWT(token, jwtSecret);

  if (!jwtResult) {
    console.log('LOG: JWT Verification failed');
    res.json({
      result: false,
      reason: 'JWTVerificationFailed'
    });
    return;
  }

  let username = jwtResult.username;
  console.log('VAR: username: ' + username);

  if (!username) {
    console.log('LOG: No username found');
    res.json({
      result: false,
      status: 'usernameNotFound'
    });
    return;
  }

  // Check for empty content
  if (!content) {
    console.log('LOG: Note content is empty');
    res.json({
      result: false,
      reason: 'contentEmpty'
    });
    return;
  }

  // Check for tags with invalid characters
  for (let i = 0; i < tags.length; i++) {
    if (!isAlphaNumeric(tags[i])) {
      console.log('LOG: Tag has invalid characters');
      res.json({
        result: false,
        reason: 'tagInvalidCharacter'
      });
      return;
    }
  }

  db.get('SELECT id FROM user_acc WHERE usrn = ?', [username], function (err, row) {
    if (!row) {
      console.log('No user found');
      res.json({
        result: false,
        status: 'userNotFound'
      });
      return;
    }
    db.all(`SELECT tags.id, tags.tag FROM notes_tags LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes_tags.notes_id = ?`, [id], function (err, rows) {
      let oldTags = [];
      for (let i = 0; i < rows.length; i++) {
        oldTags.push(rows[i].tag);
      }
      console.log('oldTags: ' + oldTags);
      for (let i = 0; i < newTags.length; i++) {
        if (newTags[i] != null && newTags[i] != '' && oldTags.indexOf(newTags[i]) == -1) {
          console.log('insert -> ' + newTags[i]);
          db.run(`INSERT INTO tags(tag) VALUES (?)`, [newTags[i]],
            function () {
              let newTagId = this.lastID;
              db.run(`INSERT INTO notes_tags(notes_id, tags_id) VALUES (?, ?)`, [id, newTagId]);
            })
        }
      }
      for (let i = 0; i < oldTags.length; i++) {
        if (newTags.indexOf(oldTags[i]) == -1) {
          console.log('remove -> ' + oldTags[i]);
          db.run(`DELETE FROM notes_tags WHERE notes_id = ? AND tags_id = ?`, [id, oldTags[i]]);
        }
      }
    })

    db.run(`UPDATE notes SET content = ? WHERE id = ?`, [content, id], () => {
      console.log('updated');
    });
    res.json({
      status: 'Ok'
    });
    return;
  });
};

exports.delete = function (req, res, next) {
  console.log('\n[ROUTE]\t/api/note DELETE');

  let token = req.headers['authorization'].split(' ')[1];
  let id = req.params.id;
  let jwtResult = jwt.verifyJWT(token, jwtSecret);

  console.log('[VAR]\ttoken: ' + token);
  console.log('[VAR]\tid: ' + id);
  console.log('[VAR]\tjwtResult: ' + jwtResult);

  if (!jwtResult) {
    console.log('[LOG]\tJWT Verification failed');
    res.status(401);
    res.send('JWT Verification failed');
    return;
  }

  let username = jwtResult.username;
  console.log('[VAR] username: ' + username);

  if (!username) {
    console.log('[LOG]\tJWT does not contain username');
    res.status(401);
    res.send('JWT does not contain username');
    return;
  }

  let db = new sqlite3.Database('note.db');
  db.get(`SELECT id FROM user_acc WHERE usrn = ?`, [username], function (err, row) {
    if (!row) {
      console.log('[LOG]\tUsername does not exist');
      res.status(401);
      res.send('Username does not exist');
      //res.redirect('/login');
      return;
    }

    if (!id) {
      console.log('LOG: Note ID is empty');
      res.json({
        result: false,
        reason: 'idEmpty'
      });
      return;
    }

    db.run(`DELETE FROM notes WHERE id = ?`, [id], function () {
      db.run(`DELETE FROM notes_tags WHERE notes_id = ?`, [id],
        function () {
          console.log('[LOG]\tNote deleted');
          res.sendStatus(200);
          return;
        });
    });
  });
};
*/