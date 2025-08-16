# Google Cloud Storage Setup Guide

Complete guide for configuring Google Cloud Storage for Playwright Report Uploader.

## Overview

This guide covers setting up Google Cloud Storage for storing Playwright HTML reports with proper security, permissions, and optimization.

## Prerequisites

- Google Cloud Platform account with billing enabled
- Google Cloud CLI (gcloud) installed (optional but recommended)
- Basic understanding of GCP IAM and Cloud Storage

## Quick Setup

### 1. Create Project (if needed)

#### Using Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Click project dropdown > "New Project"
3. Configure project:
   - **Project name**: `playwright-reports`
   - **Organization**: Your organization
   - **Location**: Your organization

#### Using gcloud CLI
```bash
# Login to Google Cloud
gcloud auth login

# Create project
gcloud projects create playwright-reports-project \
    --name="Playwright Reports" \
    --set-as-default

# Enable billing (replace with your billing account)
gcloud billing projects link playwright-reports-project \
    --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. Enable Cloud Storage API

#### Using Google Cloud Console
1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click "Enable APIs and Services"
3. Search for "Cloud Storage API"
4. Click "Enable"

#### Using gcloud CLI
```bash
# Enable Cloud Storage API
gcloud services enable storage.googleapis.com
```

### 3. Create Storage Bucket

#### Using Google Cloud Console
1. Go to [Cloud Storage](https://console.cloud.google.com/storage/)
2. Click "Create bucket"
3. Configure bucket:
   - **Name**: `playwright-reports-bucket` (must be globally unique)
   - **Location type**: Region (choose closest to CI/CD)
   - **Storage class**: Standard
   - **Access control**: Uniform (recommended)
   - **Public access**: Allow if you want public reports

#### Using gsutil CLI
```bash
# Create bucket
gsutil mb -p playwright-reports-project \
    -c STANDARD \
    -l us-east1 \
    gs://playwright-reports-bucket

# Set uniform bucket-level access
gsutil uniformbucketlevelaccess set on gs://playwright-reports-bucket
```

### 4. Create Service Account

#### Using Google Cloud Console
1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Configure service account:
   - **Name**: `playwright-uploader`
   - **Description**: `Service account for uploading Playwright reports`
4. Grant roles (see below)
5. Create and download JSON key

#### Using gcloud CLI
```bash
# Create service account
gcloud iam service-accounts create playwright-uploader \
    --display-name="Playwright Report Uploader" \
    --description="Service account for uploading Playwright reports"

# Create and download key
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=playwright-uploader@playwright-reports-project.iam.gserviceaccount.com
```

## Security Configuration

### IAM Roles and Permissions

#### Predefined Roles

```bash
# Storage Object Admin (full control over objects)
gcloud projects add-iam-policy-binding playwright-reports-project \
    --member="serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"

# Storage Object Creator (create objects only)
gcloud projects add-iam-policy-binding playwright-reports-project \
    --member="serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com" \
    --role="roles/storage.objectCreator"

# Storage Object Viewer (read objects only)
gcloud projects add-iam-policy-binding playwright-reports-project \
    --member="serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"
```

#### Custom Role (Minimal Permissions)

```yaml
# custom-role.yaml
title: "Playwright Report Uploader"
description: "Minimal permissions for uploading Playwright reports"
stage: "GA"
includedPermissions:
- storage.objects.create
- storage.objects.get
- storage.objects.list
```

```bash
# Create custom role
gcloud iam roles create playwrightReportUploader \
    --project=playwright-reports-project \
    --file=custom-role.yaml

# Assign custom role
gcloud projects add-iam-policy-binding playwright-reports-project \
    --member="serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com" \
    --role="projects/playwright-reports-project/roles/playwrightReportUploader"
```

#### Bucket-Level Permissions

```bash
# Grant bucket-level permissions
gsutil iam ch serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com:objectAdmin gs://playwright-reports-bucket

