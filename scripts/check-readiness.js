#!/usr/bin/env node

// Package readiness check script
const fs = require("fs");

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ Missing ${description}: ${filePath}`);
    return false;
  }
}

function checkPackageInfo() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  
  console.log("\n📦 Package Information:");
  console.log(`Name: ${pkg.name}`);
  console.log(`Version: ${pkg.version}`);
  console.log(`Description: ${pkg.description}`);
  console.log(`Author: ${pkg.author}`);
  console.log(`License: ${pkg.license}`);
  
  const required = ["name", "version", "description", "main", "types"];
  const missing = required.filter(field => !pkg[field]);
  
  if (missing.length === 0) {
    console.log("✅ All required package.json fields present");
    return true;
  } else {
    console.log("❌ Missing required fields:", missing.join(", "));
    return false;
  }
}

function main() {
  console.log("🔍 Checking package readiness for publication...\n");
  
  let allGood = true;
  
  // Check essential files
  allGood &= checkFile("README.md", "README file");
  allGood &= checkFile("LICENSE", "License file");
  allGood &= checkFile("CHANGELOG.md", "Changelog");
  allGood &= checkFile("package.json", "Package manifest");
  allGood &= checkFile("tsconfig.json", "TypeScript config");
  
  // Check built files
  allGood &= checkFile("lib/index.js", "Main compiled file");
  allGood &= checkFile("lib/index.d.ts", "Type definitions");
  
  // Check source structure
  allGood &= checkFile("src/index.ts", "Main source file");
  allGood &= checkFile("src/types.ts", "Type definitions source");
  
  // Check examples
  allGood &= checkFile("examples/config-aws.json", "AWS config example");
  allGood &= checkFile("examples/config-azure.json", "Azure config example");
  allGood &= checkFile("examples/config-gcp.json", "GCP config example");
  
  // Check tests
  allGood &= checkFile("tests/setup.ts", "Test setup");
  allGood &= checkFile("tests/unit", "Unit tests directory");
  allGood &= checkFile("tests/integration", "Integration tests directory");
  
  // Check package.json
  allGood &= checkPackageInfo();
  
  console.log("\n" + "=".repeat(50));
  
  if (allGood) {
    console.log("�� Package is ready for publication!");
    console.log("\nNext steps:");
    console.log("1. npm run build");
    console.log("2. npm test");
    console.log("3. npm publish");
  } else {
    console.log("❌ Package is not ready for publication.");
    console.log("Please fix the issues above before publishing.");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
