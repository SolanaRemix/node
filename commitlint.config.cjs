// commitlint.config.js - Enforces Conventional Commits
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // New feature
      'fix',      // Bug fix
      'docs',     // Documentation
      'style',    // Code style
      'refactor', // Code refactor
      'perf',     // Performance
      'test',     // Testing
      'chore',    // Maintenance
      'ci',       // CI/CD
      'build',    // Build system
      'revert'    // Revert commit
    ]],
    'scope-enum': [2, 'always', [
      'blockchain',
      'surgery',
      'tests',
      'security',
      'api',
      'dashboard',
      'release',
      'deps'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100]
  },
  helpUrl: 'https://www.conventionalcommits.org/'
};