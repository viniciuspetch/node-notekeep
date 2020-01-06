const path = require('path');
const sqlite3 = require('sqlite3');

exports.getAll = function (req, res, next) {
  console.log('Middleware: notes.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  db.all('SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags LEFT JOIN tags WHERE notes.user_id = ? AND notes.id = notes_tags.notes_id AND notes_tags.tags_id = tags.id ORDER BY notes.id', [res.locals.user_id], function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    let currId = null;
    let newRow = null;
    let newTagList = [];
    let newRowList = [];

    console.log(typeof (rows));
    console.log(typeof (newTagList));

    for (let i = 0; i < rows.length; i++) {
      if (currId != rows[i].id) {
        if (currId != null) {
          newRow.tag = newTagList;
          newRowList.push(newRow);
        }
        newTagList = [];
        newRow = {
          id: rows[i].id,
          lastupdated: rows[i].lastupdated
        };
        currId = rows[i].id;
      }
      newTagList.push(rows[i].tag);
    }

    newRow.tag = newTagList;
    newRowList.push(newRow);
    console.log(newRowList);

    res.status(200);
    res.send(newRowList);
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

  let username = res.locals.username;
  let content = req.body.content;

  if (!username) {
    res.sendStatus(500);
    return next();
  }

  if (!content) {
    console.log("Client error: There's no content");
    res.sendStatus(400);
    return next();
  }

  let userId = res.locals.user_id;
  let datetime = Date.now();
  let db = new sqlite3.Database('note.db');

  db.run('INSERT INTO notes(user_id, content, creation, lastupdated) VALUES (?,?,?,?)', [userId, content, datetime, datetime], function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    let tagList = req.body['tags[]'];
    if (typeof (tagList) == 'string') {
      tagList = [tagList];
    }
    let tagListLength = tagList.length;
    let noteId = this.lastID;

    for (let i = 0; i < tagListLength; i++) {
      db.get('SELECT id FROM tags WHERE tag = ? AND user_id = ?', [tagList[i], userId], function (err, row) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
          return;
        }

        if (!row) {
          db.run('INSERT into tags(user_id, tag) VALUES (?, ?)', [userId, tagList[i]], function (err) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }

            let tagId = this.lastID;
            db.run('INSERT into notes_tags(notes_id, tags_id) VALUES (?, ?)', [noteId, tagId], function (err) {
              if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
              }
            });
          })
        } else {
          let tagId = row.id;
          db.run('INSERT into notes_tags(notes_id, tags_id) VALUES (?, ?)', [noteId, tagId], function (err) {
            if (err) {
              console.log(err);
              res.sendStatus(500);
              return;
            }
          });
        }
      });
    }
    res.sendStatus(200);
    return;
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