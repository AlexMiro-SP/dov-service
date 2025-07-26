#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting automated ESLint fixes...\n');

// Files to fix
const filesToFix = [
  'src/template-parameter/dto/template-parameter-ui.dto.ts',
  'src/user/dto/user-ui.dto.ts',
  'src/template-parameter/template-parameter.controller.ts',
  'src/user/user.controller.ts',
  'src/template-parameter/template-parameter.service.ts',
  'src/variation/variation.module.ts',
  'src/main.ts',
  'src/main-minimal.ts'
];

// Fix unused imports
function fixUnusedImports() {
  console.log('📝 Fixing unused imports...');
  
  // Template parameter DTO
  const templateParamDto = 'src/template-parameter/dto/template-parameter-ui.dto.ts';
  if (fs.existsSync(templateParamDto)) {
    let content = fs.readFileSync(templateParamDto, 'utf8');
    content = content.replace(/import.*IsInt.*from.*class-validator.*;\n?/g, '');
    content = content.replace(/import.*Type.*from.*class-transformer.*;\n?/g, '');
    fs.writeFileSync(templateParamDto, content);
    console.log('  ✅ Fixed template-parameter-ui.dto.ts');
  }

  // User DTO
  const userDto = 'src/user/dto/user-ui.dto.ts';
  if (fs.existsSync(userDto)) {
    let content = fs.readFileSync(userDto, 'utf8');
    content = content.replace(/import.*IsInt.*from.*class-validator.*;\n?/g, '');
    content = content.replace(/import.*Type.*from.*class-transformer.*;\n?/g, '');
    fs.writeFileSync(userDto, content);
    console.log('  ✅ Fixed user-ui.dto.ts');
  }

  // Template parameter controller
  const templateController = 'src/template-parameter/template-parameter.controller.ts';
  if (fs.existsSync(templateController)) {
    let content = fs.readFileSync(templateController, 'utf8');
    content = content.replace(/,\s*ApiQuery/g, '');
    content = content.replace(/ApiQuery,\s*/g, '');
    fs.writeFileSync(templateController, content);
    console.log('  ✅ Fixed template-parameter.controller.ts');
  }

  // User controller
  const userController = 'src/user/user.controller.ts';
  if (fs.existsSync(userController)) {
    let content = fs.readFileSync(userController, 'utf8');
    content = content.replace(/,\s*ApiQuery/g, '');
    content = content.replace(/ApiQuery,\s*/g, '');
    fs.writeFileSync(userController, content);
    console.log('  ✅ Fixed user.controller.ts');
  }

  // Template parameter service
  const templateService = 'src/template-parameter/template-parameter.service.ts';
  if (fs.existsSync(templateService)) {
    let content = fs.readFileSync(templateService, 'utf8');
    content = content.replace(/,\s*TemplateParameterUiPaginatedDto/g, '');
    content = content.replace(/TemplateParameterUiPaginatedDto,\s*/g, '');
    fs.writeFileSync(templateService, content);
    console.log('  ✅ Fixed template-parameter.service.ts');
  }

  // Variation module
  const variationModule = 'src/variation/variation.module.ts';
  if (fs.existsSync(variationModule)) {
    let content = fs.readFileSync(variationModule, 'utf8');
    content = content.replace(/,\s*PrismaModule/g, '');
    content = content.replace(/PrismaModule,\s*/g, '');
    fs.writeFileSync(variationModule, content);
    console.log('  ✅ Fixed variation.module.ts');
  }
}

// Fix floating promises
function fixFloatingPromises() {
  console.log('\n🔄 Fixing floating promises...');
  
  const mainFiles = ['src/main.ts', 'src/main-minimal.ts'];
  
  mainFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Fix bootstrap() calls
      content = content.replace(/bootstrap\(\);/g, 'void bootstrap();');
      
      fs.writeFileSync(file, content);
      console.log(`  ✅ Fixed ${file}`);
    }
  });
}

// Add explicit types for any values
function addExplicitTypes() {
  console.log('\n🏷️  Adding explicit types...');
  
  // Fix common any types in services
  const servicesToFix = [
    'src/user/user.service.ts',
    'src/snippet/snippet.service.ts',
    'src/template-parameter/template-parameter.service.ts'
  ];
  
  servicesToFix.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Fix common any patterns
      content = content.replace(/const data: any = {}/g, 'const data: Record<string, unknown> = {}');
      content = content.replace(/const andFilters: any\[\] = \[\]/g, 'const andFilters: Record<string, unknown>[] = []');
      content = content.replace(/let orSearch: any\[\] \| undefined = undefined/g, 'let orSearch: Record<string, unknown>[] | undefined = undefined');
      content = content.replace(/const where: any = {/g, 'const where: Record<string, unknown> = {');
      
      fs.writeFileSync(file, content);
      console.log(`  ✅ Fixed types in ${file}`);
    }
  });
}

// Run fixes
try {
  fixUnusedImports();
  fixFloatingPromises();
  addExplicitTypes();
  
  console.log('\n🎉 Automated fixes completed!');
  console.log('\n📊 Running ESLint to check remaining issues...');
  
  // Run ESLint to see remaining issues
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('\n✅ All ESLint issues resolved!');
  } catch (error) {
    console.log('\n⚠️  Some ESLint issues remain - manual fixes needed');
  }
  
} catch (error) {
  console.error('❌ Error during automated fixes:', error.message);
  process.exit(1);
}
