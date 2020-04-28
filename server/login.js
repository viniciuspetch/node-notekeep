const bcrypt = require("bcryptjs");
const jwt = require("./jwt");
const { Client } = require("pg");
const { getClient, isAlphaNumeric } = require("./helper.js");

exports.login = function(req, res) {
  console.log("Middleware: login.login");
  // Username data
  let username = req.body.username;
  let password = req.body.password;
  // Check empty fields
  if (!username) {
    console.log("Client error: No username received");
    res.sendStatus(401);
    return;
  }
  if (!password) {
    console.log("Client error: No password received");
    res.sendStatus(401);
    return;
  }
  // Create DB Client object
  let client = getClient();
  client
    .connect()
    .then(() =>
      client.query("SELECT * FROM user_acc WHERE usrn = $1", [username])
    )
    .then(r => {
      if (!r.rows[0]) {
        console.log("Client error: No username found");
        res.sendStatus(401);
      } else {
        // Check password
        let hash = r.rows[0].pswd;
        let compareRes = bcrypt.compareSync(password, hash);
        if (!compareRes) {
          console.log("Client error: Wrong password");
          res.sendStatus(401);
        } else {
          // Return token
          res.status(200);
          res.json({
            token: jwt.newJWT(username, r.rows[0].id, "nodejs")
          });
        }
      }
    })
    .catch(e => {
      console.log(e);
      res.sendStatus(512);
    })
    .finally(() => client.end());
};

exports.signup = function(req, res) {
  console.log("Middleware: signup");
  // Username data
  let username = req.body.username;
  let password = req.body.password;
  let hash = bcrypt.hashSync(password, 5);
  // Login validation
  if (!username) {
    console.log("Client error: No username received");
    res.sendStatus(401);
    return;
  }
  if (!password) {
    console.log("Client error: No password received");
    res.sendStatus(401);
    return;
  }
  if (username.length > 32) {
    console.log("Client error: Username is too long");
    res.sendStatus(401);
    return;
  }
  if (password.length > 32) {
    console.log("Client error: Password is too long");
    res.sendStatus(401);
    return;
  }
  if (password.length < 4) {
    console.log("Client error: Password is too short");
    res.sendStatus(401);
    return;
  }
  if (!isAlphaNumeric(username)) {
    console.log("Client error: Username has invalid characters");
    res.sendStatus(401);
    return;
  }
  if (!isAlphaNumeric(password)) {
    console.log("Client error: Password has invalid characters");
    res.sendStatus(401);
    return;
  }
  // Create DB Client object and connect to DB
  let client = getClient();
  client
    .connect()
    .then(() =>
      client.query("SELECT usrn FROM user_acc WHERE usrn = $1", [username])
    )
    .then(r => {
      // Check if username is already used
      if (r.rows[0] != undefined) {
        console.log("Client error: Username already exists");
        res.sendStatus(401);
        return null;
      }
      console.log("Server message: Username is free");
      return client.query(
        "INSERT INTO user_acc(usrn, pswd) VALUES ($1, $2) RETURNING *",
        [username, hash]
      );
    })
    .then(r => {
      if (r) {
        console.log("Server message: Username created");
        res.sendStatus(200);
      }
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(512);
    })
    .finally(() => client.end());
};
