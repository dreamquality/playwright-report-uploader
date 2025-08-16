import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";
import { UploadConfig } from "../types";

// Load environment variables from .env file
dotenv.config();

/**
 * Loads the uploader configuration from environment variables, config file, or defaults
 * @param configPath Path to the config file (optional)
 * @returns The merged upload configuration
 */
export async function loadConfig(configPath?: string): Promise<UploadConfig> {
  // Default configuration
  const defaultConfig: Partial<UploadConfig> = {
    provider: "aws",
    reportDir: "./playwright-report",
    outputDir: "./upload-metadata",
    publicAccess: true,
    generateIndex: true
  };

  // Load configuration from file if provided
  let fileConfig: Partial<UploadConfig> = {};
  if (configPath && await fs.pathExists(configPath)) {
    const configContent = await fs.readFile(configPath, "utf-8");
    try {
      fileConfig = JSON.parse(configContent);
    } catch (error) {
      console.error(`Error parsing config file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Load configuration from environment variables
  const envConfig: Partial<UploadConfig> = {
    provider: process.env.UPLOAD_PROVIDER as UploadConfig["provider"],
    reportDir: process.env.REPORT_DIR,
    outputDir: process.env.OUTPUT_DIR,
    
    // AWS configuration
    awsRegion: process.env.AWS_REGION,
    awsBucket: process.env.AWS_BUCKET,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsPrefix: process.env.AWS_PREFIX,
    
    // Azure configuration
    azureConnectionString: process.env.AZURE_CONNECTION_STRING,
    azureContainer: process.env.AZURE_CONTAINER,
    azurePrefix: process.env.AZURE_PREFIX,
    
    // GCP configuration
    gcpProjectId: process.env.GCP_PROJECT_ID,
    gcpBucket: process.env.GCP_BUCKET,
    gcpKeyFilePath: process.env.GCP_KEY_FILE_PATH,
    gcpPrefix: process.env.GCP_PREFIX,
    
    // Other configuration
    publicAccess: process.env.PUBLIC_ACCESS === "true",
    metadataFile: process.env.METADATA_FILE,
    generateIndex: process.env.GENERATE_INDEX === "true",
    retentionDays: process.env.RETENTION_DAYS ? parseInt(process.env.RETENTION_DAYS, 10) : undefined
  };

  // Merge configurations (env vars override file config, file config overrides defaults)
  const config: UploadConfig = {
    ...defaultConfig,
    ...fileConfig,
    ...Object.fromEntries(Object.entries(envConfig).filter(([_, v]) => v !== undefined))
  } as UploadConfig;

  return config;
}

/**
 * Saves the upload metadata to a JSON file
 * @param config The upload configuration
 * @param metadata The metadata to save
 */
export async function saveMetadata(config: UploadConfig, metadata: Record<string, any>): Promise<void> {
  if (!config.outputDir) {
    return;
  }
  
  await fs.ensureDir(config.outputDir);
  const metadataPath = path.join(config.outputDir, config.metadataFile || "report-metadata.json");
  await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  
  console.log(`Metadata saved to ${metadataPath}`);
}
