module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0, 'always'],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w*)(?:\/(\w*))?\] (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
};
