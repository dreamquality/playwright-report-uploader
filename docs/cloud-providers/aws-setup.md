# AWS S3 Setup Guide

Complete guide for configuring AWS S3 for Playwright Report Uploader.

## Overview

This guide covers setting up AWS S3 for storing Playwright HTML reports with proper security, permissions, and optimization.

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS IAM and S3

## Quick Setup

### 1. Create S3 Bucket

#### Using AWS Console
1. Open [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Configure bucket:
   - **Bucket name**: `my-playwright-reports` (must be globally unique)
   - **Region**: Choose closest to your CI/CD infrastructure
   - **Block Public Access**: Uncheck if you want public reports
   - **Versioning**: Enable (recommended)
   - **Encryption**: Enable with SSE-S3

#### Using AWS CLI
```bash
# Create bucket
aws s3 mb s3://my-playwright-reports --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket my-playwright-reports \
    --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket my-playwright-reports \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
```

### 2. Create IAM User

#### Using AWS Console
1. Open [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Go to "Users" > "Add user"
3. Configure user:
   - **Username**: `playwright-uploader`
   - **Access type**: Programmatic access
4. Attach policy (see below)
5. Save Access Key ID and Secret Access Key

#### Using AWS CLI
```bash
# Create user
aws iam create-user --user-name playwright-uploader

# Create access key
aws iam create-access-key --user-name playwright-uploader
```

## Security Configuration

### IAM Policy for Report Upload

#### Minimal Permissions (Recommended)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PlaywrightReportUpload",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::my-playwright-reports/*"
        },
        {
            "Sid": "PlaywrightReportList",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::my-playwright-reports"
        }
    ]
}
```

#### Extended Permissions (For Management)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PlaywrightReportManagement",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::my-playwright-reports",
                "arn:aws:s3:::my-playwright-reports/*"
            ]
        }
    ]
}
```

#### Apply Policy
```bash
# Create policy
aws iam create-policy \
    --policy-name PlaywrightReportUploader \
    --policy-document file://policy.json

# Attach policy to user
aws iam attach-user-policy \
    --user-name playwright-uploader \
    --policy-arn arn:aws:iam::ACCOUNT-ID:policy/PlaywrightReportUploader
```

### Bucket Policies

#### Public Read Access (For Public Reports)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadAccess",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-playwright-reports/*"
        }
    ]
}
```

#### Apply Bucket Policy
```bash
aws s3api put-bucket-policy \
    --bucket my-playwright-reports \
    --policy file://bucket-policy.json
```

## Configuration Options

### Basic Configuration

```typescript
// playwright.config.ts
import { PlaywrightReportUploader } from 'playwright-report-uploader';

export default defineConfig({
  reporter: [
    ['html'],
    [PlaywrightReportUploader, {
      provider: 'aws',
      reportDir: './playwright-report',
      awsRegion: 'us-east-1',
      awsBucket: 'my-playwright-reports',
      awsPrefix: 'reports/',
      publicAccess: true,
      generateIndex: true
    }]
  ]
});
```

### Environment Variables

```bash
# Required
export AWS_REGION=us-east-1
export AWS_BUCKET=my-playwright-reports
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Optional
export AWS_PREFIX=reports/
export AWS_SESSION_TOKEN=token  # For temporary credentials
export PUBLIC_ACCESS=true
export GENERATE_INDEX=true
```

### JSON Configuration

```json
{
  "provider": "aws",
  "reportDir": "./playwright-report",
  "awsRegion": "us-east-1",
  "awsBucket": "my-playwright-reports",
  "awsPrefix": "reports/",
  "publicAccess": true,
  "generateIndex": true,
  "retentionDays": 30
}
```

## Advanced Configuration

### Cross-Region Replication

```bash
# Create replication role
aws iam create-role \
    --role-name replication-role \
    --assume-role-policy-document file://trust-policy.json

# Create destination bucket
aws s3 mb s3://my-playwright-reports-backup --region us-west-2

# Configure replication
aws s3api put-bucket-replication \
    --bucket my-playwright-reports \
    --replication-configuration file://replication.json
```

### Lifecycle Policies

```json
{
    "Rules": [
        {
            "ID": "PlaywrightReportLifecycle",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "reports/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {
                "Days": 365
            }
        }
    ]
}
```

```bash
# Apply lifecycle policy
aws s3api put-bucket-lifecycle-configuration \
    --bucket my-playwright-reports \
    --lifecycle-configuration file://lifecycle.json
```

### CloudFront Distribution (CDN)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://distribution-config.json
```

```json
{
    "CallerReference": "playwright-reports-cdn",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-my-playwright-reports",
                "DomainName": "my-playwright-reports.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-my-playwright-reports",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "DefaultTTL": 86400
    },
    "Enabled": true
}
```

## Authentication Methods

### Access Keys (Basic)
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
```

### IAM Roles (EC2/ECS/Lambda)
```typescript
// No credentials needed when running on AWS with IAM roles
const config = {
  provider: 'aws',
  awsRegion: 'us-east-1',
  awsBucket: 'my-playwright-reports'
  // No access keys needed
};
```

### AWS Profiles
```bash
# Configure profile
aws configure --profile playwright
export AWS_PROFILE=playwright
```

### Temporary Credentials (STS)
```bash
# Assume role
aws sts assume-role \
    --role-arn arn:aws:iam::123456789012:role/PlaywrightRole \
    --role-session-name playwright-session

# Use returned credentials
export AWS_ACCESS_KEY_ID=returned-access-key
export AWS_SECRET_ACCESS_KEY=returned-secret-key
export AWS_SESSION_TOKEN=returned-session-token
```

## Monitoring and Logging

### CloudWatch Metrics

Enable S3 request metrics:
```bash
aws s3api put-bucket-metrics-configuration \
    --bucket my-playwright-reports \
    --id PlaywrightReports \
    --metrics-configuration '{
        "Id": "PlaywrightReports",
        "Filter": {
            "Prefix": "reports/"
        }
    }'
