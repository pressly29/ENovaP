module.exports = {
    extends: ['../../.eslintrc.js'],
    settings: {
        'import/resolver': 'node',
    },
    rules: {
        'import/no-extraneous-dependencies': ['off', { devDependencies: ['**/*.spec.*'] }],
    },
};
