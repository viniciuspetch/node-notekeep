const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('./server/jwt');
const tags = require('./server/tags');
const notes = require('./server/notes');

let app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

/*
app.get('/', webGetIndex);
app.get('/login', webGetLogin);
app.get('/signup', webGetSignup);
app.get('/signout', webGetSignout);
app.get('/create', webGetCreate);
app.get('/read', webGetRead);
app.get('/edit/:id', webGetEdit);
app.get('/tag', tags.web);

app.post('/api/login', apiPostLogin);
app.post('/api/signup', apiPostSignup);

app.get('/api/read', apiPostRead);
app.post('/api/read', apiPostRead);

app.post('/api/note', apiPostCreate);
app.put('/api/note/:id', apiPostEdit);
app.delete('/api/note/:id', apiDeleteNote);
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