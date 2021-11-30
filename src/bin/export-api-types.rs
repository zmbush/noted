// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//

use noted_db::models::{NoteWithTags, User};
use schemars::schema_for;

macro_rules! write_schema {
    ($dir:expr, $type:ty) => {
        let schema = schema_for!($type);
        let output = serde_json::to_string_pretty(&schema)?;
        std::fs::write($dir.join(format!("{}.json", stringify!($type))), output)?;
    };
}

fn main() -> Result<(), anyhow::Error> {
    let dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("schemas");
    if let Err(e) = std::fs::DirBuilder::new().create(&dir) {
        if e.kind() != std::io::ErrorKind::AlreadyExists {
            return Err(e.into());
        }
    }

    for entry in std::fs::read_dir(&dir)? {
        let path = entry?.path();
        if path.is_file() {
            std::fs::remove_file(path)?;
        }
    }

    write_schema!(dir, NoteWithTags);
    write_schema!(dir, User);

    Ok(())
}
