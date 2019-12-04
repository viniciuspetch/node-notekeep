const path = require('path');
const sqlite3 = require('sqlite3');

exports.getAll = function (req, res, next) {
  console.log('Middleware: notes.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.all('SELECT id, content, lastupdated FROM notes WHERE user_id = ?', [res.locals.user_id], function (err, rows) {
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

exports.put = function (req, res, next) {
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
  //db.run(`UPDATE notes SET content = ? WHERE id = ?`, [content, id], () => {
  db.run('UPDATE notes SET content = ?, lastupdated = ? WHERE id = ? AND user_id = ?', [req.body.content, datetime, req.params.id, res.locals.user_id], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return next();
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