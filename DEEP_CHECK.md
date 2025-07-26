# Deep Check Documentation

## Overview

The deep check is a comprehensive code quality verification that runs multiple checks to ensure code health and maintainability.

## What Deep Check Includes

```bash
npm run deep-check
```

This command runs the following checks in sequence:

1. **Type Check** (`npm run type-check`)
   - Validates TypeScript types without emitting files
   - Ensures type safety across the codebase

2. **Linting** (`npm run lint`)
   - Runs ESLint with auto-fix enabled
   - Checks code style and potential issues

3. **Format Check** (`npm run format:check`)
   - Verifies code formatting with Prettier
   - Ensures consistent code style

4. **Unit Tests** (`npm run test`)
   - Runs all Jest unit tests
   - Validates business logic and components

5. **E2E Tests** (`npm run test:e2e`)
   - Runs end-to-end tests
   - Validates application integration

## When Deep Check Runs

### Manual Execution

```bash
# Run deep check locally
npm run deep-check
```

### Automated Schedule

- **Weekly**: Every Sunday at 6:00 AM Jerusalem time
- **Workflow**: `.github/workflows/weekly-check.yml`
- **Trigger**: Automatic via GitHub Actions cron schedule

### Manual Trigger

You can manually trigger the weekly check workflow from GitHub Actions UI.

## What Happens on Failure

When the weekly deep check fails:

1. **Automatic Issue Creation**: A GitHub issue is created with:
   - Failure details and timestamp
   - Links to workflow run and logs
   - Action items for resolution

2. **Issue Labels**: `bug`, `automated`, `weekly-check`

3. **Assignee**: Automatically assigned to code owners

## Best Practices

### Before Committing

```bash
# Quick check before commit
npm run type-check
npm run lint
npm run format:check
npm test
```

### Before Deploying

```bash
# Full deep check
npm run deep-check
```

### Fixing Issues

#### TypeScript Errors

```bash
npm run type-check
# Fix reported type issues
```

#### ESLint Issues

```bash
npm run lint
# Most issues auto-fix, manually fix remaining
```

#### Format Issues

```bash
npm run format
# Auto-formats all files
```

#### Test Failures

```bash
npm run test:watch
# Run tests in watch mode for development
```

## Integration with Renovate

The deep check works alongside Renovate for dependency management:

- **Renovate Schedule**: Same time as deep check (Sunday 6 AM)
- **Dependency Updates**: Automatically tested via deep check
- **Quality Gates**: Ensures updates don't break code quality

## Troubleshooting

### Common Issues

1. **TypeScript Errors After Dependency Updates**
   - Check for breaking changes in updated packages
   - Update type definitions if needed

2. **ESLint Rule Conflicts**
   - Review `eslint.config.mjs` configuration
   - Consider rule adjustments for new patterns

3. **Test Failures**
   - Check for environment-specific issues
   - Verify test data and mocks

### Getting Help

1. Check the GitHub issue created by failed weekly check
2. Review workflow logs for specific error details
3. Run individual commands to isolate issues:
   ```bash
   npm run type-check    # TypeScript issues
   npm run lint         # ESLint issues
   npm run test         # Test failures
   ```

## Configuration Files

- **Package Scripts**: `package.json`
- **Weekly Workflow**: `.github/workflows/weekly-check.yml`
- **Renovate Config**: `renovate.json`
- **Code Owners**: `.github/CODEOWNERS`

## Benefits

- **Early Issue Detection**: Catches problems before they reach production
- **Code Quality Maintenance**: Ensures consistent quality standards
- **Automated Monitoring**: Reduces manual oversight burden
- **Integration Safety**: Validates dependency updates automatically
