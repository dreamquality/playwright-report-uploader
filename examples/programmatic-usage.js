// Programmatic usage example
const { UploadManager, loadConfig } = require("../lib/index");

async function uploadToAws() {
  const config = {
    provider: "aws",
    reportDir: "./playwright-report",
    awsRegion: "us-east-1",
    awsBucket: "my-playwright-reports",
    awsPrefix: `reports/${new Date().toISOString().split("T")[0]}/`,
    publicAccess: true,
    generateIndex: true
  };

  const manager = new UploadManager(config);
  const results = await manager.uploadReport();

  console.log("Upload results:", results);
}

async function uploadWithConfigFile() {
  const config = await loadConfig("./config-aws.json");
  const manager = new UploadManager(config);
  await manager.uploadReport();
}

// Custom provider example
async function uploadToCustomProvider() {
  const config = {
    provider: "custom",
    reportDir: "./playwright-report",
    customUploader: async (config, filePath) => {
      // Implement your custom upload logic here
      console.log(`Uploading ${filePath}...`);
      
      // Example: upload to your custom server
      const formData = new FormData();
      const fileContent = require("fs").readFileSync(filePath);
      formData.append("file", fileContent, require("path").basename(filePath));
      
      const response = await fetch("https://my-server.com/upload", {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      return result.url;
    }
  };

  const manager = new UploadManager(config);
  await manager.uploadReport();
}

// Usage examples
if (require.main === module) {
  // Uncomment the example you want to test
  // uploadToAws().catch(console.error);
  // uploadWithConfigFile().catch(console.error);
  // uploadToCustomProvider().catch(console.error);
}

module.exports = {
  uploadToAws,
  uploadWithConfigFile,
  uploadToCustomProvider
};
