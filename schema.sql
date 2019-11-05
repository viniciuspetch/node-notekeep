CREATE TABLE notes (id integer primary key, content text, datetime text);
CREATE TABLE tags (id integer primary key, tag text not null);
CREATE TABLE notes_tags (notes_id integer not null, tags_id integer not null, foreign key (notes_id) references notes (id) on delete cascade, foreign key (tags_id) references tags (id) on delete cascade, primary key (notes_id, tags_id));