const { Client } = require("pg");

exports.getClient = function () {
  if (process.env.DATABASE_URL) {
    return new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
  } else {
    return new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }
};

exports.isAlphaNumeric = function (str) {
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

exports.getAllURL = function (string) {
  let listURLs = [];
  stringSplit = string.split(" ");
  for (let i in stringSplit) {
    if (stringSplit[i].search("[.]") != -1) {
      var splitAgain = stringSplit[i].split(".");
      var url = true;
      for (let j of splitAgain) {
        if (j == "" || j.search("\n") != -1) {
          url = false;
        }
      }
      if (url) {
        listURLs.push(stringSplit[i]);
      }
    }
  }
  return listURLs;
};
