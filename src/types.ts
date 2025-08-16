export interface UploadConfig {
  // Common configuration
  provider: "aws" | "azure" | "gcp" | "custom";
  reportDir: string;
  outputDir?: string;

  // AWS S3 configuration
  awsRegion?: string;
  awsBucket?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsPrefix?: string;

  // Azure Blob Storage configuration
  azureConnectionString?: string;
  azureContainer?: string;
  azurePrefix?: string;

  // Google Cloud Storage configuration
  gcpProjectId?: string;
  gcpBucket?: string;
  gcpKeyFilePath?: string;
  gcpPrefix?: string;

  // Custom provider configuration
  customUploader?: (config: UploadConfig, filePath: string) => Promise<string>;

  // Optional common configuration
  publicAccess?: boolean;
  metadataFile?: string;
  generateIndex?: boolean;
  retentionDays?: number;
}

export interface UploadResult {
  success: boolean;
  url: string;
  errors?: string[];
}
