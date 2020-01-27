const bcrypt = require('bcrypt');
const jwt = require('./jwt');
const {
  Client
} = require('pg');

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

exports.login = function (req, res) {
  console.log('Middleware: login.login');
  
  let username = req.body.username;
  let password = req.body.password;
  console.log('Username: ' + username);
  console.log('Password: ' + password);

  // Check empty fields
  if (!username) {
    console.log('Client error: No username received');
    res.sendStatus(401);
    return;
  }
  if (!password) {
    console.log('Client error: No password received');
    res.sendStatus(401);
    return;
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('SELECT pswd FROM user_acc WHERE usrn = $1', [username], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    if (!queryRes.rows[0]) {
      console.log('Client error: No username found');
      res.sendStatus(401);
      return;
    }

    // Check password
    let hash = queryRes.rows[0].pswd;
    let compareRes = bcrypt.compareSync(password, hash);
    if (!compareRes) {
      console.log('Client error: Wrong password');
      res.sendStatus(401);
      return;
    }

    // Return token
    res.status(200);
    res.json({
      token: jwt.newJWT(username, 'nodejs'),
    });
    return;
  });
};

exports.signup = function (req, res) {
  console.log('Middleware: signup');
  console.log(req.body);

  
  let username = req.body.username;
  let password = req.body.password;
  let hash = bcrypt.hashSync(password, 5);

  // Check empty username
  if (!username) {
    console.log('Client error: No username received');
    res.sendStatus(401);
    return;
  }
  // Check empty password
  if (!password) {
    console.log('Client error: No password received');
    res.sendStatus(401);
    return;
  }
  if (username.length > 32) {
    console.log('Client error: Username is too long');
    res.sendStatus(401);
    return;
  }
  if (password.length > 32) {
    console.log('Client error: Password is too long');
    res.sendStatus(401);
    return;
  }
  if (password.length < 4) {
    console.log('Client error: Password is too short');
    res.sendStatus(401);
    return;
  }
  if (!isAlphaNumeric(username)) {
    console.log('Client error: Username has invalid characters');
    res.sendStatus(401);
    return;
  }
  if (!isAlphaNumeric(password)) {
    console.log('Client error: Password has invalid characters');
    res.sendStatus(401);
    return;
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  })
  client.connect()
  client.query('SELECT usrn FROM user_acc WHERE usrn = $1', [username], function (err, queryRes) {
    // Check if username is already used
    if (queryRes.rows[0] != undefined) {
      console.log('Client error: Username already exists');
      res.sendStatus(401);
      return;
    }
    console.log('Server message: Username is free');

    client.query('INSERT INTO user_acc(usrn, pswd) VALUES ($1, $2) RETURNING *', [username, hash], function (err, queryRes) {
      if (err) {
        console.log('Unknown error');
        console.log(err);
      }
      console.log('Server message: Username created');
      res.sendStatus(200);
      return;
    });
  });
};