```

### CloudTrail Logging

```json
{
    "TrailName": "playwright-s3-trail",
    "S3BucketName": "my-cloudtrail-logs",
    "IncludeGlobalServiceEvents": true,
    "IsLogging": true,
    "EnableLogFileValidation": true,
    "EventSelectors": [
        {
            "ReadWriteType": "All",
            "IncludeManagementEvents": false,
            "DataResources": [
                {
                    "Type": "AWS::S3::Object",
                    "Values": ["arn:aws:s3:::my-playwright-reports/*"]
                }
            ]
        }
    ]
}
```

### Cost Monitoring

```bash
# Create billing alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "S3-PlaywrightReports-Cost" \
    --alarm-description "Monitor S3 costs" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 86400 \
    --threshold 100 \
    --comparison-operator GreaterThanThreshold \
    --dimensions Name=Currency,Value=USD Name=ServiceName,Value=AmazonS3
```

## Performance Optimization

### Multi-part Upload Configuration

```typescript
const config = {
  provider: 'aws',
  awsBucket: 'my-playwright-reports',
  // Optimize for large files
  multipartThreshold: 20971520,  // 20MB
  partSize: 10485760,            // 10MB
  maxConcurrentParts: 5,
  maxRetries: 3,
  retryDelayOptions: {
    customBackoff: (retryCount) => Math.pow(2, retryCount) * 100
  }
};
```

### Transfer Acceleration

```bash
# Enable Transfer Acceleration
aws s3api put-bucket-accelerate-configuration \
    --bucket my-playwright-reports \
    --accelerate-configuration Status=Enabled
```

```typescript
// Use accelerated endpoint
const config = {
  provider: 'aws',
  awsBucket: 'my-playwright-reports',
  awsS3Config: {
    useAccelerateEndpoint: true
  }
};
```

### Regional Optimization

```typescript
// Choose region closest to your CI/CD infrastructure
const config = {
  provider: 'aws',
  awsRegion: 'us-east-1',  // Virginia (GitHub Actions)
  // awsRegion: 'eu-west-1',   // Ireland (European CI)
  // awsRegion: 'ap-southeast-1',  // Singapore (Asian CI)
  awsBucket: 'my-playwright-reports'
};
```

## Troubleshooting

### Common Issues

#### 1. Access Denied Errors
```bash
# Check IAM permissions
aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:user/playwright-uploader \
    --action-names s3:PutObject \
    --resource-arns arn:aws:s3:::my-playwright-reports/test.html

# Check bucket policy
aws s3api get-bucket-policy --bucket my-playwright-reports

# Test upload manually
aws s3 cp test.html s3://my-playwright-reports/test.html
```

#### 2. Bucket Not Found
```bash
# Check bucket exists and region
aws s3api head-bucket --bucket my-playwright-reports

# List buckets
aws s3 ls

# Check region
aws s3api get-bucket-location --bucket my-playwright-reports
```

#### 3. Credential Issues
```bash
# Verify credentials
aws sts get-caller-identity

# Check credential precedence
aws configure list

# Test with temporary credentials
aws sts get-session-token
```

#### 4. Network Issues
```bash
# Test connectivity
curl -I https://s3.amazonaws.com

# Check for proxy issues
export HTTPS_PROXY=http://proxy.company.com:8080
aws s3 ls
```

### Debug Mode

```typescript
// Enable debug logging
const config = {
  provider: 'aws',
  awsBucket: 'my-playwright-reports',
  debug: true,
  awsS3Config: {
    logger: console,
    logLevel: 'debug'
  }
};
```

```bash
# Enable AWS CLI debug
export AWS_DEBUG=1
aws s3 ls s3://my-playwright-reports --debug
```

## Security Best Practices

### 1. Least Privilege Access
- Grant only necessary permissions
- Use specific resource ARNs
- Regularly review and rotate access keys

### 2. Encryption
- Enable server-side encryption (SSE-S3 or SSE-KMS)
- Use HTTPS for all transfers
- Consider client-side encryption for sensitive data

### 3. Access Logging
- Enable CloudTrail for API calls
- Enable S3 access logging
- Monitor unusual access patterns

### 4. Bucket Security
- Block public access unless needed
- Use bucket policies to restrict access
- Enable MFA delete for critical buckets

### 5. Network Security
- Use VPC endpoints for private access
- Restrict access by IP if possible
- Monitor network traffic

## Cost Optimization

### 1. Storage Classes
- Use Standard for frequently accessed reports
- Transition to IA after 30 days
- Archive to Glacier for long-term retention

### 2. Lifecycle Management
- Automatically delete old reports
- Compress large files before upload
- Use intelligent tiering for mixed access patterns

### 3. Request Optimization
- Batch small files when possible
- Use multipart uploads for large files
- Minimize list operations

### 4. Monitoring
- Set up billing alerts
- Use AWS Cost Explorer
- Review usage regularly

## Integration Examples

### GitHub Actions
```yaml
name: Playwright Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
          AWS_BUCKET: my-playwright-reports
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    environment {
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
        AWS_REGION = 'us-east-1'
        AWS_BUCKET = 'my-playwright-reports'
    }
    stages {
        stage('Test') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
                sh 'npx playwright test'
            }
        }
    }
}
```

### Docker
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

ENV AWS_REGION=us-east-1
ENV AWS_BUCKET=my-playwright-reports

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "test"]
```

```bash
# Run with AWS credentials
docker run \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  my-playwright-tests
```

