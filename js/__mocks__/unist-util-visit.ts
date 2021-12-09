// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
// eslint-disable-next-line import/prefer-default-export
export const visit = (obj: any, visitor: (o: any) => void) => {
  visitor(obj);
  (obj.children || []).forEach((ch: any) => {
    visit(ch, visitor);
  });
};
