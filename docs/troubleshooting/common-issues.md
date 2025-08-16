# Troubleshooting Guide

Comprehensive troubleshooting guide for Playwright Report Uploader across all platforms and cloud providers.

## Quick Diagnosis

### Health Check Script

```bash
#!/bin/bash
echo "🔍 Playwright Report Uploader Health Check"
echo "=========================================="

# Check Node.js
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check Playwright installation
if npx playwright --version >/dev/null 2>&1; then
    echo "✅ Playwright: $(npx playwright --version)"
else
    echo "❌ Playwright: Not installed"
fi

# Check package installation
if npm list playwright-report-uploader >/dev/null 2>&1; then
    echo "✅ playwright-report-uploader: Installed"
else
    echo "❌ playwright-report-uploader: Not installed"
fi

# Check environment variables
echo ""
echo "Environment Variables:"
echo "UPLOAD_PROVIDER: ${UPLOAD_PROVIDER:-Not set}"
echo "REPORT_DIR: ${REPORT_DIR:-Not set}"

# Provider-specific checks
if [ "$UPLOAD_PROVIDER" = "aws" ] || [ -n "$AWS_BUCKET" ]; then
    echo ""
    echo "AWS Configuration:"
    echo "AWS_REGION: ${AWS_REGION:-Not set}"
    echo "AWS_BUCKET: ${AWS_BUCKET:-Not set}"
    echo "AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:+Set}"
    echo "AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY:+Set}"
fi

if [ "$UPLOAD_PROVIDER" = "azure" ] || [ -n "$AZURE_CONNECTION_STRING" ]; then
    echo ""
    echo "Azure Configuration:"
    echo "AZURE_CONNECTION_STRING: ${AZURE_CONNECTION_STRING:+Set}"
    echo "AZURE_CONTAINER: ${AZURE_CONTAINER:-Not set}"
fi

if [ "$UPLOAD_PROVIDER" = "gcp" ] || [ -n "$GCP_PROJECT_ID" ]; then
    echo ""
    echo "GCP Configuration:"
    echo "GCP_PROJECT_ID: ${GCP_PROJECT_ID:-Not set}"
    echo "GCP_BUCKET: ${GCP_BUCKET:-Not set}"
    echo "GCP_KEY_FILE_PATH: ${GCP_KEY_FILE_PATH:-Not set}"
fi
```

## Platform-Specific Issues

### Windows Issues

#### PowerShell Execution Policy
```powershell
# Problem: Scripts cannot be executed
Get-ExecutionPolicy

# Solution: Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass
powershell -ExecutionPolicy Bypass -File script.ps1
```

#### Path Issues
```powershell
# Problem: Forward slash vs backslash in paths
$config = @{
    reportDir = ".\playwright-report"  # ❌ May cause issues
}

# Solution: Use forward slashes
$config = @{
    reportDir = "./playwright-report"  # ✅ Works cross-platform
}
```

#### Environment Variables in PowerShell
```powershell
# Problem: Environment variables not persisting
$env:AWS_BUCKET = "my-bucket"  # Only for current session

# Solution: Set user environment variables
[Environment]::SetEnvironmentVariable("AWS_BUCKET", "my-bucket", "User")

# Or use .env file (recommended)
New-Item -Path .env -ItemType File
Add-Content -Path .env -Value "AWS_BUCKET=my-bucket"
```

#### Node.js Installation Issues
```powershell
# Problem: Node.js not in PATH
node --version  # Command not found

# Solution: Add to PATH or reinstall
$env:PATH += ";C:\Program Files\nodejs"

# Or reinstall Node.js with "Add to PATH" option checked
```

### macOS Issues

#### Xcode Command Line Tools
```bash
# Problem: Missing development tools
xcode-select: error: tool 'clang' requires Xcode

# Solution: Install command line tools
xcode-select --install

# Verify installation
xcode-select -p
```

#### Permission Issues
```bash
# Problem: EACCES permission denied
npm install -g playwright  # Permission denied

# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### Rosetta 2 (Apple Silicon)
```bash
# Problem: Compatibility issues on M1/M2 Macs
arch: arm64

# Solution: Install Rosetta 2
softwareupdate --install-rosetta

# Run with Rosetta if needed
arch -x86_64 npm install
```

#### Browser Installation on macOS
```bash
# Problem: Browser installation fails
npx playwright install chromium  # Fails

# Solution: Install system dependencies
npx playwright install-deps
sudo xcode-select --reset
```

### Linux Issues

#### Missing System Dependencies
```bash
# Problem: Browser launch failures
Error: Failed to launch browser

# Solution: Install dependencies
# Ubuntu/Debian
sudo apt install -y libnss3 libatk-bridge2.0-0 libgtk-3-0 libgbm1

# CentOS/RHEL
sudo yum install -y nss atk at-spi2-atk gtk3 libgbm

# Or use Playwright installer
npx playwright install-deps
```

#### Display Issues (Headless Servers)
```bash
# Problem: No display available
Error: Could not find display

# Solution: Use Xvfb
sudo apt install -y xvfb
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

