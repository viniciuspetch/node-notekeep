const jsonwebtoken = require('jsonwebtoken');

exports.newJWT = function (username, secret) {
  if (username == null || secret == null) {
    return false;
  }
  return jsonwebtoken.sign({
    username: username
  }, secret, {
    expiresIn: '24h'
  });
}

exports.verifyJWT = function (token, secret) {
  console.log('[LOG]\tverifyJWT(token, secret)');
  if (token == null) {
    console.log('[LOG]\tToken is null');
    return false;
  }
  if (secret == null) {
    console.log('[LOG]\tSecret is null');
    return false;
  }
  try {
    let verifiedToken = jsonwebtoken.verify(token, secret);
    return verifiedToken;
  } catch (err) {
    console.log('[LOG]\tJson Web Token received is invalid');
    return false;
  }
}