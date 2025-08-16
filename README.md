# 🚀 Playwright Report Uploader

Automatically upload Playwright HTML reports to cloud storage providers with cross-platform support for AWS S3, Azure Blob Storage, Google Cloud Storage, and custom providers.

[![npm version](https://badge.fury.io/js/playwright-report-uploader.svg)](https://badge.fury.io/js/playwright-report-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-green.svg)](#testing)

## ✨ Features

- 🌥️ **Multi-Cloud Support**: AWS S3, Azure Blob Storage, Google Cloud Storage
- 🎭 **Playwright Integration**: Seamless integration as a custom reporter
- 🔧 **Flexible Configuration**: Environment variables, JSON config files, programmatic setup
- 📋 **Index Generation**: Automatic creation of index.html with file links
- �� **Extensible**: Support for custom cloud providers
- 📘 **TypeScript**: Full TypeScript support with type definitions
- 🖥️ **Cross-Platform**: Windows, macOS, Linux support
- 🔒 **Security**: Secure credential handling and access control
- ✅ **Tested**: Comprehensive unit and integration tests
- 🔄 **CI/CD Ready**: Easy integration with popular CI/CD platforms

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Cloud Provider Setup](#cloud-provider-setup)
- [Platform-Specific Setup](#platform-specific-setup)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Testing](#testing)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 📦 Prerequisites

### System Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0 (or yarn >= 1.22.0)
- **Playwright**: >= 1.20.0

### Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 10/11 | ✅ Supported | PowerShell or Git Bash recommended |
| macOS | ✅ Supported | All versions supported |
| Linux | ✅ Supported | Ubuntu, CentOS, Alpine, etc. |
| Docker | ✅ Supported | All major base images |

### Cloud Provider Requirements

| Provider | Required | Optional |
|----------|----------|----------|
| **AWS S3** | Access Key ID, Secret Access Key, Region, Bucket | KMS Key, IAM Roles |
| **Azure** | Connection String, Container | Storage Account Key, SAS Token |
| **Google Cloud** | Project ID, Bucket | Service Account Key, IAM |

## 🚀 Installation

### NPM

```bash
npm install playwright-report-uploader
```

### Yarn

```bash
yarn add playwright-report-uploader
```

### Development Installation

```bash
git clone https://github.com/dreamquality/playwright-report-uploader
cd playwright-report-uploader
npm install
npm run build
```

## ⚡ Quick Start

### 1. Basic Playwright Integration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { PlaywrightReportUploader } from 'playwright-report-uploader';

export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    [PlaywrightReportUploader, {
      provider: 'aws',
      reportDir: './playwright-report',
      awsBucket: process.env.AWS_BUCKET,
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      publicAccess: true,
      generateIndex: true
    }]
  ],
  // ... other configuration
});
```

### 2. Environment Setup

```bash
# Create .env file
echo "AWS_BUCKET=my-playwright-reports" >> .env
echo "AWS_REGION=us-east-1" >> .env
echo "AWS_ACCESS_KEY_ID=your-access-key" >> .env
echo "AWS_SECRET_ACCESS_KEY=your-secret-key" >> .env
```

### 3. Run Tests

```bash
npx playwright test
# Reports will be automatically uploaded after test completion
```

## ⚙️ Configuration

### Configuration Methods

The uploader supports multiple configuration methods with the following precedence:

1. **Programmatic configuration** (highest priority)
2. **Environment variables**
3. **JSON configuration files**
4. **Default values** (lowest priority)

### Environment Variables

```bash
# General Configuration
export UPLOAD_PROVIDER=aws              # Provider: aws, azure, gcp, custom
export REPORT_DIR=./playwright-report   # Report directory path
export OUTPUT_DIR=./upload-metadata     # Metadata output directory
export PUBLIC_ACCESS=true               # Make files publicly accessible
export GENERATE_INDEX=true              # Generate index.html
export METADATA_FILE=report-metadata.json
export RETENTION_DAYS=30                # File retention period

# AWS S3 Configuration
export AWS_REGION=us-east-1
export AWS_BUCKET=my-playwright-reports
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_PREFIX=reports/               # Optional prefix for S3 keys

