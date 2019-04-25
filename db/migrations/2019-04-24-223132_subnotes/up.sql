ALTER TABLE notes
  ADD COLUMN parent_note_id int REFERENCES notes(id) ON DELETE CASCADE,
  DROP CONSTRAINT notes_title_key,
  ADD CONSTRAINT notes_title_id_parent_note_id UNIQUE(id, title, parent_note_id);