# For public read access
gsutil iam ch allUsers:objectViewer gs://playwright-reports-bucket
```

### Bucket Policies

#### Public Access Policy
```json
{
  "bindings": [
    {
      "role": "roles/storage.objectViewer",
      "members": ["allUsers"]
    },
    {
      "role": "roles/storage.objectAdmin",
      "members": ["serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com"]
    }
  ]
}
```

```bash
# Apply bucket policy
gsutil iam set bucket-policy.json gs://playwright-reports-bucket
```

#### Conditional Access Policy
```json
{
  "bindings": [
    {
      "role": "roles/storage.objectAdmin",
      "members": ["serviceAccount:playwright-uploader@playwright-reports-project.iam.gserviceaccount.com"],
      "condition": {
        "title": "Time-based access",
        "description": "Access only during business hours",
        "expression": "request.time.getHours() >= 9 && request.time.getHours() <= 17"
      }
    }
  ]
}
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
      provider: 'gcp',
      reportDir: './playwright-report',
      gcpProjectId: 'playwright-reports-project',
      gcpBucket: 'playwright-reports-bucket',
      gcpKeyFilePath: './service-account-key.json',
      gcpPrefix: 'reports/',
      publicAccess: true,
      generateIndex: true
    }]
  ]
});
```

### Environment Variables

```bash
# Required
export GCP_PROJECT_ID=playwright-reports-project
export GCP_BUCKET=playwright-reports-bucket
export GCP_KEY_FILE_PATH=./service-account-key.json

# Optional
export GCP_PREFIX=reports/
export PUBLIC_ACCESS=true
export GENERATE_INDEX=true

# Alternative authentication methods
export GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
export GCLOUD_PROJECT=playwright-reports-project
```

### JSON Configuration

```json
{
  "provider": "gcp",
  "reportDir": "./playwright-report",
  "gcpProjectId": "playwright-reports-project",
  "gcpBucket": "playwright-reports-bucket",
  "gcpKeyFilePath": "./service-account-key.json",
  "gcpPrefix": "reports/",
  "publicAccess": true,
  "generateIndex": true
}
```

## Advanced Configuration

### Cloud CDN Integration

```bash
# Create load balancer backend bucket
gcloud compute backend-buckets create playwright-reports-backend \
    --gcs-bucket-name=playwright-reports-bucket

# Create URL map
gcloud compute url-maps create playwright-reports-map \
    --default-backend-bucket=playwright-reports-backend

# Create target HTTP proxy
gcloud compute target-http-proxies create playwright-reports-proxy \
    --url-map=playwright-reports-map

# Create global forwarding rule
gcloud compute forwarding-rules create playwright-reports-rule \
    --global \
    --target-http-proxy=playwright-reports-proxy \
    --ports=80
```

### Lifecycle Management

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 30,
          "matchesPrefix": ["reports/"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90,
          "matchesPrefix": ["reports/"]
        }
      },
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 365,
          "matchesPrefix": ["reports/"]
        }
      }
    ]
  }
}
```

```bash
# Apply lifecycle policy
gsutil lifecycle set lifecycle.json gs://playwright-reports-bucket
```

### Cross-Region Replication

```bash
# Create bucket in another region
gsutil mb -p playwright-reports-project \
    -c STANDARD \
    -l europe-west1 \
    gs://playwright-reports-backup

# Enable versioning on both buckets
gsutil versioning set on gs://playwright-reports-bucket
gsutil versioning set on gs://playwright-reports-backup

# Set up transfer job (using Transfer Service)
gcloud transfer jobs create \
    --source-bucket=playwright-reports-bucket \
    --destination-bucket=playwright-reports-backup \
    --schedule-start-date=2024-01-01 \
    --schedule-repeats-every=1d
```

## Authentication Methods

### Service Account Key (Recommended for CI/CD)
```bash
export GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### gcloud Application Default Credentials
```bash
# For local development
gcloud auth application-default login

# For service accounts
gcloud auth activate-service-account \
    --key-file=service-account-key.json
```

### Workload Identity (GKE)
```bash
# Create Kubernetes service account
kubectl create serviceaccount playwright-ksa

# Bind to Google service account
gcloud iam service-accounts add-iam-policy-binding \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:playwright-reports-project.svc.id.goog[default/playwright-ksa]" \
    playwright-uploader@playwright-reports-project.iam.gserviceaccount.com

# Annotate Kubernetes service account
kubectl annotate serviceaccount playwright-ksa \
    iam.gke.io/gcp-service-account=playwright-uploader@playwright-reports-project.iam.gserviceaccount.com
