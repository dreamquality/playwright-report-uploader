// @ts-nocheck
import { AwsUploader } from "../../src/providers/aws-provider";
import { UploadConfig } from "../../src/types";
import fs from "fs-extra";

// Mock AWS SDK with proper hoisting
jest.mock("aws-sdk", () => {
  const mockS3Instance = {
    upload: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({
        Location: "https://test-bucket.s3.amazonaws.com/test-file.html",
      }),
    })),
  };

  return {
    config: {
      update: jest.fn(),
    },
    S3: jest.fn().mockImplementation(() => mockS3Instance),
  };
});

// Mock fs-extra
jest.mock("fs-extra");
const mockFs = fs as jest.Mocked<typeof fs>;

describe("AwsUploader", () => {
  let config: UploadConfig;

  beforeEach(() => {
    config = {
      provider: "aws",
      reportDir: "./test-report",
      awsRegion: "us-east-1",
      awsBucket: "test-bucket",
      awsAccessKeyId: "test-key",
      awsSecretAccessKey: "test-secret",
      awsPrefix: "reports/",
      publicAccess: true,
    };
    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should upload a file successfully", async () => {
      const uploader = new AwsUploader(config);
      const testFilePath = "/test/path/index.html";
      const testContent = Buffer.from("<html>Test</html>");

      mockFs.readFile.mockResolvedValue(testContent);

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(result.url).toBe(
        "https://test-bucket.s3.amazonaws.com/test-file.html",
      );
      expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath);
    });

    it("should handle upload errors", async () => {
      const uploader = new AwsUploader(config);
      const testFilePath = "/test/path/index.html";

      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain("File not found");
    });

    it("should handle file path correctly", async () => {
      const uploader = new AwsUploader(config);
      const testFilePath = "/test/path/subdir/index.html";
      const testContent = Buffer.from("<html>Test</html>");

      mockFs.readFile.mockResolvedValue(testContent);

      const result = await uploader.uploadFile(testFilePath);

      expect(result.success).toBe(true);
      expect(mockFs.readFile).toHaveBeenCalledWith(testFilePath);
    });
  });

  describe("uploadDirectory", () => {
    it("should upload all files in a directory", async () => {
      const uploader = new AwsUploader(config);
      const testDir = "/test/report";
      const files = ["index.html", "data.json"];

      mockFs.readdir.mockResolvedValue(files as any);
      mockFs.stat.mockImplementation(() =>
        Promise.resolve({
          isFile: () => true,
          isDirectory: () => false,
        } as any),
      );
      mockFs.readFile.mockResolvedValue(Buffer.from("test content"));

      const results = await uploader.uploadDirectory(testDir);

      expect(results.size).toBe(2);
      expect(mockFs.readdir).toHaveBeenCalledWith(testDir);
    });
  });
});
