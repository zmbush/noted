CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL UNIQUE,
  body TEXT NOT NULL
);