const path = require('path');

let webGetLogin = function (req, res) {
  console.log('\n/login GET');
  res.sendFile(__dirname + '/public/html/login.html');
};

let webGetSignup = function (req, res) {
  console.log('\n/signup GET');
  res.sendFile(__dirname + '/public/html/signup.html');
};

let webGetSignout = function (req, res) {
  console.log('\n/signout GET');
  res.sendFile(__dirname + '/public/html/signout.html');
};

let webGetIndex = function (req, res) {
  console.log('\n/index GET');
  res.sendFile(__dirname + '/public/html/index.html');
};

let webGetCreate = function (req, res) {
  console.log('\n/create GET');
  res.sendFile(__dirname + '/public/html/create.html');
};

let webGetRead = function (req, res) {
  console.log('\n/read GET');
  res.sendFile(__dirname + '/public//html/read.html');
};

let webGetEdit = function (req, res) {
  console.log('\n/edit/:id GET');
  res.sendFile(__dirname + '/public/html/edit.html');
};

exports.tag = function (req, res) {
  console.log('Webpage: tag');
  res.sendFile(path.join(__dirname + '/../public/html/tag.html'));
};