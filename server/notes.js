const { Client } = require("pg");
require("dotenv").config();

function getAllURL(string) {
  let listURLs = [];
  stringSplit = string.split(" ");
  for (let i in stringSplit) {
    if (stringSplit[i].search("[.]") != -1) {
      listURLs.push(stringSplit[i]);
    }
  }
  return listURLs;
}

exports.getAll = function(req, res, next) {
  console.log("Middleware: notes.getAll");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
  }
  client
    .connect()
    .then(() => {
      client.query(
        "SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = $1 ORDER BY notes.id, tags.id",
        [res.locals.user_id],
        function(err, queryRes) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            client.end();
            return;
          }

          let currId = null;
          let newRow = null;
          let newTagList = [];
          let newRowList = [];
          if (queryRes.rows.length > 0) {
            newRow = {
              id: queryRes.rows[0].id,
              content: queryRes.rows[0].content,
              lastupdated: queryRes.rows[0].lastupdated,
              listURLs: getAllURL(queryRes.rows[0].content)
            };
            if (queryRes.rows[0].tag != null) {
              newTagList.push(queryRes.rows[0].tag);
            }
            currId = queryRes.rows[0].id;
            for (let i = 1; i < queryRes.rows.length; i++) {
              if (currId != queryRes.rows[i].id) {
                newRow.tag = newTagList;
                newRowList.push(newRow);
                newTagList = [];
                newRow = {
                  id: queryRes.rows[i].id,
                  content: queryRes.rows[i].content,
                  lastupdated: queryRes.rows[i].lastupdated,
                  listURLs: getAllURL(queryRes.rows[i].content)
                };
                currId = queryRes.rows[i].id;
              }
              if (queryRes.rows[i].tag != "null") {
                newTagList.push(queryRes.rows[i].tag);
              }
            }
            newRow.tag = newTagList;
            newRowList.push(newRow);
          }
          res.status(200);
          res.send(newRowList);
          client.end();
          return next();
        }
      );
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
      client.end();
      return;
    });
};

exports.getSingle = function(req, res, next) {
  console.log("Middleware: notes.getSingle");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
  }
  client
    .connect()
    .then(() => {
      client.query(
        "SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = $1 AND notes.id = $2 ORDER BY notes.id, tags.id",
        [res.locals.user_id, req.params.id],
        function(err, queryRes) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            client.end();
            return;
          }

          let newTagList = [];
          for (let i = 0; i < queryRes.rows.length; i++) {
            newTagList.push(queryRes.rows[i].tag);
          }
          let newRow = {
            id: queryRes.rows[0].id,
            content: queryRes.rows[0].content,
            lastupdated: queryRes.rows[0].lastupdated,
            tag: newTagList
          };
          res.status(200);
          res.send(newRow);
          client.end();
          return next();
        }
      );
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
      client.end();
      return;
    });
};

exports.post = function(req, res, next) {
  console.log("Middleware: notes.post");

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

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
  }

  let noteId = null;
  let tagIdList = [];
  let tagContentList = [];

  client
    .connect()
    .then(() =>
      client.query(
        "INSERT INTO notes(user_id, content) VALUES ($1, $2) RETURNING id",
        [userId, content]
      )
    )
    .then(r => {
      // Transform string of tags into a list
      tagContentList = req.body["tags[]"];
      if (typeof tagContentList == "string") tagContentList = [tagContentList];
      // Get id of the new note
      noteId = r.rows[0].id;
      // Prepare query variables
      queryArray = [...tagContentList];
      // Create list of string markers
      let param = queryArray.map(function(item, index) {
        return "$" + (index + 2);
      });
      // Add userId to be $1
      queryArray.unshift(userId);
      // Run query to select all tags that already exist
      return client.query(
        "SELECT id, tag FROM tags WHERE user_id = $1 AND tag IN (" +
          param.join(", ") +
          ")",
        queryArray
      );
    })
    .then(r => {
      // Get id of all tags that are in the DB
      for (i in r.rows) {
        tagIdList.push(r.rows[i].id);
      }
      // Get list of tags that are not in the DB
      let auxList = r.rows.map((v, i) => r.rows[i].tag);
      let remainTagList = [];
      for (i in tagContentList) {
        f = auxList.indexOf(tagContentList[i]);
        if (f == -1) {
          remainTagList.push(userId);
          remainTagList.push(tagContentList[i]);
        }
      }
      // Insert tags that are not in the DB
      if (remainTagList.length == 0) {
        return client.query("SELECT NULL LIMIT 0");
      } else {
        let queryString = "INSERT INTO tags(user_id, tag) VALUES ";
        for (let i = 0; i < remainTagList.length; i += 2) {
          queryString +=
            "($" + (parseInt(i) + 1) + ", $" + (parseInt(i) + 2) + "), ";
        }
        queryString = queryString.slice(0, -2) + " RETURNING id";
        // Print stuff to check
        return client.query(queryString, remainTagList);
      }
    })
    .then(r => {
      // Get the newly added tag IDs
      for (i in r.rows) {
        console.log(r.rows[i].id);
        tagIdList.push(r.rows[i].id);
      }
      console.log(tagIdList);
      // Build queryArray and queryString
      let queryArray = [];
      let queryString = "INSERT INTO notes_tags(notes_id, tags_id) VALUES ";
      for (i in tagIdList) {
        queryArray.push(noteId);
        queryArray.push(tagIdList[i]);
      }
      for (let i = 1; i <= queryArray.length; i += 2) {
        queryString += "($" + parseInt(i) + ", $" + (parseInt(i) + 1) + "), ";
      }
      // Run query, return Promise
      console.log(queryArray);
      console.log(queryString);
      return client.query(queryString.slice(0, -2), queryArray);
    })
    .catch(e => {
      client.end();
      console.log(e);
    })
    .finally(() => client.end());
};

