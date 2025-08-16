# Documentation Index

Complete documentation for Playwright Report Uploader.

## 📚 Quick Links

- [Main README](../README.md) - Complete project overview and getting started
- [Installation Guide](#installation) - Platform-specific installation instructions
- [Cloud Provider Setup](#cloud-providers) - Detailed setup for each cloud provider
- [Troubleshooting](#troubleshooting) - Common issues and solutions
- [API Reference](#api-reference) - Detailed API documentation
- [Examples](#examples) - Practical usage examples

## 🚀 Getting Started

### 1. Installation
Choose your platform for detailed installation instructions:

- **[Windows Setup](setup/windows-setup.md)** - Complete guide for Windows 10/11
- **[macOS Setup](setup/macos-setup.md)** - Complete guide for macOS
- **[Linux Setup](setup/linux-setup.md)** - Complete guide for various Linux distributions

### 2. Quick Start
```bash
# Install the package
npm install playwright-report-uploader

# Set up environment variables
export AWS_BUCKET=my-playwright-reports
export AWS_REGION=us-east-1

# Add to playwright.config.ts
import { PlaywrightReportUploader } from 'playwright-report-uploader';

export default defineConfig({
  reporter: [
    ['html'],
    [PlaywrightReportUploader, {
      provider: 'aws',
      awsBucket: process.env.AWS_BUCKET
    }]
  ]
});
```

## ☁️ Cloud Providers

Detailed setup guides for each supported cloud provider:

### AWS S3
- **[AWS Setup Guide](cloud-providers/aws-setup.md)** - Complete AWS S3 configuration
- Features: S3 buckets, IAM roles, lifecycle policies, CloudFront CDN
- Best for: AWS-native environments, comprehensive feature set

### Azure Blob Storage
- **[Azure Setup Guide](cloud-providers/azure-setup.md)** - Complete Azure Blob Storage configuration
- Features: Storage accounts, managed identity, Azure CDN, lifecycle management
- Best for: Microsoft Azure environments, enterprise scenarios

### Google Cloud Storage
- **[GCP Setup Guide](cloud-providers/gcp-setup.md)** - Complete Google Cloud Storage configuration
- Features: Service accounts, IAM, Cloud CDN, lifecycle policies
- Best for: Google Cloud environments, advanced analytics integration

### Comparison Matrix

| Feature | AWS S3 | Azure Blob | GCP Storage |
|---------|--------|------------|-------------|
| **Setup Complexity** | Medium | Medium | Medium |
| **Authentication** | Access Keys, IAM Roles | Connection String, Managed Identity | Service Account, Workload Identity |
| **CDN Integration** | CloudFront | Azure CDN | Cloud CDN |
| **Lifecycle Management** | ✅ Advanced | ✅ Good | ✅ Advanced |
| **Cost Optimization** | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Global Availability** | ✅ Excellent | ✅ Good | ✅ Excellent |
| **Performance** | ✅ Excellent | ✅ Good | ✅ Excellent |

## 🛠️ Configuration

### Configuration Methods
1. **Environment Variables** - Recommended for CI/CD
2. **JSON Configuration Files** - Good for local development
3. **Programmatic Configuration** - Maximum flexibility

### Configuration Reference
```typescript
interface UploadConfig {
  // Common options
  provider: 'aws' | 'azure' | 'gcp' | 'custom';
  reportDir: string;
  outputDir?: string;
  publicAccess?: boolean;
  generateIndex?: boolean;
  
  // AWS options
  awsRegion?: string;
  awsBucket?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsPrefix?: string;
  
  // Azure options
  azureConnectionString?: string;
  azureContainer?: string;
  azurePrefix?: string;
  
  // GCP options
  gcpProjectId?: string;
  gcpBucket?: string;
  gcpKeyFilePath?: string;
  gcpPrefix?: string;
  
  // Custom provider
  customUploader?: (config: UploadConfig, filePath: string) => Promise<string>;
}
```

## 🔧 API Reference

### Main Classes

#### `PlaywrightReportUploader`
Playwright reporter class for automatic upload integration.

```typescript
class PlaywrightReportUploader {
  constructor(config: Partial<UploadConfig>);
  async onEnd(): Promise<void>;
}
```

#### `UploadManager`
Core upload management class.

```typescript
class UploadManager {
  constructor(config: UploadConfig);
  async uploadReport(): Promise<Map<string, UploadResult>>;
}
```

### Main Functions

#### `uploadReport(configPath?: string): Promise<void>`
Upload reports using configuration file or environment variables.

#### `loadConfig(configPath?: string): Promise<UploadConfig>`
Load and validate configuration from multiple sources.

### Provider Classes

#### `AwsUploader`
```typescript
class AwsUploader {
  constructor(config: UploadConfig);
  async uploadFile(filePath: string): Promise<UploadResult>;
  async uploadDirectory(dirPath: string): Promise<Map<string, UploadResult>>;
}
```

#### `AzureUploader`
```typescript
class AzureUploader {
  constructor(config: UploadConfig);
  async uploadFile(filePath: string): Promise<UploadResult>;
  async uploadDirectory(dirPath: string): Promise<Map<string, UploadResult>>;
}
```

#### `GcpUploader`
```typescript
class GcpUploader {
  constructor(config: UploadConfig);
  async uploadFile(filePath: string): Promise<UploadResult>;
  async uploadDirectory(dirPath: string): Promise<Map<string, UploadResult>>;
}
```

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only  
npm run test:integration

# Watch mode
npm run test:watch
```

### Integration Test Setup
Integration tests require cloud provider credentials:

```bash
# AWS
export AWS_ACCESS_KEY_ID=test-key
export AWS_SECRET_ACCESS_KEY=test-secret
export AWS_BUCKET=test-bucket

# Azure
export AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
export AZURE_CONTAINER=test-container

# GCP
export GCP_PROJECT_ID=test-project
export GCP_BUCKET=test-bucket
export GCP_KEY_FILE_PATH=./test-service-account.json
```

## 🛠️ Troubleshooting

### Common Issues
- **[Troubleshooting Guide](troubleshooting/common-issues.md)** - Comprehensive issue resolution guide

### Quick Fixes

#### Authentication Issues
```bash
# Check credentials
aws sts get-caller-identity  # AWS
az account show              # Azure
gcloud auth list            # GCP
```

#### Permission Issues
```bash
# Test upload manually
aws s3 cp test.html s3://bucket/  # AWS
az storage blob upload ...        # Azure
gsutil cp test.html gs://bucket/  # GCP
```

#### Network Issues
```bash
# Test connectivity
curl -I https://s3.amazonaws.com                    # AWS
curl -I https://account.blob.core.windows.net       # Azure
curl -I https://storage.googleapis.com              # GCP
```

## 📖 Examples

### Playwright Configuration Examples

#### Basic Setup
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { PlaywrightReportUploader } from 'playwright-report-uploader';

export default defineConfig({
  reporter: [
    ['html'],
    [PlaywrightReportUploader, {
      provider: 'aws',
      awsBucket: 'my-reports'
    }]
  ]
});
```

#### Advanced Setup
```typescript
export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    [PlaywrightReportUploader, {
      provider: 'aws',
      reportDir: './playwright-report',
      awsBucket: process.env.AWS_BUCKET,
      awsRegion: process.env.AWS_REGION,
      awsPrefix: `reports/${new Date().toISOString().split('T')[0]}/`,
      publicAccess: true,
      generateIndex: true,
      retentionDays: 30
    }]
  ]
});
```

### CLI Examples
```bash
# Basic usage
npx playwright-report-uploader

# With config file
npx playwright-report-uploader ./config.json

# With specific options
npx playwright-report-uploader --provider aws --bucket my-bucket
```

### Programmatic Examples
```typescript
import { UploadManager, loadConfig } from 'playwright-report-uploader';

// Using config file
const config = await loadConfig('./config.json');
const manager = new UploadManager(config);
await manager.uploadReport();

// Programmatic configuration
const manager2 = new UploadManager({
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  awsRegion: 'us-east-1'
});
await manager2.uploadReport();
```

### CI/CD Examples

#### GitHub Actions
```yaml
- name: Run Playwright Tests
  run: npx playwright test
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_BUCKET: ${{ secrets.AWS_BUCKET }}
```

#### Jenkins
```groovy
environment {
    AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    AWS_BUCKET = 'playwright-reports'
}
```

#### Docker
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal
ENV AWS_BUCKET=my-reports
WORKDIR /app
COPY . .
RUN npm ci
CMD ["npm", "test"]
```

## 🔄 Migration Guides

### Upgrading from v0.x to v1.x
- Configuration changes
- API updates
- Breaking changes

### Migrating Between Providers
- Data export/import
- Configuration mapping
- Cost considerations

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/dreamquality/playwright-report-uploader
cd playwright-report-uploader
npm install
npm run dev
```

### Documentation Guidelines
- Use clear, concise language
- Include code examples
- Test all examples
- Update this index when adding new docs

### Submitting Changes
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add/update documentation
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**📝 Note**: This documentation is continuously updated. If you find any issues or have suggestions for improvement, please [open an issue](https://github.com/dreamquality/playwright-report-uploader/issues) or contribute directly.

