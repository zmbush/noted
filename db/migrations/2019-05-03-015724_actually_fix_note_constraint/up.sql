INSERT INTO users VALUES (0, '', '', '', now(), now());
INSERT INTO notes VALUES (0, '', '', now(), now(), 0, 0, false);

UPDATE notes SET parent_note_id = 0 WHERE parent_note_id is NULL;

ALTER TABLE notes
  ALTER COLUMN parent_note_id SET DEFAULT 0,
  ALTER COLUMN parent_note_id SET NOT NULL;
