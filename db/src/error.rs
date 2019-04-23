// Copyright 2019 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

macro_rules! impl_noted_db_error {
    ($($type:ident => $inner:ty),*) =>{
        #[derive(Debug)]
        pub enum DbError {
            NotFound,
            NotLoggedIn,
            $($type($inner)),*
        }

        $(
            impl From<$inner> for DbError {
                fn from(e: $inner) -> Self {
                    DbError::$type(e)
                }
            }
        )*

        impl std::fmt::Display for DbError {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                match *self {
                    DbError::NotFound => write!(f, "record not found"),
                    DbError::NotLoggedIn => write!(f, "not logged in"),
                    $(
                        DbError::$type(ref e) => write!(f, "{}: {}", stringify!($type), e)
                    ),*
                }
            }
        }

        impl std::error::Error for DbError {
        }
    };

    ($($type:ident => $inner:ty),*,) => {
        impl_noted_db_error!($($type => $inner),*);
    };
}

pub type Result<T> = std::result::Result<T, DbError>;

impl_noted_db_error! {
    DieselResult => diesel::result::Error,
    R2D2 => r2d2::Error,
    IOError => std::io::Error,
}
