// Copyright 2017 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

import { printSchema } from 'graphql'
import fs from 'fs';
import path from 'path';

import schema from '../src/graphql/schema';

const schemaStr = printSchema(schema);
const writePath = path.join(__dirname, '../schema.graphql');
fs.writeFileSync(writePath, schemaStr);

process.exit();