# Or use xvfb-run
xvfb-run --auto-servernum npx playwright test
```

#### Permission Issues
```bash
# Problem: Permission denied for npm install
npm install  # EACCES error

# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or change npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

#### File Descriptor Limits
```bash
# Problem: Too many open files
Error: EMFILE: too many open files

# Solution: Increase limits
ulimit -n 65536

# Make permanent
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf
```

## Cloud Provider Issues

### AWS Issues

#### Authentication Errors
```bash
# Problem: Unable to locate credentials
Error: Unable to locate credentials

# Solution: Check credential chain
aws sts get-caller-identity

# Set credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret

# Or use AWS profiles
aws configure --profile playwright
export AWS_PROFILE=playwright
```

#### Bucket Access Denied
```bash
# Problem: Access denied to S3 bucket
Error: Access Denied

# Solution: Check bucket policy and IAM permissions
aws s3api get-bucket-policy --bucket my-bucket
aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:user/playwright \
    --action-names s3:PutObject \
    --resource-arns arn:aws:s3:::my-bucket/test.html

# Test manual upload
aws s3 cp test.html s3://my-bucket/
```

#### Region Mismatch
```bash
# Problem: Bucket in different region
Error: The bucket is in this region: us-west-2

# Solution: Set correct region
export AWS_REGION=us-west-2

# Or check bucket region
aws s3api get-bucket-location --bucket my-bucket
```

#### Network Issues
```bash
# Problem: Connection timeouts
Error: Connection timed out

# Solution: Check network connectivity
curl -I https://s3.amazonaws.com

# Configure proxy if needed
export HTTPS_PROXY=http://proxy.company.com:8080
```

### Azure Issues

#### Connection String Issues
```bash
# Problem: Invalid connection string
Error: Invalid connection string

# Solution: Verify connection string format
echo $AZURE_CONNECTION_STRING

# Get connection string from Azure
az storage account show-connection-string \
    --name mystorageaccount \
    --resource-group myresourcegroup
```

#### Container Not Found
```bash
# Problem: Container does not exist
Error: The specified container does not exist

# Solution: Create container
az storage container create \
    --name reports \
    --connection-string "$AZURE_CONNECTION_STRING"

# List containers
az storage container list --connection-string "$AZURE_CONNECTION_STRING"
```

#### Authentication with Managed Identity
```bash
# Problem: Managed identity not working
Error: Unable to get managed identity token

# Solution: Check managed identity configuration
curl -H "Metadata:true" \
    "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://storage.azure.com/"

# Verify role assignment
az role assignment list --assignee $(az account show --query id -o tsv)
```

#### Storage Account Access
```bash
# Problem: Storage account access denied
Error: This request is not authorized

# Solution: Check firewall rules
az storage account show \
    --name mystorageaccount \
    --query networkRuleSet

# Add IP to whitelist
az storage account network-rule add \
    --account-name mystorageaccount \
    --ip-address YOUR_IP
```

### Google Cloud Issues

#### Authentication Errors
```bash
# Problem: Application default credentials not found
Error: Could not load the default credentials

# Solution: Set application credentials
export GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Or login with gcloud
gcloud auth application-default login

# Verify authentication
gcloud auth list
```

#### Bucket Access Denied
```bash
# Problem: Access denied to bucket
Error: Access denied

# Solution: Check IAM permissions
gcloud projects get-iam-policy PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:SERVICE_ACCOUNT_EMAIL"

# Test bucket access
gsutil ls gs://my-bucket

# Add permissions
gsutil iam ch serviceAccount:SA_EMAIL:objectAdmin gs://my-bucket
```

#### Project Not Found
```bash
# Problem: Project does not exist or not accessible
Error: Project not found

# Solution: Check project ID
gcloud config get-value project

# List accessible projects
gcloud projects list

# Set correct project
gcloud config set project PROJECT_ID
```

#### API Not Enabled
```bash
# Problem: Storage API not enabled
Error: Storage API has not been used

# Solution: Enable API
gcloud services enable storage.googleapis.com

# List enabled services
gcloud services list --enabled
```

## Configuration Issues

### Environment Variable Precedence
```typescript
// Configuration precedence (highest to lowest):
// 1. Programmatic configuration
const config = {
  provider: 'aws',
  awsBucket: 'my-bucket'  // ← Highest priority
};

// 2. Environment variables
process.env.AWS_BUCKET = 'env-bucket';

// 3. Config file
// config.json: { "awsBucket": "file-bucket" }

// 4. Default values
// Default: undefined
```

### Invalid Configuration
```javascript
// Problem: Missing required fields
const config = {
  provider: 'aws'
  // Missing awsBucket, awsRegion
};

// Solution: Validate configuration
const requiredFields = {
  aws: ['awsBucket', 'awsRegion'],
  azure: ['azureConnectionString', 'azureContainer'],
  gcp: ['gcpProjectId', 'gcpBucket']
};

function validateConfig(config) {
  const required = requiredFields[config.provider];
  const missing = required.filter(field => !config[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
```

