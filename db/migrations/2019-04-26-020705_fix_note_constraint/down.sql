ALTER TABLE notes
  DROP CONSTRAINT notes_title_user_id_parent_note_id,
  ADD CONSTRAINT notes_title_id_parent_note_id UNIQUE(id, title, parent_note_id);
