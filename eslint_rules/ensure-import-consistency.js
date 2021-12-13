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

const SLICES = [/js\/features\/[^/]*\//, /js\/[^/]*\//];

const getSliceName = (path) => {
  const sliceMatcher = SLICES.find((slice) => path.match(slice));
  if (sliceMatcher) {
    return path.match(sliceMatcher)[0];
  }
  return null;
};

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

      const slice = getSliceName(myPath);
      if (slice === getSliceName(absDepPath)) {
        if (!depPath.startsWith('.')) {
          context.report({
            node: sourceNode,
            message: `Modules in the same slice (${slice.replace(
              /^\/+|\/+$/g,
              '',
            )}) should be relatively imported`,
          });
        }
      } else if (depPath.startsWith('../')) {
        context.report({
          node: sourceNode,
          message: `Cross-slice imports should be absolute`,
        });
      }
    }

    return moduleVisitor(checkSourceValue, context.options[0]);
  },
};
