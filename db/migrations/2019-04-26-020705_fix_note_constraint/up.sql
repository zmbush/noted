ALTER TABLE notes
  DROP CONSTRAINT notes_title_id_parent_note_id,
  ADD CONSTRAINT  notes_title_user_id_parent_note_id UNIQUE(title, user_id, parent_note_id);
