// @ts-nocheck
import { GcpUploader } from "../../src/providers/gcp-provider";
import { UploadConfig } from "../../src/types";
import fs from "fs-extra";

// Mock fs-extra
jest.mock("fs-extra");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("GcpUploader", () => {
  let config: UploadConfig;
  let uploader: GcpUploader;

  beforeEach(() => {
    config = {
      provider: "gcp",
      reportDir: "./test-report",
      gcpProjectId: "test-project",
      gcpBucket: "test-bucket",
      gcpPrefix: "reports/",
      publicAccess: true
    };
    uploader = new GcpUploader(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully with public access", async () => {
      const testFilePath = "/test/path/index.html";
      
      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toContain("storage.googleapis.com");
    });

    it("should upload a file successfully with private access", async () => {
      config.publicAccess = false;
      uploader = new GcpUploader(config);
      
      const testFilePath = "/test/path/index.html";
      
      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toBe("https://storage.googleapis.com/test-bucket/test-file.html");
    });

    it("should handle upload errors", async () => {
      // Mock the Storage class to throw an error
      const { Storage } = require("@google-cloud/storage");
      const mockStorage = Storage as jest.MockedClass<typeof Storage>;
      mockStorage.mockImplementation(() => {
        throw new Error("GCP authentication failed");
      });

      expect(() => new GcpUploader(config)).toThrow("GCP authentication failed");
    });
  });

  describe("uploadDirectory", () => {
    it("should upload all files in a directory", async () => {
      const testDir = "/test/report";
      const files = ["index.html", "data.json"];
      
      mockFs.readdir.mockResolvedValue(files as any);
      mockFs.stat.mockImplementation(() => 
        Promise.resolve({ isFile: () => true, isDirectory: () => false } as any)
      );

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(2);
      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
    });
  });
});
