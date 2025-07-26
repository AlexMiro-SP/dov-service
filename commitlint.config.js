module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system or external dependencies
        'ci',       // CI/CD configuration changes
        'chore',    // Maintenance tasks
        'revert',   // Reverting previous commits
      ],
    ],
    // Subject case - allow sentence-case, start-case, pascal-case, upper-case, lower-case
    'subject-case': [0],
    // Subject length
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 3],
    // Body max line length
    'body-max-line-length': [2, 'always', 100],
    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],
  },
};
