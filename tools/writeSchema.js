import { printSchema } from 'graphql'
import fs from 'fs';
import path from 'path';

import schema from '../src/graphql/schema';

const schemaStr = printSchema(schema);
const writePath = path.join(__dirname, '../schema.graphql');
fs.writeFileSync(writePath, schemaStr);

process.exit();
