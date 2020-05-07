const jsonwebtoken = require("jsonwebtoken");
const { Client } = require("pg");

// JWT Creation
exports.newJWT = function (username, id, secret) {
  if (username == null || secret == null) {
    console.log("Internal error: no username or secret");
    return false;
  }
  return jsonwebtoken.sign(
    {
      username: username,
    },
    secret,
    {
      issuer: "notekeeper",
      expiresIn: "12h",
      subject: id.toString(),
    }
  );
};

// JWT Verification
exports.verifyJWT = function (token, secret) {
  console.log("Function: verifyJWT");
  if (token == null) {
    console.log("Request Error: Token is null");
    return false;
  }
  if (secret == null) {
    console.log("Internal Error: Secret is null");
    return false;
  }
  try {
    return jsonwebtoken.verify(token, secret).username;
  } catch (err) {
    console.log("Request Error: Json Web Token received is invalid");
    console.log(err)
    return false;
  }
};

// Authentication middleware
exports.auth = function (req, res, next) {
  console.log("Middleware: jwt.auth");
  if (!req.headers["authorization"]) {
    console.log("Error: Empty auth header");
    res.sendStatus(401);
    return;
  }

  let username = exports.verifyJWT(
    req.headers["authorization"].split(" ")[1],
    "nodejs"
  );
  if (!username) {
    console.log("Error: JWT Verification failed");
    res.sendStatus(401);
    return;
  }

  let client = null;
  if (process.env.DATABASE_URL) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });
  } else {
    client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }
  client
    .connect()
    .then(() =>
      client.query("SELECT id FROM user_acc WHERE usrn = $1", [username])
    )
    .then((r) => {
      res.locals.username = username;
      res.locals.user_id = r.rows[0].id;
      next();
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(512);
      return;
    })
    .finally(() => client.end());
};
