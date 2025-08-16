import AWS from "aws-sdk";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { UploadConfig, UploadResult } from "../types";

/**
 * Uploads files to AWS S3
 */
export class AwsUploader {
  private s3: AWS.S3;
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
    
    // Configure AWS SDK
    AWS.config.update({
      region: config.awsRegion,
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey
    });
    
    this.s3 = new AWS.S3();
  }

  /**
   * Uploads a file to S3
   * @param filePath Local file path
   * @returns Upload result with success status and URL
   */
  async uploadFile(filePath: string): Promise<UploadResult> {
    try {
      const fileContent = await fs.readFile(filePath);
      const fileName = path.basename(filePath);
      const key = this.config.awsPrefix 
        ? `${this.config.awsPrefix.replace(/\/$/, "")}/${fileName}`
        : fileName;
      
      const contentType = mime.lookup(filePath) || "application/octet-stream";
      
      const params = {
        Bucket: this.config.awsBucket!,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: this.config.publicAccess ? "public-read" : "private"
      };
      
      const uploadResult = await this.s3.upload(params).promise();
      
      return {
        success: true,
        url: uploadResult.Location
      };
    } catch (error) {
      console.error(`Error uploading file to S3: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        url: "",
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Uploads a directory to S3
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
      console.error(`Error uploading directory to S3: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return results;
  }
}
