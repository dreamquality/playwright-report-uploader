import { loadConfig, saveMetadata } from "./config/config-loader";
import { UploadManager } from "./upload-manager";
import { UploadConfig } from "./types";

/**
 * Main function to upload Playwright reports
 * @param configPath Optional path to configuration file
 * @returns Promise that resolves when upload is complete
 */
export async function uploadReport(configPath?: string): Promise<void> {
  try {
    // Load configuration
    const config = await loadConfig(configPath);
    
    // Create upload manager
    const manager = new UploadManager(config);
    
    // Upload the report
    const results = await manager.uploadReport();
    
    // Save metadata
    const metadata = {
      uploadDate: new Date().toISOString(),
      provider: config.provider,
      reportDir: config.reportDir,
      results: Array.from(results.entries()).map(([filePath, result]) => ({
        filePath,
        success: result.success,
        url: result.url,
        errors: result.errors
      }))
    };
    
    await saveMetadata(config, metadata);
    
    console.log("Report upload completed successfully!");
  } catch (error) {
    console.error(`Error uploading report: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Playwright reporter that automatically uploads reports after test completion
 */
export class PlaywrightReportUploader {
  private config: UploadConfig;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = {
      provider: "aws",
      reportDir: "./playwright-report",
      outputDir: "./upload-metadata",
      publicAccess: true,
      generateIndex: true,
      ...config
    } as UploadConfig;
  }

  /**
   * Called by Playwright after all tests are finished
   */
  async onEnd(): Promise<void> {
    try {
      console.log("Starting automatic report upload...");
      const manager = new UploadManager(this.config);
      await manager.uploadReport();
    } catch (error) {
      console.error(`Auto-upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export types and classes for external use
export { UploadConfig, UploadResult } from "./types";
export { UploadManager } from "./upload-manager";
export { loadConfig, saveMetadata } from "./config/config-loader";
export { AwsUploader } from "./providers/aws-provider";
export { AzureUploader } from "./providers/azure-provider";
export { GcpUploader } from "./providers/gcp-provider";

// CLI support
if (require.main === module) {
  const configPath = process.argv[2];
  uploadReport(configPath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