# Azure Blob Storage Configuration
export AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=..."
export AZURE_CONTAINER=playwright-reports
export AZURE_PREFIX=reports/

# Google Cloud Storage Configuration
export GCP_PROJECT_ID=my-project-id
export GCP_BUCKET=my-playwright-reports
export GCP_KEY_FILE_PATH=./service-account-key.json
export GCP_PREFIX=reports/
```

### JSON Configuration Files

#### AWS Configuration (config-aws.json)

```json
{
  "provider": "aws",
  "reportDir": "./playwright-report",
  "outputDir": "./upload-metadata",
  "awsRegion": "us-east-1",
  "awsBucket": "my-playwright-reports",
  "awsPrefix": "reports/",
  "publicAccess": true,
  "generateIndex": true,
  "retentionDays": 30
}
```

#### Azure Configuration (config-azure.json)

```json
{
  "provider": "azure",
  "reportDir": "./playwright-report",
  "outputDir": "./upload-metadata",
  "azureConnectionString": "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey;EndpointSuffix=core.windows.net",
  "azureContainer": "playwright-reports",
  "azurePrefix": "reports/",
  "publicAccess": true,
  "generateIndex": true
}
```

#### Google Cloud Configuration (config-gcp.json)

```json
{
  "provider": "gcp",
  "reportDir": "./playwright-report",
  "outputDir": "./upload-metadata",
  "gcpProjectId": "my-project-id",
  "gcpBucket": "my-playwright-reports",
  "gcpKeyFilePath": "./service-account-key.json",
  "gcpPrefix": "reports/",
  "publicAccess": true,
  "generateIndex": true
}
```

## 🎯 Usage

### CLI Usage

```bash
# With configuration file
npx playwright-report-uploader ./config.json

# Using environment variables
npx playwright-report-uploader

# With specific report directory
npx playwright-report-uploader --report-dir ./custom-report-dir
```

### Programmatic Usage

```typescript
import { uploadReport, UploadManager } from 'playwright-report-uploader';

// Simple upload with config file
await uploadReport('./config.json');

// Advanced usage with programmatic config
const config = {
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-reports',
  awsRegion: 'us-west-2',
  publicAccess: true
};

const manager = new UploadManager(config);
const results = await manager.uploadReport();

console.log('Upload results:', results);
```

### Custom Provider Implementation

```typescript
import { UploadManager } from 'playwright-report-uploader';

const config = {
  provider: 'custom',
  reportDir: './playwright-report',
  customUploader: async (config, filePath) => {
    // Your custom upload logic
    const uploadedUrl = await myCustomUpload(filePath);
    return uploadedUrl;
  }
};

const manager = new UploadManager(config);
await manager.uploadReport();
```

## ☁️ Cloud Provider Setup

### AWS S3 Setup

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://my-playwright-reports --region us-east-1
   ```

