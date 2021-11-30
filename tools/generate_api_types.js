// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
const { compile } = require('json-schema-to-typescript');
const fs = require('node:fs/promises');
const path = require('path');
const emoji = require('node-emoji');

const dirname = path.dirname(path.dirname(__filename));

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

async function main() {
  const schemasPath = path.join(dirname, 'schemas');
  const schemaFiles = (await fs.readdir(schemasPath)).filter((x) => x.endsWith('.json'));

  console.log(`${emoji.get('hourglass')} Generating .ts from ${schemaFiles.length} schemas`);

  const compiledTypes = new Set();
  await asyncForEach(schemaFiles, async (filename) => {
    const filePath = path.join(schemasPath, filename);
    const schema = JSON.parse(await fs.readFile(filePath));
    const compiled = await compile(schema, schema.title, { bannerComment: '' });

    const eachType = compiled.split('export');
    eachType.forEach((type) => {
      if (!type) {
        return;
      }
      compiledTypes.add(`export ${type.trim()}`);
    });
  });

  const output = Array.from(compiledTypes).join('\n\n');
  const outputPath = path.join(dirname, 'js', 'data', 'api_types.ts');

  try {
    const existing = await fs.readFile(outputPath);
    if (existing.toString() === output) {
      // Skip writing if it hasn't changed, so that we don't confuse any sort of incremental builds.
      // This check isn't ideal but the script runs quickly enough and rarely enough that it doesn't matter.
      console.log(`${emoji.get('heavy_check_mark')}  Schemas are up to date.\n`);
      return;
    }
  } catch (e) {
    // It's fine if there's no output from a previous run.
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  await fs.writeFile(outputPath, output);
  console.log(`${emoji.get('building_construction')}  Wrote Typescript types to ${outputPath}.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
