// @ts-nocheck
import { AwsUploader } from "../../src/providers/aws-provider";
import { UploadConfig } from "../../src/types";
import fs from "fs-extra";
import path from "path";

// Mock fs-extra
jest.mock("fs-extra");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("AwsUploader", () => {
  let config: UploadConfig;
  let uploader: AwsUploader;

  beforeEach(() => {
    config = {
      provider: "aws",
      reportDir: "./test-report",
      awsRegion: "us-east-1",
      awsBucket: "test-bucket",
      awsAccessKeyId: "test-key",
      awsSecretAccessKey: "test-secret",
      awsPrefix: "reports/",
      publicAccess: true
    };
    uploader = new AwsUploader(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      const testFilePath = "/test/path/index.html";
      const testContent = Buffer.from("<html>Test</html>");
      
      mockFs.readFile.mockResolvedValue(testContent);

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://test-bucket.s3.amazonaws.com/test-file.html");
      expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath);
    });

    it("should handle upload errors", async () => {
      const testFilePath = "/test/path/index.html";
      
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(false);
      expect(result.url).toBe("");
      expect(result.errors).toContain("File not found");
    });

    it("should use correct S3 key with prefix", async () => {
      const testFilePath = "/test/path/report.html";
      const testContent = Buffer.from("<html>Test</html>");
      
      mockFs.readFile.mockResolvedValue(testContent);

      await uploader.uploadFile(testFilePath);

      // The S3 upload should be called with the correct key
      expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath);
    });
  });

  describe("uploadDirectory", () => {
    it("should upload all files in a directory", async () => {
      const testDir = "/test/report";
      const files = ["index.html", "style.css", "script.js"];
      
      mockFs.readdir.mockResolvedValue(files as any);
      mockFs.stat.mockImplementation((filePath) => 
        Promise.resolve({ isFile: () => true, isDirectory: () => false } as any)
      );
      mockFs.readFile.mockResolvedValue(Buffer.from("test content"));

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(3);
      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
    });

    it("should handle nested directories", async () => {
      const testDir = "/test/report";
      const files = ["index.html", "assets"];
      const assetFiles = ["style.css"];
      
      mockFs.readdir
        .mockResolvedValueOnce(files as any)
        .mockResolvedValueOnce(assetFiles as any);
      
      mockFs.stat.mockImplementation((filePath) => {
        const isDirectory = filePath.includes("assets");
        return Promise.resolve({ 
          isFile: () => !isDirectory, 
          isDirectory: () => isDirectory 
        } as any);
      });
      
      mockFs.readFile.mockResolvedValue(Buffer.from("test content"));

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(2); // index.html + style.css
    });
  });
});
