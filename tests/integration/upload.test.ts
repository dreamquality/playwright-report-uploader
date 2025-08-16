import { uploadReport } from "../../src/index";
import { UploadManager } from "../../src/upload-manager";
import { loadConfig } from "../../src/config/config-loader";
import fs from "fs-extra";
import path from "path";
import os from "os";

describe("Integration Tests", () => {
  let tempDir: string;
  let reportDir: string;

  beforeEach(async () => {
    // Create temporary directory for test reports
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "playwright-test-"));
    reportDir = path.join(tempDir, "playwright-report");
    await fs.ensureDir(reportDir);

    // Create sample report files
    await fs.writeFile(
      path.join(reportDir, "index.html"),
      "<html><body>Test Report</body></html>",
    );
    await fs.writeFile(
      path.join(reportDir, "style.css"),
      "body { font-family: Arial; }",
    );
    await fs.writeFile(
      path.join(reportDir, "data.json"),
      JSON.stringify({ tests: [] }),
    );

    // Create subdirectory with assets
    const assetsDir = path.join(reportDir, "assets");
    await fs.ensureDir(assetsDir);
    await fs.writeFile(
      path.join(assetsDir, "screenshot.png"),
      Buffer.from("fake-png-data"),
    );
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  describe("AWS Integration", () => {
    it("should upload to AWS S3 when credentials are provided", async () => {
      // Skip test if AWS credentials are not available
      if (
        !process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_BUCKET
      ) {
        console.log("Skipping AWS integration test - credentials not provided");
        return;
      }

      const config = await loadConfig();
      config.provider = "aws";
      config.reportDir = reportDir;
      config.awsBucket = process.env.AWS_BUCKET;
      config.awsRegion = process.env.AWS_REGION || "us-east-1";
      config.awsPrefix = `test-${Date.now()}/`;

      const manager = new UploadManager(config);
      const results = await manager.uploadReport();

      expect(results.size).toBeGreaterThan(0);

      // Check that all uploads were successful
      for (const [filePath, result] of results.entries()) {
        expect(result.success).toBe(true);
        expect(result.url).toContain("amazonaws.com");
        console.log(`Uploaded: ${filePath} -> ${result.url}`);
      }
    }, 30000); // 30 second timeout for upload
  });

  describe("Azure Integration", () => {
    it("should upload to Azure Blob Storage when credentials are provided", async () => {
      // Skip test if Azure credentials are not available
      if (
        !process.env.AZURE_CONNECTION_STRING ||
        !process.env.AZURE_CONTAINER
      ) {
        console.log(
          "Skipping Azure integration test - credentials not provided",
        );
        return;
      }

      const config = await loadConfig();
      config.provider = "azure";
      config.reportDir = reportDir;
      config.azureConnectionString = process.env.AZURE_CONNECTION_STRING;
      config.azureContainer = process.env.AZURE_CONTAINER;
      config.azurePrefix = `test-${Date.now()}/`;

      const manager = new UploadManager(config);
      const results = await manager.uploadReport();

      expect(results.size).toBeGreaterThan(0);

      // Check that all uploads were successful
      for (const [filePath, result] of results.entries()) {
        expect(result.success).toBe(true);
        expect(result.url).toContain("blob.core.windows.net");
        console.log(`Uploaded: ${filePath} -> ${result.url}`);
      }
    }, 30000);
  });

  describe("GCP Integration", () => {
    it("should upload to Google Cloud Storage when credentials are provided", async () => {
      // Skip test if GCP credentials are not available
      if (!process.env.GCP_PROJECT_ID || !process.env.GCP_BUCKET) {
        console.log("Skipping GCP integration test - credentials not provided");
        return;
      }

      const config = await loadConfig();
      config.provider = "gcp";
      config.reportDir = reportDir;
      config.gcpProjectId = process.env.GCP_PROJECT_ID;
      config.gcpBucket = process.env.GCP_BUCKET;
      config.gcpKeyFilePath = process.env.GCP_KEY_FILE_PATH;
      config.gcpPrefix = `test-${Date.now()}/`;

      const manager = new UploadManager(config);
      const results = await manager.uploadReport();

      expect(results.size).toBeGreaterThan(0);

      // Check that all uploads were successful
      for (const [filePath, result] of results.entries()) {
        expect(result.success).toBe(true);
        expect(result.url).toContain("googleapis.com");
        console.log(`Uploaded: ${filePath} -> ${result.url}`);
      }
    }, 30000);
  });

  describe("Custom Provider Integration", () => {
    it("should work with custom uploader function", async () => {
      const uploadedFiles: string[] = [];

      const config = await loadConfig();
      config.provider = "custom";
      config.reportDir = reportDir;
      config.customUploader = async (cfg, filePath) => {
        uploadedFiles.push(filePath);
        return `https://custom-provider.com/uploads/${path.basename(filePath)}`;
      };

      const manager = new UploadManager(config);
      const results = await manager.uploadReport();

      expect(results.size).toBeGreaterThan(0);
      expect(uploadedFiles.length).toBeGreaterThan(0);

      // Check that all uploads were successful
      for (const [filePath, result] of results.entries()) {
        expect(result.success).toBe(true);
        expect(result.url).toContain("custom-provider.com");
      }
    });
  });

  describe("Configuration Loading", () => {
    it("should load configuration from file", async () => {
      const configPath = path.join(tempDir, "config.json");
      const configData = {
        provider: "aws",
        reportDir: reportDir,
        awsBucket: "test-bucket",
        awsRegion: "us-west-2",
        publicAccess: false,
      };

      await fs.writeJson(configPath, configData);

      const config = await loadConfig(configPath);

      expect(config.provider).toBe("aws");
      expect(config.awsBucket).toBe("test-bucket");
      expect(config.awsRegion).toBe("us-west-2");
      expect(config.publicAccess).toBe(false);
    });
  });
});
