CREATE TABLE user_acc (
    id SERIAL,
    usrn VARCHAR NOT NULL,
    pswd VARCHAR NOT NULL,
    creation INT NOT NULL,
    lastupdated INT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notes (
    id SERIAL,
    user_id INT NOT NULL,
    content VARCHAR NOT NULL,
    creation INT NOT NULL,
    lastupdated INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user_acc (id)
);

CREATE TABLE tags (
    id SERIAL,
    user_id INTEGER NOT NULL,
    tag VARCHAR NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user_acc (id)
);

CREATE TABLE notes_tags (
    id SERIAL,
    notes_id INT NOT NULL,
    tags_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (notes_id) REFERENCES notes (id),
    FOREIGN KEY (tags_id) REFERENCES tags (id)
);