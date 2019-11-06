CREATE TABLE
    notes (
        id integer primary key,
        content text,
        datetime text
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
    notes(content, datetime)
VALUES
    ('note 1', 123),
    ('note 2', 456),
    ('note 3', 789);

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
