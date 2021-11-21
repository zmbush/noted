table! {
    note_tags_id (id) {
        id -> Int4,
        note_id -> Int4,
        tag_id -> Int4,
    }
}

table! {
    notes (id) {
        id -> Int4,
        title -> Varchar,
        body -> Text,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        user_id -> Int4,
        parent_note_id -> Int4,
        archived -> Bool,
        pinned -> Bool,
    }
}

table! {
    tags (id) {
        id -> Int4,
        tag -> Text,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

table! {
    users (id) {
        id -> Int4,
        name -> Varchar,
        email -> Varchar,
        hashed_password -> Varchar,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

joinable!(note_tags_id -> notes (note_id));
joinable!(note_tags_id -> tags (tag_id));
joinable!(notes -> users (user_id));

allow_tables_to_appear_in_same_query!(
    note_tags_id,
    notes,
    tags,
    users,
);