exports.put = function(req, res, next) {
  console.log("\nMiddleware: notes.put");
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

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
  }
  client
    .connect()
    .then(() => {
      client.query(
        "UPDATE notes SET content = $1, lastupdated = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3",
        [req.body.content, noteId, userId],
        function(err, queryRes) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            client.end();
            return;
          }

          let tagList = req.body["tags[]"];
          if (typeof tagList == "string") {
            tagList = [tagList];
          }
          let tagListLength = tagList.length;

          // Delete all notes-tags relationship entries for the edited note
          client.query(
            "DELETE FROM notes_tags WHERE notes_id = $1",
            [noteId],
            function(err, queryRes) {
              if (err) {
                console.log(err);
                res.sendStatus(500);
                client.end();
                return;
              }

              // For each received tag, get its ID
              for (let i = 0; i < tagListLength; i++) {
                client.query(
                  "SELECT id FROM tags WHERE tag = $1 AND user_id = $2",
                  [tagList[i], userId],
                  function(err, queryRes) {
                    console.log("Get tag");
                    if (err) {
                      console.log(err);
                      res.sendStatus(500);
                      client.end();
                      return;
                    }

                    // If it doesn't exist, insert it and then create the relationship
                    if (queryRes.rows.length == 0) {
                      client.query(
                        "INSERT into tags(user_id, tag) VALUES ($1, $2) RETURNING id",
                        [userId, tagList[i]],
                        function(err, queryRes) {
                          if (err) {
                            console.log(err);
                            res.sendStatus(500);
                            client.end();
                            return;
                          }

                          let tagId = queryRes.rows[0].id;

                          client.query(
                            "INSERT into notes_tags(notes_id, tags_id) VALUES ($1, $2)",
                            [noteId, tagId],
                            function(err, queryRes) {
                              if (err) {
                                console.log(err);
                                res.sendStatus(500);
                                client.end();
                                return;
                              }
                            }
                          );
                        }
                      );
                    }
                    // Otherwise, just add the relationship
                    else {
                      let tagId = queryRes.rows[0].id;

                      client.query(
                        "INSERT into notes_tags(notes_id, tags_id) VALUES ($1, $2)",
                        [noteId, tagId],
                        function(err, queryRes) {
                          if (err) {
                            console.log(err);
                            res.sendStatus(500);
                            client.end();
                            return;
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
          res.sendStatus(200);
          client.end();
          return next();
        }
      );
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
      client.end();
      return;
    });
};

exports.delete = function(req, res, next) {
  console.log("Middleware: notes.delete");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
  }
  client
    .connect()
    .then(() => {
      client.query(
        "DELETE FROM notes WHERE id = $1 AND user_id = $2",
        [req.params.id, res.locals.user_id],
        function(err) {
          if (err) {
            console.log(err);
            res.sendStatus(500);
            client.end();
            return;
          }

          res.sendStatus(200);
          client.end();
          return next();
        }
      );
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
      client.end();
      return;
    });
};
