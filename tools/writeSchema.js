import { printSchema } from 'graphql'
import fs from 'fs';
import path from 'path';

import schema from '../src/graphql/schema';


fs.writeFileSync(path.join(__dirname, '../schema.graphql'), printSchema(schema));
