const path = require('path');

let login = function (req, res) {
  console.log('View: login');
  res.sendFile(path.join(__dirname + '/../public/html/login.html');
};

let signup = function (req, res) {
  console.log('View: signup');
  res.sendFile(path.join(__dirname + '/../public/html/signup.html');
};

let signout = function (req, res) {
  console.log('View: signout');
  res.sendFile(path.join(__dirname + '/../public/html/signout.html');
};

let index = function (req, res) {
  console.log('View: index.html');
  res.sendFile(path.join(__dirname + '/../public/html/index.html');
};

let create = function (req, res) {
  console.log('View: create.html');
  res.sendFile(path.join(__dirname + '/../public/html/create.html');
};

let read = function (req, res) {
  console.log('View: read.html');
  res.sendFile(path.join(__dirname + '/../public//html/read.html');
};

let edit = function (req, res) {
  console.log('View: edit.html');
  res.sendFile(path.join(__dirname + '/../public/html/edit.html');
};

exports.tag = function (req, res) {
  console.log('Webpage: tag');
  res.sendFile(path.join(__dirname + '/../public/html/tag.html'));
};