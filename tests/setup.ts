// @ts-nocheck
// Test setup file

// Mock AWS SDK
jest.mock("aws-sdk", () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: "https://test-bucket.s3.amazonaws.com/test-file.html"
      })
    })
  })),
  config: {
    update: jest.fn()
  }
}));

// Mock Azure SDK
jest.mock("@azure/storage-blob", () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn().mockReturnValue({
      getContainerClient: jest.fn().mockReturnValue({
        createIfNotExists: jest.fn().mockResolvedValue({}),
        getBlockBlobClient: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({}),
          url: "https://test.blob.core.windows.net/container/test-file.html"
        })
      })
    })
  }
}));

// Mock Google Cloud SDK
jest.mock("@google-cloud/storage", () => ({
  Storage: jest.fn().mockImplementation(() => ({
    bucket: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue([]),
      file: jest.fn().mockReturnValue({
        getSignedUrl: jest.fn().mockResolvedValue(["https://storage.googleapis.com/test-bucket/test-file.html"])
      })
    })
  }))
}));

// Console spy to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
