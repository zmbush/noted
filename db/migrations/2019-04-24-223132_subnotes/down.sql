ALTER TABLE notes
  DROP CONSTRAINT notes_title_id_parent_note_id,
  ADD CONSTRAINT notes_title_key UNIQUE(title),
  DROP COLUMN parent_note_id;