2. **Create IAM User with S3 Permissions**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::my-playwright-reports/*"
       }
     ]
   }
   ```

3. **Configure Credentials**:
   ```bash
   aws configure
   # OR set environment variables
   export AWS_ACCESS_KEY_ID=your-key
   export AWS_SECRET_ACCESS_KEY=your-secret
   ```

### Azure Blob Storage Setup

1. **Create Storage Account**:
   ```bash
   az storage account create \
     --name myplaywrightreports \
     --resource-group myResourceGroup \
     --location eastus \
     --sku Standard_LRS
   ```

2. **Get Connection String**:
   ```bash
   az storage account show-connection-string \
     --name myplaywrightreports \
     --resource-group myResourceGroup
   ```

3. **Create Container**:
   ```bash
   az storage container create \
     --name reports \
     --connection-string "your-connection-string"
   ```

### Google Cloud Storage Setup

1. **Create Bucket**:
   ```bash
   gsutil mb gs://my-playwright-reports
   ```

2. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create playwright-uploader \
     --display-name "Playwright Report Uploader"
   ```

3. **Grant Permissions**:
   ```bash
   gsutil iam ch serviceAccount:playwright-uploader@project-id.iam.gserviceaccount.com:objectAdmin gs://my-playwright-reports
   ```

4. **Create and Download Key**:
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account playwright-uploader@project-id.iam.gserviceaccount.com
   ```

## 🖥️ Platform-Specific Setup

### Windows Setup

#### Prerequisites
```powershell
# Install Node.js from https://nodejs.org/
# Or using Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### Environment Variables
```powershell
# Using PowerShell
$env:AWS_BUCKET="my-playwright-reports"
$env:AWS_REGION="us-east-1"

# Or create .env file
New-Item -Path .env -ItemType File
Add-Content -Path .env -Value "AWS_BUCKET=my-playwright-reports"
```

#### Git Bash Alternative
```bash
# In Git Bash (recommended for better compatibility)
export AWS_BUCKET=my-playwright-reports
export AWS_REGION=us-east-1
```

### macOS Setup

#### Prerequisites
```bash
# Install Node.js using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

#### Environment Variables
```bash
# Add to ~/.zshrc or ~/.bash_profile
echo 'export AWS_BUCKET=my-playwright-reports' >> ~/.zshrc
echo 'export AWS_REGION=us-east-1' >> ~/.zshrc
source ~/.zshrc
```

### Linux Setup

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### CentOS/RHEL
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

#### Alpine Linux (Docker)
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
```

## 📚 API Reference

### UploadConfig Interface

```typescript
interface UploadConfig {
  // Common configuration
  provider: 'aws' | 'azure' | 'gcp' | 'custom';
  reportDir: string;
  outputDir?: string;
  publicAccess?: boolean;
  generateIndex?: boolean;
  metadataFile?: string;
  retentionDays?: number;

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
}
```

### Main Functions

#### uploadReport(configPath?: string): Promise<void>

Uploads the Playwright report using the specified configuration.

```typescript
// With config file
await uploadReport('./config.json');

// With environment variables
await uploadReport();
```

#### UploadManager Class

```typescript
class UploadManager {
  constructor(config: UploadConfig);
  
  async uploadReport(): Promise<Map<string, UploadResult>>;
}
```

#### PlaywrightReportUploader Class

```typescript
class PlaywrightReportUploader {
  constructor(config: Partial<UploadConfig>);
  
  async onEnd(): Promise<void>;
}
```

### Configuration Loading

#### loadConfig(configPath?: string): Promise<UploadConfig>

Loads configuration from file and environment variables.

```typescript
import { loadConfig } from 'playwright-report-uploader';

const config = await loadConfig('./my-config.json');
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Integration Test Setup

For integration tests, you need to set up cloud provider credentials:

```bash
# AWS
export AWS_ACCESS_KEY_ID=your-test-key
export AWS_SECRET_ACCESS_KEY=your-test-secret
export AWS_BUCKET=test-bucket
export AWS_REGION=us-east-1

# Azure
export AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
export AZURE_CONTAINER=test-container

# Google Cloud
export GCP_PROJECT_ID=test-project
export GCP_BUCKET=test-bucket
export GCP_KEY_FILE_PATH=./test-service-account.json
```

### Testing Custom Providers

```typescript
// tests/custom-provider.test.ts
import { UploadManager } from 'playwright-report-uploader';

describe('Custom Provider', () => {
  it('should upload with custom provider', async () => {
    const uploadedFiles: string[] = [];
    
    const config = {
      provider: 'custom',
      reportDir: './test-report',
      customUploader: async (config, filePath) => {
        uploadedFiles.push(filePath);
        return `https://example.com/uploads/${path.basename(filePath)}`;
      }
    };

    const manager = new UploadManager(config);
    const results = await manager.uploadReport();
    
    expect(uploadedFiles.length).toBeGreaterThan(0);
    expect(Array.from(results.values()).every(r => r.success)).toBe(true);
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests with Report Upload
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run Playwright tests
        run: npm run test:e2e
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_BUCKET: ${{ secrets.AWS_BUCKET }}
          AWS_REGION: us-east-1
      
      - name: Upload reports on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_BUCKET = 'playwright-reports'
        AWS_REGION = 'us-east-1'
    }
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

### Azure DevOps

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: 'playwright-secrets'  # Variable group with cloud credentials

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npx playwright install --with-deps
  displayName: 'Install dependencies'

- script: npm run test:e2e
  env:
    AWS_ACCESS_KEY_ID: $(AWS_ACCESS_KEY_ID)
    AWS_SECRET_ACCESS_KEY: $(AWS_SECRET_ACCESS_KEY)
    AWS_BUCKET: $(AWS_BUCKET)
  displayName: 'Run Playwright tests'

- task: PublishTestResults@2
  condition: succeededOrFailed()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/junit.xml'
```

### GitLab CI

```yaml
stages:
  - test

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:${NODE_VERSION}
  
  before_script:
    - npm ci
    - npx playwright install --with-deps
  
  script:
    - npm run test:e2e
  
  variables:
    AWS_ACCESS_KEY_ID: $AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY: $AWS_SECRET_ACCESS_KEY
    AWS_BUCKET: $AWS_BUCKET
    AWS_REGION: us-east-1
  
  artifacts:
    when: always
    reports:
      junit: test-results/junit.xml
    paths:
      - playwright-report/
    expire_in: 1 week
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Authentication Errors

**AWS Issues:**
```bash
# Check AWS credentials
aws sts get-caller-identity

# Common solutions:
export AWS_PROFILE=your-profile
aws configure list
```

**Azure Issues:**
```bash
# Test connection string
az storage account show --connection-string "your-connection-string"

# Common solutions:
# - Regenerate storage account keys
# - Check firewall settings
# - Verify container permissions
```

**Google Cloud Issues:**
```bash
# Check authentication
gcloud auth list
gcloud config list

# Test service account
gcloud auth activate-service-account --key-file=service-account-key.json
```

#### 2. File Upload Failures

**Large Files:**
```typescript
// Increase timeout for large files
const config = {
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  uploadTimeout: 300000  // 5 minutes
};
```

**Network Issues:**
```typescript
// Implement retry logic
const config = {
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  retryAttempts: 3,
  retryDelay: 1000
};
```

#### 3. Permission Issues

**S3 Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PlaywrightReportUpload",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:user/playwright-uploader"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

#### 4. Platform-Specific Issues

**Windows Path Issues:**
```typescript
// Use forward slashes or path.join()
const config = {
  reportDir: './playwright-report',  // ✅ Good
  // reportDir: '.\\playwright-report',  // ❌ Avoid
};
```

**Linux Permission Issues:**
```bash
# Fix file permissions
chmod +x node_modules/.bin/playwright-report-uploader

# Or use npx
npx playwright-report-uploader
```

### Debug Mode

Enable debug logging:

```bash
# Enable debug mode
export DEBUG=playwright-report-uploader:*

# Run with verbose logging
npx playwright-report-uploader --verbose
```

### Performance Optimization

**Large Reports:**
```typescript
const config = {
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  // Optimize for large files
  multipartThreshold: 20971520,  // 20MB
  partSize: 10485760,            // 10MB
  maxConcurrentParts: 5
};
```

**Parallel Uploads:**
```typescript
const config = {
  provider: 'aws',
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  maxConcurrentUploads: 3  // Upload 3 files simultaneously
};
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/dreamquality/playwright-report-uploader
cd playwright-report-uploader

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build project
npm run build

# Check code quality
npm run lint
npm run lint:fix
```

### Release Process

```bash
# 1. Update version
npm version patch|minor|major

# 2. Build and test
npm run build
npm test

# 3. Publish
npm publish

# 4. Create GitHub release
git push origin main --tags
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/dreamquality/playwright-report-uploader/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/dreamquality/playwright-report-uploader/discussions)
- 📖 **Documentation**: [Full Documentation](https://github.com/dreamquality/playwright-report-uploader#readme)
- 📧 **Email**: support@playwright-report-uploader.com

## 🙏 Acknowledgments

- [Playwright Team](https://github.com/microsoft/playwright) for the amazing testing framework
- [AWS SDK](https://github.com/aws/aws-sdk-js) for S3 integration
- [Azure SDK](https://github.com/Azure/azure-sdk-for-js) for Blob Storage integration
- [Google Cloud SDK](https://github.com/googleapis/nodejs-storage) for Cloud Storage integration

---

**⭐ If this project helped you, please give it a star!**

[![GitHub stars](https://img.shields.io/github/stars/dreamquality/playwright-report-uploader?style=social)](https://github.com/dreamquality/playwright-report-uploader/stargazers)

