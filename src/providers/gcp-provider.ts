import { Storage } from "@google-cloud/storage";
import fs from "fs-extra";
import path from "path";
import mime from "mime-types";
import { UploadConfig, UploadResult } from "../types";

/**
 * Uploads files to Google Cloud Storage
 */
export class GcpUploader {
  private storage: Storage;
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;

    const storageOptions: { projectId?: string; keyFilename?: string } = {
      projectId: config.gcpProjectId,
    };

    if (config.gcpKeyFilePath) {
      storageOptions.keyFilename = config.gcpKeyFilePath;
    }

    this.storage = new Storage(storageOptions);
  }

  /**
   * Uploads a file to Google Cloud Storage
   * @param filePath Local file path
   * @returns Upload result with success status and URL
   */
  async uploadFile(filePath: string): Promise<UploadResult> {
    try {
      const fileName = path.basename(filePath);
      const objectName = this.config.gcpPrefix
        ? `${this.config.gcpPrefix.replace(/\/$/, "")}/${fileName}`
        : fileName;

      const bucket = this.storage.bucket(this.config.gcpBucket!);
      const file = bucket.file(objectName);

      const contentType = mime.lookup(filePath) || "application/octet-stream";

      await bucket.upload(filePath, {
        destination: objectName,
        metadata: {
          contentType,
        },
        public: this.config.publicAccess,
      });

      const url = this.config.publicAccess
        ? `https://storage.googleapis.com/${this.config.gcpBucket}/${objectName}`
        : await file
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          })
          .then((urls) => urls[0]);

      return {
        success: true,
        url,
      };
    } catch (error) {
      console.error(
        `Error uploading file to GCP: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        success: false,
        url: "",
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Uploads a directory to Google Cloud Storage
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
      console.error(
        `Error uploading directory to GCP: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return results;
  }
}
