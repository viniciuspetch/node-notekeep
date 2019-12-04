const path = require('path');
const sqlite3 = require('sqlite3');

exports.web = function (req, res) {
  console.log('Webpage: tag');
  res.sendFile(path.join(__dirname + '/../public/html/tag.html'));
};

exports.getAll = function (req, res, next) {
  console.log('Middleware: tags.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.all('SELECT id, tag FROM tags WHERE user_id = ?', [res.locals.user_id], function (err, rows) {
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
  console.log('Middleware: tags.getSingle');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.get('SELECT id, tag FROM tags WHERE id = ? AND user_id = ?', [req.params.id, res.locals.user_id], function (err, row) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200);
    res.send(row);
    return next();
  });
};

exports.post = function (req, res, next) {
  console.log('Middleware: tags.post');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');

  db.run(`INSERT INTO tags(user_id, tag) VALUES (?, ?)`, [res.locals.user_id, req.body.tag], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    db.get('SELECT * FROM tags WHERE id = ?', [this.lastID], function (err, row) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.status(200);
      res.send(row);
      return;
    });
  });
}

exports.put = function (req, res, next) {
  console.log('Middleware: tags.put');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');

  db.run('UPDATE tags SET tag = ? WHERE id = ? and user_id = ?', [req.body.tag, req.params.id, res.locals.user_id], function (err, row) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return;
  });
}

exports.delete = function (req, res, next) {
  console.log('Middleware: tags.delete');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');

  db.run('UPDATE tags SET tag = ? WHERE id = ? and user_id = ?', [req.body.tag, req.params.id, res.locals.user_id], function (err, row) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return;
  });
}