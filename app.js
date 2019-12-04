const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./server/jwt');
const tags = require('./server/tags');
const notes = require('./server/notes');
const web = require('./server/web');

let app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', web.index);
app.get('/login', web.login);
app.get('/signup', web.signup);
app.get('/signout', web.signout);
app.get('/create', web.create);
app.get('/read', web.read);
app.get('/edit/:id', web.edit);
app.get('/tag', tags.web);

/*
app.post('/api/login', apiPostLogin);
app.post('/api/signup', apiPostSignup);
*/

app.get('/api/note', jwt.auth, notes.getAll);
app.get('/api/note/:id', jwt.auth, notes.getSingle);
app.post('/api/note', jwt.auth, notes.post);
app.put('/api/note/:id', jwt.auth, notes.put);
app.delete('/api/note/:id', jwt.auth, notes.delete);

app.get('/api/tag', jwt.auth, tags.getAll);
app.get('/api/tag/:id', jwt.auth, tags.getSingle);
app.post('/api/tag', jwt.auth, tags.post);
app.put('/api/tag/:id', jwt.auth, tags.put);
app.delete('/api/tag/:id', jwt.auth, tags.delete);

app.listen(8000, function () {
  console.log('Ready');
});