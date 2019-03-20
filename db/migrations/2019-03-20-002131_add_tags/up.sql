CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  tag TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags_id (
  id SERIAL PRIMARY KEY,
  note_id int not null references notes(id),
  tag_id int not null references tags(id)
);
