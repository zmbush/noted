module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/typescript',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
};