```

### Compute Engine Metadata (For GCE instances)
```typescript
// No credentials needed when running on GCE with service account
const config = {
  provider: 'gcp',
  gcpProjectId: 'playwright-reports-project',
  gcpBucket: 'playwright-reports-bucket'
  // No key file needed
};
```

## Monitoring and Logging

### Cloud Monitoring

```bash
# Enable Cloud Monitoring API
gcloud services enable monitoring.googleapis.com

# Create notification channel (email)
gcloud alpha monitoring channels create \
    --display-name="Playwright Alerts" \
    --type=email \
    --channel-labels=email_address=admin@example.com

# Create alert policy for bucket operations
gcloud alpha monitoring policies create \
    --notification-channels=$NOTIFICATION_CHANNEL_ID \
    --display-name="High bucket operations" \
    --documentation="Alert when bucket operations exceed threshold" \
    --condition-display-name="High operations rate" \
    --condition-filter='resource.type="storage.googleapis.com/Bucket"' \
    --condition-comparison=COMPARISON_GREATER_THAN \
    --condition-threshold-value=1000 \
    --condition-duration=300s
```

### Cloud Audit Logs

```bash
# Enable audit logs for Cloud Storage
gcloud logging sinks create playwright-audit-sink \
    bigquery.googleapis.com/projects/playwright-reports-project/datasets/audit_logs \
    --log-filter='protoPayload.serviceName="storage.googleapis.com"'
```

### Custom Metrics

```bash
# Create custom metric for upload count
gcloud logging metrics create upload_count \
    --description="Number of Playwright report uploads" \
    --log-filter='resource.type="storage.googleapis.com/Bucket" AND protoPayload.methodName="storage.objects.insert"'
```

## Performance Optimization

### Regional Optimization

```typescript
// Choose region closest to your CI/CD infrastructure
const config = {
  provider: 'gcp',
  gcpProjectId: 'playwright-reports-project',
  gcpBucket: 'playwright-reports-bucket',
  // Consider regional buckets for better performance
  gcpRegion: 'us-east1',  // For US-based CI/CD
  // gcpRegion: 'europe-west1',  // For European CI/CD
  // gcpRegion: 'asia-southeast1',  // For Asian CI/CD
};
```

### Parallel Upload Configuration

```typescript
const config = {
  provider: 'gcp',
  gcpBucket: 'playwright-reports-bucket',
  // Optimize for large files
  maxConcurrentUploads: 4,
  chunkSize: 8 * 1024 * 1024,  // 8MB chunks
  retryConfig: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 10000
  }
};
```

### Storage Classes

```bash
# Set default storage class for bucket
gsutil defstorageclass set STANDARD gs://playwright-reports-bucket

# Move objects to different storage class
gsutil rewrite -s NEARLINE gs://playwright-reports-bucket/old-reports/**

# Batch operation
gsutil -m rewrite -s COLDLINE gs://playwright-reports-bucket/archive/**
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Check current authentication
gcloud auth list

# Check application default credentials
gcloud auth application-default print-access-token

# Test service account key
gcloud auth activate-service-account \
    --key-file=service-account-key.json

# Verify permissions
gcloud projects get-iam-policy playwright-reports-project \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:playwright-uploader@"
```

#### 2. Bucket Access Errors
```bash
# Check bucket exists
gsutil ls -p playwright-reports-project

# Test bucket access
gsutil ls gs://playwright-reports-bucket

# Check bucket permissions
gsutil iam get gs://playwright-reports-bucket

# Test upload
echo "test" | gsutil cp - gs://playwright-reports-bucket/test.txt
```

#### 3. Project or API Issues
```bash
# Check current project
gcloud config get-value project

# List enabled APIs
gcloud services list --enabled --filter="name:storage"

# Enable API if needed
gcloud services enable storage.googleapis.com
```

#### 4. Quota and Limits
```bash
# Check quotas
gcloud compute project-info describe \
    --format="table(quotas.metric,quotas.limit,quotas.usage)"

