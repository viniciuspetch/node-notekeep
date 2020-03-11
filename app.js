const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("./server/jwt");
const tags = require("./server/tags");
const notes = require("./server/notes");
const login = require("./server/login");
const web = require("./server/web");

let app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.get("/", web.index);
app.get("/login", web.login);
app.get("/signup", web.signup);
app.get("/signout", web.signout);
app.get("/create", web.create);
app.get("/read", web.read);
app.get("/edit/:id", web.edit);

app.post("/api/login", login.login);
app.post("/api/signup", login.signup);

app.get("/api/note", jwt.auth, notes.getAll);
app.get("/api/note/:id", jwt.auth, notes.getSingle);
app.post("/api/note", jwt.auth, notes.post);
app.put("/api/note/:id", jwt.auth, notes.put);
app.delete("/api/note/:id", jwt.auth, notes.delete);

app.get("/api/tag", jwt.auth, tags.getAll);
app.get("/api/tag/:id", jwt.auth, tags.getSingle);
app.post("/api/tag", jwt.auth, tags.post);
app.put("/api/tag/:id", jwt.auth, tags.put);
app.delete("/api/tag/:id", jwt.auth, tags.delete);

app.get("/api/tagUsed", jwt.auth, tags.getAllUsed);

// Testing database connection
const { Client } = require("pg");
let client = null;
if (process.env.DATABASE_URL) {
  console.log("Heroku");
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });
} else {
  console.log("Local");
  client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });
}
client.connect().then(() => {
  client.query("SELECT NOW()", (err, res) => {
    err ? console.log(err) : console.log("The time now is " + res.rows[0].now);
    client.end();
  });
});

app.listen(process.env.PORT || 8000, function() {
  console.log("Ready");
});
