import { BlobServiceClient } from "@azure/storage-blob";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { UploadConfig, UploadResult } from "../types";

/**
 * Uploads files to Azure Blob Storage
 */
export class AzureUploader {
  private blobServiceClient: BlobServiceClient;
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
    
    if (!config.azureConnectionString) {
      throw new Error("Azure connection string is required");
    }
    
    this.blobServiceClient = BlobServiceClient.fromConnectionString(config.azureConnectionString);
  }

  /**
   * Uploads a file to Azure Blob Storage
   * @param filePath Local file path
   * @returns Upload result with success status and URL
   */
  async uploadFile(filePath: string): Promise<UploadResult> {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const blobName = this.config.azurePrefix 
        ? `${this.config.azurePrefix.replace(/\/$/, "")}/${fileName}`
        : fileName;
      
      const containerClient = this.blobServiceClient.getContainerClient(this.config.azureContainer!);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: this.config.publicAccess ? "blob" : undefined
      });
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const contentType = mime.lookup(filePath) || "application/octet-stream";
      
      await blockBlobClient.upload(fileContent, fileContent.length, {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      });
      
      const url = blockBlobClient.url;
      
      return {
        success: true,
        url
      };
    } catch (error) {
      console.error(`Error uploading file to Azure: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        url: "",
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Uploads a directory to Azure Blob Storage
   * @param dirPath Local directory path
   * @returns Upload results for each file
   */
  async uploadDirectory(dirPath: string): Promise<Map<string, UploadResult>> {
    const results = new Map<string, UploadResult>();
    
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const result = await this.uploadFile(filePath);
          results.set(filePath, result);
        } else if (stats.isDirectory()) {
          // Recursively upload subdirectories
          const subResults = await this.uploadDirectory(filePath);
          for (const [subPath, subResult] of subResults.entries()) {
            results.set(subPath, subResult);
          }
        }
      }
    } catch (error) {
      console.error(`Error uploading directory to Azure: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return results;
  }
}
