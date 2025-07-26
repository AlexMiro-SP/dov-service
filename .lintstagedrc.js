module.exports = {
  // TypeScript files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'tsc --noEmit --skipLibCheck',
  ],
  // JSON, YAML, Markdown files
  '*.{json,yaml,yml,md}': ['prettier --write'],
  // Package files
  'package.json': ['prettier --write'],
  // Prisma schema
  '*.prisma': ['prettier --write'],
};
