CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  hashed_password VARCHAR NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SELECT diesel_manage_updated_at('users');

INSERT INTO users(id, name, email, hashed_password)
values (1, 'Dummy', 'dummy@example.com', '');

ALTER TABLE notes
ADD COLUMN user_id int NOT NULL DEFAULT 1 references users(id) ON DELETE CASCADE;

ALTER TABLE notes
ALTER COLUMN user_id DROP DEFAULT;