# Check storage limits
gsutil du -sh gs://playwright-reports-bucket
```

### Debug Mode

```typescript
// Enable debug logging
const config = {
  provider: 'gcp',
  gcpBucket: 'playwright-reports-bucket',
  debug: true,
  gcpOptions: {
    projectId: 'playwright-reports-project',
    keyFilename: './service-account-key.json',
    // Enable request logging
    interceptors: [
      {
        request: (options) => {
          console.log('GCS Request:', options);
          return options;
        }
      }
    ]
  }
};
```

```bash
# Enable gcloud debug
gcloud config set core/log_http true
gsutil -D ls gs://playwright-reports-bucket
```

## Security Best Practices

### 1. Service Account Management
- Use dedicated service accounts for different purposes
- Rotate service account keys regularly
- Use workload identity when running on GKE
- Implement least privilege principle

### 2. Bucket Security
- Enable uniform bucket-level access
- Use IAM conditions for time-based or IP-based access
- Regularly audit bucket permissions
- Enable bucket lock for compliance

```bash
# Enable bucket lock
gsutil retention set 3650d gs://playwright-reports-bucket
gsutil retention lock gs://playwright-reports-bucket
```

### 3. Network Security
- Use VPC Service Controls for additional security
- Implement private Google Access
- Use signed URLs for temporary access

```bash
# Generate signed URL
gsutil signurl -d 1h service-account-key.json \
    gs://playwright-reports-bucket/report.html
```

### 4. Encryption
- Enable customer-managed encryption keys (CMEK)
- Use Cloud KMS for key management
- Enable encryption in transit

```bash
# Create KMS key
gcloud kms keyrings create playwright-keyring \
    --location=global

gcloud kms keys create playwright-key \
    --location=global \
    --keyring=playwright-keyring \
    --purpose=encryption

# Set default encryption key for bucket
gsutil kms encryption \
    -k projects/playwright-reports-project/locations/global/keyRings/playwright-keyring/cryptoKeys/playwright-key \
    gs://playwright-reports-bucket
```

## Cost Optimization

### 1. Storage Classes
- Use Standard for frequently accessed reports
- Automatically transition to Nearline/Coldline
- Use Archive for long-term retention

### 2. Lifecycle Management
- Implement automatic deletion policies
- Use object versioning judiciously
- Compress files before upload

### 3. Network Costs
- Choose regions close to your users/CI/CD
- Use Cloud CDN for global distribution
- Consider egress costs for public buckets

### 4. Monitoring Costs
```bash
# Export billing data to BigQuery
gcloud billing accounts list
gcloud billing accounts get-iam-policy BILLING_ACCOUNT_ID

# Create budget alert
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="Playwright Reports Budget" \
    --budget-amount=100USD \
    --threshold-rule=threshold-percent=0.9,spend-basis=current-spend
```

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
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          GCP_PROJECT_ID: playwright-reports-project
          GCP_BUCKET: playwright-reports-bucket
```

### Cloud Build
```yaml
# cloudbuild.yaml
steps:
- name: 'node:18'
  entrypoint: 'npm'
  args: ['ci']

- name: 'mcr.microsoft.com/playwright:v1.40.0-focal'
  entrypoint: 'npx'
  args: ['playwright', 'install', '--with-deps']

- name: 'mcr.microsoft.com/playwright:v1.40.0-focal'
  entrypoint: 'npx'
  args: ['playwright', 'test']
  env:
  - 'GCP_PROJECT_ID=$PROJECT_ID'
  - 'GCP_BUCKET=playwright-reports-bucket'

options:
  machineType: 'E2_HIGHCPU_8'
```

### Cloud Run
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

ENV GCP_PROJECT_ID=playwright-reports-project
ENV GCP_BUCKET=playwright-reports-bucket

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "test"]
```

```bash
# Deploy to Cloud Run
gcloud run deploy playwright-tests \
    --source . \
    --platform managed \
    --region us-central1 \
    --service-account playwright-uploader@playwright-reports-project.iam.gserviceaccount.com
```

### Google Kubernetes Engine
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: playwright-tests
spec:
  template:
    spec:
      serviceAccountName: playwright-ksa
      containers:
      - name: playwright
        image: gcr.io/playwright-reports-project/playwright-tests
        env:
        - name: GCP_PROJECT_ID
          value: "playwright-reports-project"
        - name: GCP_BUCKET
          value: "playwright-reports-bucket"
```

