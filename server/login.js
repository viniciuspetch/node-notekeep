const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

let apiPostLogin = function (req, res) {
  console.log('\nROUTE: /login POST');

  let db = new sqlite3.Database('note.db');
  let username = req.body.username;
  let password = req.body.password;
  console.log('VAR: username: ' + username);
  console.log('VAR: password: ' + password);

  // Check empty fields
  if (!username) {
    res.json({
      result: false
    });
    return;
  }
  if (!password) {
    res.json({
      result: false
    });
    return;
  }

  db.get('SELECT pswd FROM user_acc WHERE usrn=?', [username], function (err, row) {
    // Check if username exists
    if (row == undefined) {
      res.json({
        result: false,
        reason: 'usernameNotFound'
      });
      return;
    }

    // Check password
    console.log('LOG: Username found');
    let hash = row.pswd;
    console.log('VAR: hash: ' + hash);
    let compareRes = bcrypt.compareSync(password, hash);
    console.log('VAR: compareRes: ' + compareRes);
    if (!compareRes) {
      res.json({
        result: false,
        reason: 'wrongPassword'
      });
      return;
    }

    // Return token
    console.log('LOG: Username verified');
    let token = jwt.newJWT(username, jwtSecret);
    console.log('VAR: token: ' + token);
    res.json({
      result: true,
      token
    });
    return;
  });
};

let apiPostSignup = function (req, res) {
  console.log('\nROUTE: /api/signup POST');
  console.log(req.body);

  let db = new sqlite3.Database('note.db');
  let username = req.body.username;
  let password = req.body.password;
  let hash = bcrypt.hashSync(password, 5);
  let datetime = Date.now();

  console.log(username);
  console.log(datetime);

  // Check empty username
  if (!username) {
    console.log('LOG: Username is empty');
    res.json({
      result: false,
      reason: 'emptyUsername'
    });
    return;
  }
  // Check empty password
  if (!password) {
    console.log('LOG: Password is empty');
    res.json({
      result: false,
      reason: 'emptyPassword'
    });
    return;
  }
  if (username.length > 32) {
    console.log('LOG: Username is too long');
    res.json({
      result: false,
      reason: 'usernameTooLong'
    });
    return;
  }
  if (password.length > 32) {
    console.log('LOG: Password is too long');
    res.json({
      result: false,
      reason: 'passwordTooLong'
    });
    return;
  }
  if (password.length < 4) {
    console.log('LOG: Password is too short');
    res.json({
      result: false,
      reason: 'passwordTooShort'
    });
    return;
  }
  if (!isAlphaNumeric(username)) {
    console.log('LOG: Username has invalid characters');
    res.json({
      result: false,
      reason: 'usernameInvalidCharacters'
    });
    return;
  }
  if (!isAlphaNumeric(password)) {
    console.log('LOG: Password has invalid characters');
    res.json({
      result: false,
      reason: 'passwordInvalidCharacters'
    });
    return;
  }

  db.get('SELECT usrn FROM user_acc WHERE usrn=?', [username], function (err, row) {
    // Check if username is already used
    if (row != undefined) {
      console.log('Username already exists');
      res.json({
        result: false,
        reason: 'usernameExists'
      });
      return;
    }
    // Otherwise, create a new account
    db.run('INSERT INTO user_acc(usrn, pswd, creation, lastupdated) VALUES (?,?,?,?)', [username, hash, datetime, datetime], function () {
      console.log('Username created');
      res.json({
        result: true
      });
      return;
    });
  });
};