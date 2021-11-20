module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module',
        ecmaVersion: 2021
    },
    extends: [
        '@moso/eslint-config-basic'
    ],
    // add your custom rules here
    rules: {
        'template-curly-spacing': 0,
        'indent': ['error', 4, { 'MemberExpression': 0 }],
        'import/no-named-as-default': 0
    }
}
