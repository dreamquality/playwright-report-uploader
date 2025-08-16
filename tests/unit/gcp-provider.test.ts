// @ts-nocheck
import { GcpUploader } from "../../src/providers/gcp-provider";
import { UploadConfig } from "../../src/types";
import fs from "fs-extra";

// Mock Google Cloud Storage
const mockBucket = {
  upload: jest.fn().mockResolvedValue(undefined),
  file: jest.fn().mockReturnValue({
    getSignedUrl: jest
      .fn()
      .mockResolvedValue([
        "https://storage.googleapis.com/test-bucket/signed-url",
      ]),
  }),
};

const mockStorage = {
  bucket: jest.fn().mockReturnValue(mockBucket),
};

jest.mock("@google-cloud/storage", () => {
  return {
    Storage: jest.fn().mockImplementation(() => mockStorage),
  };
});

// Mock fs-extra
jest.mock("fs-extra");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("GcpUploader", () => {
  let config: UploadConfig;

  beforeEach(() => {
    config = {
      provider: "gcp",
      reportDir: "./test-report",
      gcpProjectId: "test-project",
      gcpBucket: "test-bucket",
      gcpPrefix: "reports/",
      publicAccess: true,
    };
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully with public access", async () => {
      const uploader = new GcpUploader(config);
      const testFilePath = "/test/path/index.html";

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toContain("storage.googleapis.com");
      expect(mockBucket.upload).toHaveBeenCalledWith(
        testFilePath,
        expect.objectContaining({
          destination: "reports/index.html",
          public: true,
        }),
      );
    });

    it("should upload a file successfully with private access", async () => {
      config.publicAccess = false;
      const uploader = new GcpUploader(config);
      const testFilePath = "/test/path/index.html";

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toContain("storage.googleapis.com");
      expect(mockBucket.upload).toHaveBeenCalledWith(
        testFilePath,
        expect.objectContaining({
          destination: "reports/index.html",
          public: false,
        }),
      );
    });

    it("should handle upload errors", async () => {
      const uploader = new GcpUploader(config);
      const testFilePath = "/test/path/index.html";

      mockBucket.upload.mockRejectedValueOnce(new Error("Upload failed"));

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Upload failed");
    });
  });

  describe("uploadDirectory", () => {
    it("should upload all files in a directory", async () => {
      const uploader = new GcpUploader(config);
      const testDir = "/test/report";
      const files = ["index.html", "data.json"];

      mockFs.readdir.mockResolvedValue(files as any);
      mockFs.stat.mockImplementation(() =>
        Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
        } as any),
      );

      // Reset upload mock to succeed for directory tests
      mockBucket.upload.mockResolvedValue(undefined);

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(2);
      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
    });
  });
});
