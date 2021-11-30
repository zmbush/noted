export interface NoteWithTags {
  archived: boolean;
  body: string;
  created_at: string;
  id: number;
  parent_note_id: number;
  pinned: boolean;
  tags: string[];
  title: string;
  updated_at: string;
  user_id: number;
  [k: string]: unknown;
}

export interface User {
  created_at: string;
  email: string;
  id: number;
  name: string;
  updated_at: string;
  [k: string]: unknown;
}