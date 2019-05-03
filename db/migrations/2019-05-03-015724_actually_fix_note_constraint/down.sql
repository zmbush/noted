ALTER TABLE notes
  ALTER COLUMN parent_note_id DROP NOT NULL,
  ALTER COLUMN parent_note_id DROP DEFAULT;

UPDATE NOTES SET parent_note_id = NULL WHERE parent_note_id = 0;

DELETE FROM notes WHERE id = 0;
DELETE FROM users WHERE id = 0;
