DROP TRIGGER set_updated_at ON notes;

ALTER TABLE notes
DROP COLUMN created_at,
DROP COLUMN updated_at;

DROP TRIGGER set_updated_at ON tags;

ALTER TABLE tags
DROP COLUMN created_at,
DROP COLUMN updated_at;
