const { Client } = require("pg");
const fs = require("fs");
require("dotenv").config();
const helper = require("./helper.js");

exports.getAll = function(req, res, next) {
  console.log("Middleware: notes.getAll");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = helper.getClient();
  client
    .connect()
    .then(() =>
      client.query(
        "SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = $1 ORDER BY notes.id, tags.id",
        [res.locals.user_id]
      )
    )
    .then(r => {
      let currId = null;
      let newRow = null;
      let newTagList = [];
      let newRowList = [];
      if (r.rows.length > 0) {
        let img = "";
        if (fs.existsSync("./public/uploads/" + r.rows[0].id + ".png")) {
          img = "/uploads/" + r.rows[0].id + ".png";
        }
        newRow = {
          img: img,
          id: r.rows[0].id,
          content: r.rows[0].content,
          lastupdated: r.rows[0].lastupdated,
          listURLs: helper.getAllURL(r.rows[0].content)
        };
        if (r.rows[0].tag != null) {
          newTagList.push(r.rows[0].tag);
        }
        currId = r.rows[0].id;
        for (let i = 1; i < r.rows.length; i++) {
          if (currId != r.rows[i].id) {
            newRow.tag = newTagList;
            newRowList.push(newRow);
            newTagList = [];
            if (fs.existsSync("./public/uploads/" + r.rows[i].id + ".png")) {
              img = "/uploads/" + r.rows[i].id + ".png";
            }
            newRow = {
              img: img,
              id: r.rows[i].id,
              content: r.rows[i].content,
              lastupdated: r.rows[i].lastupdated,
              listURLs: helper.getAllURL(r.rows[i].content)
            };
            currId = r.rows[i].id;
          }
          if (r.rows[i].tag != "null") {
            newTagList.push(r.rows[i].tag);
          }
        }
        newRow.tag = newTagList;
        newRowList.push(newRow);
      }
      res.status(200);
      res.send(newRowList);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
    })
    .finally(() => client.end());
};

exports.getSingle = function(req, res, next) {
  console.log("Middleware: notes.getSingle");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = helper.getClient();
  client
    .connect()
    .then(() =>
      client.query(
        "SELECT notes.id, notes.content, notes.lastupdated, tags.tag FROM notes LEFT JOIN notes_tags ON notes.id = notes_tags.notes_id LEFT JOIN tags ON notes_tags.tags_id = tags.id WHERE notes.user_id = $1 AND notes.id = $2 ORDER BY notes.id, tags.id",
        [res.locals.user_id, req.params.id]
      )
    )
    .then(r => {
      let newTagList = [];
      for (let i = 0; i < r.rows.length; i++) {
        newTagList.push(r.rows[i].tag);
      }
      let newRow = {
        id: r.rows[0].id,
        content: r.rows[0].content,
        lastupdated: r.rows[0].lastupdated,
        tag: newTagList
      };
      res.status(200);
      res.send(newRow);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
    })
    .finally(() => client.end());
};

exports.post = function(req, res, next) {
  console.log("Middleware: notes.post");
  // Get some user and note data
  let username = res.locals.username;
  let content = req.body.content;
  let userId = res.locals.user_id;
  // Return 500 if it's missing either the username or the note content
  if (!username) {
    res.sendStatus(500);
    return;
  }
  if (!content) {
    console.log("Client error: There's no content");
    res.sendStatus(400);
    return;
  }

  let noteId = null;
  let tagIdList = [];
  let tagContentList = [];

  let client = helper.getClient();
  client
    .connect()
    // Insert the note itself
    .then(() =>
      client.query(
        "INSERT INTO notes(user_id, content) VALUES ($1, $2) RETURNING id",
        [userId, content]
      )
    )
    // Extract tags and search which ones already exist
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
    // Insert tags that doesn't exist yet
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
    // Create relationship between all tags and the note
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
    .then(() => {
      if (req['files'] && req.files.image) {
        req.files.image.mv("./public/uploads/" + noteId + ".png");
      }
      res.sendStatus(200);
    })
    .catch(e => {
      console.log(e);
      res.sendStatus(500);
      return;
    })
    .finally(() => client.end());
};

exports.put = function(req, res, next) {
  console.log("Middleware: notes.post");
  // Get some user and note data
  let username = res.locals.username;
  let content = req.body.content;
  let userId = res.locals.user_id;
  let noteId = req.params.id;
  // Return 500 if it's missing either the username or the note content
  if (!username) {
    res.sendStatus(500);
    return;
  }
  if (!content) {
    console.log("Client error: There's no content");
    res.sendStatus(400);
    return;
  }

  let tagIdList = [];
  let tagContentList = [];
  let queryArray = [];
  let queryString = "";

  let client = helper.getClient();
  client
    .connect()
    // Insert the note itself
    .then(() =>
      client.query(
        "UPDATE notes SET content = $1, lastupdated = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3",
        [content, noteId, userId]
      )
    )
    // Extract tags and search which ones already exist
    .then(r => {
      // Transform string of tags into a list
      tagContentList = req.body["tags[]"];
      if (typeof tagContentList == "string") tagContentList = [tagContentList];
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
    // Insert tags that doesn't exist yet
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
        // Empty select, just to skip current query
        return client.query("SELECT NULL LIMIT 0");
      } else {
        queryString = "INSERT INTO tags(user_id, tag) VALUES ";
        for (let i = 0; i < remainTagList.length; i += 2) {
          queryString +=
            "($" + (parseInt(i) + 1) + ", $" + (parseInt(i) + 2) + "), ";
        }
        queryString = queryString.slice(0, -2) + " RETURNING id";
        // Run query, return Promise
        return client.query(queryString, remainTagList);
      }
    })
    // Create relationship between all tags and the note
    .then(r => {
      // Get the newly added tag IDs
      for (i in r.rows) {
        console.log(r.rows[i].id);
        tagIdList.push(r.rows[i].id);
      }
      console.log(tagIdList);
      // Build queryArray and queryString
      queryArray = [];
      queryString = "INSERT INTO notes_tags(notes_id, tags_id) VALUES ";
      for (i in tagIdList) {
        queryArray.push(noteId);
        queryArray.push(tagIdList[i]);
      }
      for (let i = 1; i <= queryArray.length; i += 2) {
        queryString += "($" + parseInt(i) + ", $" + (parseInt(i) + 1) + "), ";
      }
      // Run query, return Promise
      return client.query("DELETE FROM notes_tags WHERE notes_id = $1", [
        noteId
      ]);
    })
    .then(() => client.query(queryString.slice(0, -2), queryArray))
    .then(() => res.sendStatus(200))
    .catch(e => {
      console.log(e);
      res.sendStatus(500);
    })
    .finally(() => client.end());
};

exports.delete = function(req, res, next) {
  console.log("Middleware: notes.delete");
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let client = helper.getClient();
  client
    .connect()
    .then(() =>
      client.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
        req.params.id,
        res.locals.user_id
      ])
    )
    .then(r => {
      res.sendStatus(200);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
    })
    .finally(() => client.end());
};
