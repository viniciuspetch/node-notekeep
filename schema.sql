CREATE TABLE 
    user_acc (
        id integer primary key,
        usrn text not null,
        pswd text not null,
        creation integer not null,
        lastupdated integer not null
    );

CREATE TABLE
    notes (
        id integer primary key,
        user_id integer not null,
        content text not null,
        creation integer not null,
        lastupdated integer not null,
        foreign key
            (user_id)
            references user_acc (id)
    );

CREATE TABLE
    tags (
        id integer primary key,
        tag text not null
    );

CREATE TABLE 
    notes_tags (
        id integer primary key,
        notes_id integer not null,
        tags_id integer not null,
        foreign key 
            (notes_id) 
            references notes (id),
        foreign key 
            (tags_id)
            references tags (id)
    );

INSERT INTO 
    user_acc(usrn, pswd, creation, lastupdated)
VALUES
    ('default', 'default', 1000, 1500);

INSERT INTO 
    notes(user_id, content, creation, lastupdated)
VALUES
    (1, 'note 1', 1000, 1500),
    (1, 'note 2', 1000, 2000),
    (1, 'note 3', 1750, 2250);

INSERT INTO 
    tags(tag)
VALUES
    ('tag 1'),
    ('tag 2'),
    ('tag 3');

INSERT INTO 
    notes_tags(notes_id, tags_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 2),
    (2, 3);
