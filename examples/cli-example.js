#!/usr/bin/env node

// CLI example for uploading Playwright reports
// Usage: node examples/cli-example.js [config-file]

const { uploadReport } = require("../lib/index");
const path = require("path");

async function main() {
  try {
    const configPath = process.argv[2];
    
    console.log("Starting Playwright report upload...");
    console.log("Config:", configPath || "using environment variables");
    
    await uploadReport(configPath);
    
    console.log("✅ Upload completed successfully!");
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
