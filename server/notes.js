const path = require('path');
const sqlite3 = require('sqlite3');

exports.getAll = function (req, res, next) {
  console.log('Middleware: notes.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  //let query = 'SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags LEFT JOIN tags WHERE notes.user_id = ? AND notes.id = notes_tags.notes_id AND notes_tags.tags_id = tags.id ORDER BY notes.id, tags.id';
  let query = 'SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = ? ORDER BY notes.id, tags.id';
  db.all(query, [res.locals.user_id], function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    let currId = null;
    let newRow = null;
    let newTagList = [];
    let newRowList = [];
    if (rows.length > 0) {
      newRow = {
        id: rows[0].id,
        content: rows[0].content,
        lastupdated: rows[0].lastupdated,
      };
      if (rows[0].tag != null) {
        newTagList.push(rows[0].tag);
      }
      currId = rows[0].id;
      for (let i = 1; i < rows.length; i++) {
        if (currId != rows[i].id) {
          newRow.tag = newTagList;
          newRowList.push(newRow);
          newTagList = [];
          newRow = {
            id: rows[i].id,
            content: rows[i].content,
            lastupdated: rows[i].lastupdated,
          };
          currId = rows[i].id;
        }
        if (rows[i].tag != 'null') {
          newTagList.push(rows[i].tag);
        }
      }
      newRow.tag = newTagList;
      newRowList.push(newRow);
    }

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
  db.all('SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags LEFT JOIN tags WHERE notes.user_id = ? AND notes.id = notes_tags.notes_id AND notes_tags.tags_id = tags.id AND notes.id = ? ORDER BY notes.id, tags.id', [res.locals.user_id, req.params.id], function (err, rows) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    let newTagList = []
    for (let i = 0; i < rows.length; i++) {
      newTagList.push(rows[i].tag);
    }
    let newRow = {
      id: rows[0].id,
      content: rows[0].content,
      lastupdated: rows[0].lastupdated,
      tag: newTagList,
    };


    console.log(newRow);

    res.status(200);
    res.send(newRow);
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
  console.log('\nMiddleware: notes.put');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  if (!req.body.content) {
    console.log("Client error: There's no content");
    res.sendStatus(400);
    return next();
  }

  let userId = res.locals.user_id;
  let noteId = req.params.id;

  console.log('userId: ' + userId);
  console.log('noteId: ' + noteId);

  let db = new sqlite3.Database('note.db');
  let datetime = Date.now();
  // Update the note
  db.run('UPDATE notes SET content = ?, lastupdated = ? WHERE id = ? AND user_id = ?', [req.body.content, datetime, noteId, userId], function (err) {
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
    console.log('List of tags:' + tagList);
    console.log('Number of tags:' + tagListLength);

    // Delete all notes-tags relationship entries for the edited note
    db.run('DELETE FROM notes_tags WHERE notes_id = ?', [noteId], function (err) {
      console.log('Delete note-tag relationship');
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      // For each received tag, get its ID
      for (let i = 0; i < tagListLength; i++) {
        db.get('SELECT id FROM tags WHERE tag = ? AND user_id = ?', [tagList[i], userId], function (err, row) {
          console.log('Get tag');
          if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
          }
          // If it doesn't exist, insert it and then create the relationship
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
          }
          // Otherwise, just add the relationship
          else {
            let tagId = row.id;
            db.run('INSERT into notes_tags(notes_id, tags_id) VALUES (?, ?)', [noteId, tagId], function (err) {
              if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
              }
            });
          }
        })
      };
    });
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

    // Delete all notes-tags relationship entries for the edited note
    db.run('DELETE FROM notes_tags WHERE notes_id = ?', [req.params.id], function (err) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
      return next();
    });
  });
};