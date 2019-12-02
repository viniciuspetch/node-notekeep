const jwt = require('./jwt');
const path = require('path');
const sqlite3 = require('sqlite3');

const jwtSecret = 'nodejs';

exports.webTag = function (req, res) {
  console.log('[ROUTE] /tag GET');
  res.sendFile(path.join(__dirname + '/../public/html/tag.html'));
};

exports.tagGet = function (req, res, next) {
  console.log('Middleware: tagGet');

  let username = res.locals.username;  
  let id = req.params.id;

  if (!username) {
    req.sendStatus(500);
    return;
  }

  if (!id) {
    console.log('here');
    let db = new sqlite3.Database('note.db');
    db.all('SELECT id, tag FROM tags', function (err, rows) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.status(200);
      res.send(rows);
      return;
    });
  } else {
    console.log('/api/tag/:id');
    let db = new sqlite3.Database('note.db');
    db.get('SELECT id, tag FROM tags WHERE id=?', [id], function (err, row) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.status(200);
      res.send(row);
      return;
    });
  }
}

exports.tagPost = function (req, res, next) {
  console.log('\n[ROUTE] /api/tag POST');
  let token = null;
  if (req.headers['authorization']) {
    token = req.headers['authorization'].split(' ')[1];
  }
  console.log('[VAR] token');
  let jwtResult = jwt.verifyJWT(token, jwtSecret);
  if (!jwtResult) {
    console.log('LOG: JWT Verification failed');
    res.json({
      result: false,
      status: 'JWT Verification failed'
    });
    return;
  }
  let username = jwtResult.username;
  console.log('[VAR] username: ' + username);
  if (!username) {
    console.log('LOG: No username found');
    res.json({
      result: false,
      status: 'No username found'
    });
    return;
  }

  tag = req.body.tag;

  let db = new sqlite3.Database('note.db');
  db.run(`INSERT INTO tags(tag) VALUES (?)`, [tag], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    //console.log(this.lastID);
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

exports.tagPut = function (req, res, next) {
  console.log('\n[ROUTE] /api/tag/:id PUT');
  res.sendStatus(200);
  return next();
}

exports.tagDelete = function (req, res, next) {
  console.log('\n[ROUTE] /api/tag/:id DELETE');
  res.sendStatus(200);
  return next();
}