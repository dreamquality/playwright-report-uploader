import fs from "fs-extra";
import path from "path";
import { UploadConfig, UploadResult } from "./types";
import { AwsUploader } from "./providers/aws-provider";
import { AzureUploader } from "./providers/azure-provider";
import { GcpUploader } from "./providers/gcp-provider";

/**
 * Main upload manager that coordinates different cloud providers
 */
export class UploadManager {
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
  }

  /**
   * Uploads the Playwright report to the configured cloud provider
   * @returns Upload results
   */
  async uploadReport(): Promise<Map<string, UploadResult>> {
    console.log(`Starting upload to ${this.config.provider}...`);
    
    // Check if report directory exists
    if (!await fs.pathExists(this.config.reportDir)) {
      throw new Error(`Report directory not found: ${this.config.reportDir}`);
    }

    let uploader: AwsUploader | AzureUploader | GcpUploader;
    
    // Initialize the appropriate provider
    switch (this.config.provider) {
      case "aws":
        uploader = new AwsUploader(this.config);
        break;
      case "azure":
        uploader = new AzureUploader(this.config);
        break;
      case "gcp":
        uploader = new GcpUploader(this.config);
        break;
      case "custom":
        if (!this.config.customUploader) {
          throw new Error("Custom uploader function is required when provider is set to custom");
        }
        return await this.handleCustomUpload();
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }

    // Upload the report directory
    const results = await uploader.uploadDirectory(this.config.reportDir);
    
    // Generate index.html if requested
    if (this.config.generateIndex) {
      await this.generateIndexFile(results);
    }

    // Log results
    this.logResults(results);
    
    return results;
  }

  /**
   * Handles custom upload using the provided custom uploader function
   */
  private async handleCustomUpload(): Promise<Map<string, UploadResult>> {
    const results = new Map<string, UploadResult>();
    
    try {
      const files = await this.getAllFiles(this.config.reportDir);
      
      for (const filePath of files) {
        try {
          const url = await this.config.customUploader!(this.config, filePath);
          results.set(filePath, { success: true, url });
        } catch (error) {
          results.set(filePath, {
            success: false,
            url: "",
            errors: [error instanceof Error ? error.message : String(error)]
          });
        }
      }
    } catch (error) {
      console.error(`Error in custom upload: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return results;
  }

  /**
   * Recursively gets all files in a directory
   */
  private async getAllFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isFile()) {
        files.push(itemPath);
      } else if (stats.isDirectory()) {
        const subFiles = await this.getAllFiles(itemPath);
        files.push(...subFiles);
      }
    }
    
    return files;
  }

  /**
   * Generates an index.html file with links to all uploaded files
   */
  private async generateIndexFile(results: Map<string, UploadResult>): Promise<void> {
    const successfulUploads = Array.from(results.entries())
      .filter(([_, result]) => result.success)
      .map(([filePath, result]) => ({
        fileName: path.basename(filePath),
        url: result.url,
        relativePath: path.relative(this.config.reportDir, filePath)
      }));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report Index</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .file-list { list-style: none; padding: 0; }
        .file-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .file-link { text-decoration: none; color: #0066cc; font-weight: bold; }
        .file-link:hover { text-decoration: underline; }
        .file-path { color: #666; font-size: 0.9em; margin-top: 5px; }
        .stats { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Playwright Test Report</h1>
    <div class="stats">
        <p><strong>Total files:</strong> ${successfulUploads.length}</p>
        <p><strong>Upload date:</strong> ${new Date().toISOString()}</p>
        <p><strong>Provider:</strong> ${this.config.provider}</p>
    </div>
    <ul class="file-list">
        ${successfulUploads.map(file => `
        <li class="file-item">
            <a href="${file.url}" class="file-link" target="_blank">${file.fileName}</a>
            <div class="file-path">${file.relativePath}</div>
        </li>
        `).join("")}
    </ul>
</body>
</html>`;

    const indexPath = path.join(this.config.reportDir, "index.html");
    await fs.writeFile(indexPath, html);
    console.log(`Generated index file: ${indexPath}`);
  }

  /**
   * Logs the upload results
   */
  private logResults(results: Map<string, UploadResult>): void {
    const successful = Array.from(results.values()).filter(r => r.success).length;
    const failed = results.size - successful;
    
    console.log(`
Upload completed:`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log(`
Failed uploads:`);
      for (const [filePath, result] of results.entries()) {
        if (!result.success) {
          console.log(`  ${filePath}: ${result.errors?.join(", ") || "Unknown error"}`);
        }
      }
    }
  }
}
