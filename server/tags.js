const {
  Client
} = require('pg');

exports.getAllUsed = function (req, res, next) {
  console.log('Middleware: tags.getAllUsed');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('SELECT tags.id, tags.tag FROM notes_tags LEFT JOIN tags WHERE tags.user_id = $1 AND notes_tags.tags_id = tags.id', [res.locals.user_id], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200);
    res.send(queryRes.rows);
    return next();
  });
}

exports.getAll = function (req, res, next) {
  console.log('Middleware: tags.getAll');
  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('SELECT id, tag FROM tags WHERE user_id = ?', [res.locals.user_id], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200);
    res.send(queryRes.rows);
    return next();
  });
};

exports.getSingle = function (req, res, next) {
  console.log('Middleware: tags.getSingle');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('SELECT id, tag FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, res.locals.user_id], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200);
    res.send(queryRes.rows[0]);
    return next();
  });
};

exports.post = function (req, res, next) {
  console.log('Middleware: tags.post');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query(`INSERT INTO tags(user_id, tag) VALUES ($1, $2) RETURNING id`, [res.locals.user_id, req.body.tag], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    client.query('SELECT * FROM tags WHERE id = $1', queryRes.rows[0].id, function (err, queryRes) {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.status(200);
      res.send(queryRes.rows[0]);
      return;
    });
  });
}

exports.put = function (req, res, next) {
  console.log('Middleware: tags.put');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('UPDATE tags SET tag = $1 WHERE id = $2 AND user_id = $3', [req.body.tag, req.params.id, res.locals.user_id], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return;
  });
}

exports.delete = function (req, res, next) {
  console.log('Middleware: tags.delete');

  if (!res.locals.username) {
    res.sendStatus(500);
    return next();
  }

  let db = new sqlite3.Database('note.db');
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'notekeeper',
    password: 'postgres',
    port: 5432,
  });
  client.connect();
  client.query('DELETE FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, res.locals.user_id], function (err, queryRes) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.sendStatus(200);
    return;
  });
}