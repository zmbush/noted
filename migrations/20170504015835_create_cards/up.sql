CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE cards (
  id SERIAL,
  user_id INT4 references users(id),
  title VARCHAR NOT NULL,
  modified_title VARCHAR,
  body TEXT NOT NULL,
  PRIMARY KEY(user_id, title)
);