### TypeScript Configuration Issues
```typescript
// Problem: Type errors
const config: UploadConfig = {
  provider: 'invalid-provider'  // Type error
};

// Solution: Use correct types
import { UploadConfig } from 'playwright-report-uploader';

const config: UploadConfig = {
  provider: 'aws',  // ✅ Valid
  reportDir: './playwright-report',
  awsBucket: 'my-bucket',
  awsRegion: 'us-east-1'
};
```

## Performance Issues

### Slow Upload Times
```typescript
// Problem: Uploads taking too long
// Default configuration may not be optimized

// Solution: Optimize upload settings
const config = {
  provider: 'aws',
  awsBucket: 'my-bucket',
  // AWS optimizations
  multipartThreshold: 20971520,  // 20MB
  partSize: 10485760,            // 10MB
  maxConcurrentParts: 5,
  
  // Azure optimizations
  maxConcurrency: 4,
  blockSize: 4 * 1024 * 1024,    // 4MB
  
  // GCP optimizations
  chunkSize: 8 * 1024 * 1024,    // 8MB
  maxConcurrentUploads: 3
};
```

### Memory Issues
```bash
# Problem: Out of memory errors
Error: JavaScript heap out of memory

# Solution: Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"

# Or run with increased memory
node --max_old_space_size=4096 node_modules/.bin/playwright test
```

### Network Timeouts
```typescript
// Problem: Network timeouts
const config = {
  provider: 'aws',
  awsBucket: 'my-bucket',
  // Increase timeouts
  timeout: 300000,  // 5 minutes
  retryConfig: {
    retries: 3,
    retryDelayOptions: {
      customBackoff: (retryCount) => Math.pow(2, retryCount) * 1000
    }
  }
};
```

## Debug Mode

### Enable Debug Logging
```bash
# Environment variable
export DEBUG=playwright-report-uploader:*

# Or specific modules
export DEBUG=playwright-report-uploader:aws,playwright-report-uploader:config
```

```typescript
// Programmatic configuration
const config = {
  provider: 'aws',
  awsBucket: 'my-bucket',
  debug: true,
  logLevel: 'debug'
};
```

### Cloud Provider Debug Modes

#### AWS Debug
```bash
export AWS_DEBUG=1
export DEBUG=aws-sdk:*
```

#### Azure Debug
```bash
export AZURE_LOG_LEVEL=verbose
export DEBUG=azure:*
```

#### GCP Debug
```bash
export GCLOUD_LOG_HTTP=true
export DEBUG=gcp:*
```

## Error Codes Reference

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `ENOENT` | File or directory not found | Check file paths and permissions |
| `EACCES` | Permission denied | Fix file/directory permissions |
| `EMFILE` | Too many open files | Increase file descriptor limits |
| `ENOTFOUND` | DNS lookup failed | Check network connectivity |
| `ECONNRESET` | Connection reset | Check firewall/proxy settings |
| `ETIMEDOUT` | Operation timed out | Increase timeout values |

### AWS Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `NoSuchBucket` | Bucket does not exist | Create bucket or fix bucket name |
| `AccessDenied` | Insufficient permissions | Check IAM policies |
| `InvalidAccessKeyId` | Invalid access key | Verify credentials |
| `SignatureDoesNotMatch` | Invalid secret key | Verify credentials |
| `BucketAlreadyExists` | Bucket name taken | Choose different name |

### Azure Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `ContainerNotFound` | Container does not exist | Create container |
| `AuthenticationFailed` | Invalid credentials | Check connection string |
| `BlobNotFound` | Blob does not exist | Check blob path |
| `InvalidResourceName` | Invalid name format | Fix naming conventions |
| `AccountIsDisabled` | Storage account disabled | Enable storage account |

### GCP Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `401` | Unauthorized | Check authentication |
| `403` | Forbidden | Check IAM permissions |
| `404` | Not found | Check bucket/object exists |
| `409` | Conflict | Resource already exists |
| `429` | Too many requests | Implement retry logic |

## Getting Help

### Information to Collect

When reporting issues, please provide:

1. **Environment Information:**
   ```bash
   # System info
   uname -a
   node --version
   npm --version
   
   # Package versions
   npm list playwright-report-uploader
   npm list @playwright/test
   ```

2. **Configuration (sanitized):**
   ```typescript
   // Remove sensitive information like keys
   const config = {
     provider: 'aws',
     reportDir: './playwright-report',
     awsRegion: 'us-east-1',
     awsBucket: 'my-bucket',
     // DO NOT include access keys
   };
   ```

3. **Error Messages:**
   ```bash
   # Full error output with stack trace
   DEBUG=playwright-report-uploader:* npm test
   ```

4. **Steps to Reproduce:**
   - Minimal reproduction case
   - Expected vs actual behavior
   - Environment differences

### Support Channels

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/dreamquality/playwright-report-uploader/issues)
- **GitHub Discussions**: [Community support and questions](https://github.com/dreamquality/playwright-report-uploader/discussions)
- **Documentation**: [Complete documentation](../README.md)

### Before Reporting

1. Check existing issues and discussions
2. Try the latest version
3. Test with minimal configuration
4. Enable debug mode for detailed logs
5. Follow the troubleshooting steps in this guide

