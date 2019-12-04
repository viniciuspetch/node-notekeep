const path = require('path');

exports.login = function (req, res) {
  console.log('View: login');
  res.sendFile(path.join(__dirname + '/../public/html/login.html'));
};

exports.signup = function (req, res) {
  console.log('View: signup');
  res.sendFile(path.join(__dirname + '/../public/html/signup.html'));
};

exports.signout = function (req, res) {
  console.log('View: signout');
  res.sendFile(path.join(__dirname + '/../public/html/signout.html'));
};

exports.index = function (req, res) {
  console.log('View: index.html');
  res.sendFile(path.join(__dirname + '/../public/html/index.html'));
};

exports.create = function (req, res) {
  console.log('View: create.html');
  res.sendFile(path.join(__dirname + '/../public/html/create.html'));
};

exports.read = function (req, res) {
  console.log('View: read.html');
  res.sendFile(path.join(__dirname + '/../public//html/read.html'));
};

exports.edit = function (req, res) {
  console.log('View: edit.html');
  res.sendFile(path.join(__dirname + '/../public/html/edit.html'));
};