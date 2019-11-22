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
  let verifiedToken;
  if (token == null || secret == null) {
    return false;
  }
  try {
    verifiedToken = jsonwebtoken.verify(token, secret);
    return verifiedToken;
  } catch (err) {
    console.log(err);
    return false;
  }
}