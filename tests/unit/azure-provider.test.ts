// @ts-nocheck
import { AzureUploader } from "../../src/providers/azure-provider";
import { UploadConfig } from "../../src/types";
import fs from "fs-extra";

// Mock fs-extra
jest.mock("fs-extra");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("AzureUploader", () => {
  let config: UploadConfig;
  let uploader: AzureUploader;

  beforeEach(() => {
    config = {
      provider: "azure",
      reportDir: "./test-report",
      azureConnectionString: "DefaultEndpointsProtocol=https;AccountName=test;AccountKey=test;EndpointSuffix=core.windows.net",
      azureContainer: "reports",
      azurePrefix: "playwright/",
      publicAccess: true
    };
    uploader = new AzureUploader(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should throw error when connection string is missing", () => {
      const invalidConfig = { ...config, azureConnectionString: undefined };
      
      expect(() => new AzureUploader(invalidConfig)).toThrow("Azure connection string is required");
    });
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      const testFilePath = "/test/path/index.html";
      const testContent = Buffer.from("<html>Test</html>");
      
      mockFs.readFile.mockResolvedValue(testContent);

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://test.blob.core.windows.net/container/test-file.html");
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
  });

  describe("uploadDirectory", () => {
    it("should upload all files in a directory", async () => {
      const testDir = "/test/report";
      const files = ["index.html", "style.css"];
      
      mockFs.readdir.mockResolvedValue(files as any);
      mockFs.stat.mockImplementation(() => 
        Promise.resolve({ isFile: () => true, isDirectory: () => false } as any)
      );
      mockFs.readFile.mockResolvedValue(Buffer.from("test content"));

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(2);
      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
    });
  });
});
