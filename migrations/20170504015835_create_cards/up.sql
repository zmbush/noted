CREATE OR REPLACE FUNCTION pseudo_encrypt(VALUE bigint) returns bigint AS $$
DECLARE
l1 int;
l2 int;
r1 int;
r2 int;
i int:=0;
BEGIN
 l1:= (VALUE >> 16) & 65535;
 r1:= VALUE & 65535;
 WHILE i < 3 LOOP
   l2 := r1;
   r2 := l1 # ((((1366 * r1 + 150889) % 714025) / 714025.0) * 32767)::int;
   l1 := l2;
   r1 := r2;
   i := i + 1;
 END LOOP;
 RETURN ((r1 << 16) + l1);
END;
$$ LANGUAGE plpgsql strict immutable;

CREATE SEQUENCE user_id_seq;
CREATE TABLE users (
  id BIGINT PRIMARY KEY DEFAULT pseudo_encrypt(nextval('user_id_seq')) NOT NULL,
  google_id VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL
);
-- ALTER SEQUENCE user_id_seq OWNED BY users;

CREATE SEQUENCE cards_id_seq;
CREATE TABLE cards (
  id BIGINT DEFAULT pseudo_encrypt(nextval('cards_id_seq')) NOT NULL,
  user_id BIGINT references users(id),
  title VARCHAR NOT NULL,
  modified_title VARCHAR,
  body TEXT NOT NULL,
  PRIMARY KEY(user_id, title)
);
-- ALTER SEQUENCE cards_id_seq OWNED BY cards;
