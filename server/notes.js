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

exports.getSingle = function (req, res, next) {
  console.log('Middleware: notes.getSingle');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.all('SELECT id, content, lastupdated FROM notes WHERE user_id = ? AND id = ?', [res.locals.user_id, req.params.id], function (err, rows) {
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
  console.log('Middleware: notes.put');
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
  console.log('Middleware: notes.delete');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, res.locals.user_id], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return next();
  });
};