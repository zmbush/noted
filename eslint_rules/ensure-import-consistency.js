// Copyright 2021 Zachary Bush.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
const { default: moduleVisitor, makeOptionsSchema } = require('eslint-module-utils/moduleVisitor');
const { default: resolve } = require('eslint-module-utils/resolve');
const { basename, dirname, relative, join } = require('path');

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [makeOptionsSchema()],
  },

  create: function noRelativePackages(context) {
    const myPath = context.getPhysicalFilename
      ? context.getPhysicalFilename()
      : context.getFilename();
    if (myPath === '<text>') return {}; // can't check a non-file

    function checkSourceValue(sourceNode) {
      const depPath = sourceNode.value;

      const absDepPath = resolve(depPath, context);

      if (!absDepPath) {
        // unable to resolve path
        return;
      }

      const relDepPath = relative(dirname(myPath), absDepPath);

      if (relDepPath.match(/node_modules/)) {
        // Don't care about node_modules
        return;
      }

      const shouldBeAbs = {
        node: sourceNode,
        message: 'Imports referring to a parent should use absolute import',
      };

      if (myPath.match(/__tests__/)) {
        const fileUnderTest = join(dirname(dirname(myPath)), basename(myPath));

        if (
          depPath.startsWith('../..') ||
          (depPath.startsWith('..') && absDepPath !== fileUnderTest)
        ) {
          context.report(shouldBeAbs);
        } else if (!depPath.startsWith('..') && absDepPath === fileUnderTest) {
          context.report({
            node: sourceNode,
            message: 'Importing the module under test should always be relative',
          });
        }
      } else if (depPath.startsWith('..')) {
        context.report(shouldBeAbs);
      } else if (!relDepPath.startsWith('..') && !depPath.startsWith('./')) {
        context.report({
          node: sourceNode,
          message: 'Modules in the same directory should be referred to with relative imports',
        });
      }
      if (
        relDepPath.startsWith('..') &&
        ((depPath.startsWith('..') && !myPath.match(/__tests__/)) ||
          (depPath.startsWith('../..') && myPath.match(/__tests__/)))
      ) {
        context.report({
          node: sourceNode,
          message: 'Use global path for parent components',
        });
      }

      //   if (importType(relDepPath, context) === 'parent') {
      //     context.report({
      //       node: sourceNode,
      //       message:
      //         'Relative imports from parent directories are not allowed. ' +
      //         `Please either pass what you're importing through at runtime ` +
      //         `(dependency injection), move \`${basename(myPath)}\` to same ` +
      //         `directory as \`${depPath}\` or consider making \`${depPath}\` a package.`,
      //     });
      //   }
    }

    return moduleVisitor(checkSourceValue, context.options[0]);
  },
};
