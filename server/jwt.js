const jsonwebtoken = require('jsonwebtoken');

// JWT Creation
exports.newJWT = function (username, secret) {
  if (username == null || secret == null) {
    console.log('Internal error: no username or secret');
    return false;
  }
  return jsonwebtoken.sign({
    username: username
  }, secret, {
    expiresIn: '24h'
  });
}

// JWT Verification
exports.verifyJWT = function (token, secret) {
  console.log('Log: verifyJWT(token, secret)');
  if (token == null) {
    console.log('Request Error: Token is null');
    return false;
  }
  if (secret == null) {
    console.log('Internal Error: Secret is null');
    return false;
  }
  try {
    return jsonwebtoken.verify(token, secret).username;
  } catch (err) {
    console.log('Request Error: Json Web Token received is invalid');
    return false;
  }
}

// Authentication middleware
exports.jwtAuth = function (req, res, next) {
  if (!req.headers['authorization']) {
    console.log('Error: Empty auth header');
    res.sendStatus(401);
    return;
  }

  let username = jwt.verifyJWT(req.headers['authorization'].split(' ')[1], jwtSecret);
  if (!username) {
    console.log('Error: JWT Verification failed');
    res.sendStatus(401);
    return;
  }

  req.locals.username = username;
  next();
}