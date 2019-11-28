const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('./server/jwt');
const jwtSecret = 'nodejs';

function isAlphaNumeric(str) {
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

let webGetLogin = function (req, res) {
  console.log('\n/login GET');
  res.sendFile(__dirname + '/public/html/login.html');
};

let webGetSignup = function (req, res) {
  console.log('\n/signup GET');
  res.sendFile(__dirname + '/public/html/signup.html');
};

let webGetSignout = function (req, res) {
  console.log('\n/signout GET');
  res.sendFile(__dirname + '/public/html/signout.html');
};

let webGetIndex = function (req, res) {
  console.log('\n/index GET');
  res.sendFile(__dirname + '/public/html/index.html');
};

let webGetCreate = function (req, res) {
  console.log('\n/create GET');
  res.sendFile(__dirname + '/public/html/create.html');
};

let webGetRead = function (req, res) {
  console.log('\n/read GET');
  res.sendFile(__dirname + '/public//html/read.html');
};

let webGetEdit = function (req, res) {
  console.log('\n/edit/:id GET');
  res.sendFile(__dirname + '/public/html/edit.html');
};

let apiPostLogin = function (req, res) {
  console.log('\nROUTE: /login POST');

  let db = new sqlite3.Database('note.db');
  let username = req.body.username;
  let password = req.body.password;
  console.log('VAR: username: ' + username);
  console.log('VAR: password: ' + password);

  // Check empty fields
  if (!username) {
    res.json({
      result: false
    });
    return;
  }
  if (!password) {
    res.json({
      result: false
    });
    return;
  }

  db.get(`SELECT pswd FROM user_acc WHERE usrn="${username}"`, function (err, row) {
    // Check if username exists
    if (row == undefined) {
      res.json({
        result: false,
        reason: 'usernameNotFound'
      });
      return;
    }

    // Check password
    console.log('LOG: Username found');
    let hash = row.pswd;
    console.log('VAR: hash: ' + hash);
    let compareRes = bcrypt.compareSync(password, hash);
    console.log('VAR: compareRes: ' + compareRes);
    if (!compareRes) {
      res.json({
        result: false,
        reason: 'wrongPassword'
      });
      return;
    }

    // Return token
    console.log('LOG: Username verified');
    let token = jwt.newJWT(username, jwtSecret);
    console.log('VAR: token: ' + token);
    res.json({
      result: true,
      token
    });
    return;
  });
};

let apiPostSignup = function (req, res) {
  console.log('\nROUTE: /api/signup POST');
  console.log(req.body);

  let db = new sqlite3.Database('note.db');
  let username = req.body.username;
  let password = req.body.password;
  let hash = bcrypt.hashSync(password, 5);
  let datetime = Date.now();

  console.log(username);
  console.log(datetime);

  // Check empty username
  if (!username) {
    console.log('LOG: Username is empty');
    res.json({
      result: false,
      reason: 'emptyUsername'
    });
    return;
  }
  // Check empty password
  if (!password) {
    console.log('LOG: Password is empty');
    res.json({
      result: false,
      reason: 'emptyPassword'
    });
    return;
  }
  if (username.length > 32) {
    console.log('LOG: Username is too long');
    res.json({
      result: false,
      reason: 'usernameTooLong'
    });
    return;
  }
  if (password.length > 32) {
    console.log('LOG: Password is too long');
    res.json({
      result: false,
      reason: 'passwordTooLong'
    });
    return;
  }
  if (password.length < 4) {
    console.log('LOG: Password is too short');
    res.json({
      result: false,
      reason: 'passwordTooShort'
    });
    return;
  }
  if (!isAlphaNumeric(username)) {
    console.log('LOG: Username has invalid characters');
    res.json({
      result: false,
      reason: 'usernameInvalidCharacters'
    });
    return;
  }
  if (!isAlphaNumeric(password)) {
    console.log('LOG: Password has invalid characters');
    res.json({
      result: false,
      reason: 'passwordInvalidCharacters'
    });
    return;
  }

  db.get(`SELECT usrn FROM user_acc WHERE usrn="${username}"`, function (err, row) {
    // Check if username is already used
    if (row != undefined) {
      console.log('Username already exists');
      res.json({
        result: false,
        reason: 'usernameExists'
      });
      return;
    }
    // Otherwise, create a new account
    db.run(`INSERT INTO user_acc(usrn, pswd, creation, lastupdated) VALUES ("${username}", "${hash}", "${datetime}", "${datetime}")`, function () {
      console.log('Username created');
      res.json({
        result: true
      });
      return;
    });
  });
};

let apiPostCreate = function (req, res) {
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
  db.get(`SELECT id FROM user_acc WHERE usrn = "${username}"`, function (err, row) {
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
}

let apiPostRead = function (req, res) {
  console.log('\nROUTE: /api/read POST');

  console.log(req.headers['authorization']);
  let token = req.headers['authorization'].split(' ')[1];
  console.log('VAR: token: ' + token);

  let id = req.body.id;
  let jwtResult = jwt.verifyJWT(token, jwtSecret);
  let username = jwtResult.username;

  if (!jwtResult) {
    console.log('LOG: JWT Verification failed');
    res.json({
      result: false,
      status: 'JWT Verification failed'
    });
    return;
  }
  if (!username) {
    console.log('LOG: No username found');
    res.json({
      result: false,
      status: 'No username found'
    });
    return;
  }

  let db = new sqlite3.Database('note.db');

  db.get(`SELECT id FROM user_acc WHERE usrn = "${username}"`, function (err, row) {
    if (row == undefined) {
      console.log('No user found');
      res.json({
        result: false,
        status: 'userNotFound'
      });
      return;
    }
    let userid = row.id;
    console.log('id: ' + id);
    console.log('token:' + token);
    console.log('username: ' + username);
    console.log('userid: ' + userid);

    if (id === undefined) {
      db.all(`SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = ${userid} ORDER BY notes.id`, function (err, rows) {
        console.log(rows);
        let init = null;
        let noteList = [];
        let note;
        for (let i = 0; i < rows.length; i++) {
          if (init == null) {
            init = rows[i].id;
            note = {
              id: rows[i].id,
              tags: [rows[i].tag],
              content: rows[i].content,
              lastupdated: rows[i].lastupdated,
            };
          } else if (init == rows[i].id) {
            note.tags.push(rows[i].tag);
          } else {
            init = null;
            noteList.push(note);
            i--;
          }
        }
        noteList.push(note);
        console.log(noteList);
        res.send(noteList);
      });
    } else {
      db.all(`SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.id = ?`, [id], function (err, rows) {
        console.log(rows);
        let note = {
          id: rows[0].id,
          content: rows[0].content,
          lastupdated: rows[0].lastupdated,
          tags: [],
        };
        for (let i = 0; i < rows.length; i++) {
          note.tags.push(rows[i].tag);
        }
        res.send(note);
        return;
      });
    }
  });
};

let apiPostEdit = function (req, res) {
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

  db.get(`SELECT id FROM user_acc WHERE usrn = "${username}"`, function (err, row) {
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

let apiDeleteNote = function (req, res, next) {
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

let app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', webGetIndex);
app.get('/login', webGetLogin);
app.get('/signup', webGetSignup);
app.get('/signout', webGetSignout);
app.get('/create', webGetCreate);
app.get('/read', webGetRead);
app.get('/edit/:id', webGetEdit);

app.post('/api/login', apiPostLogin);
app.post('/api/signup', apiPostSignup);

app.get('/api/read', apiPostRead);
app.post('/api/read', apiPostRead);

app.post('/api/note', apiPostCreate);
app.put('/api/note/:id', apiPostEdit);
app.delete('/api/note/:id', apiDeleteNote);

app.listen(8000, function () {
  console.log('Ready');
});