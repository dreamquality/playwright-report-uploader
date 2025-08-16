# Azure Blob Storage Setup Guide

Complete guide for configuring Azure Blob Storage for Playwright Report Uploader.

## Overview

This guide covers setting up Azure Blob Storage for storing Playwright HTML reports with proper security, permissions, and optimization.

## Prerequisites

- Azure Account with active subscription
- Azure CLI installed (optional but recommended)
- Basic understanding of Azure Storage and IAM

## Quick Setup

### 1. Create Storage Account

#### Using Azure Portal
1. Open [Azure Portal](https://portal.azure.com/)
2. Go to "Storage accounts" > "Create"
3. Configure storage account:
   - **Subscription**: Your subscription
   - **Resource group**: Create new or use existing
   - **Storage account name**: `playwrightreports` (must be globally unique)
   - **Region**: Choose closest to your CI/CD infrastructure
   - **Performance**: Standard
   - **Redundancy**: LRS (or GRS for high availability)

#### Using Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create \
    --name playwright-reports-rg \
    --location eastus

# Create storage account
az storage account create \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --location eastus \
    --sku Standard_LRS \
    --kind StorageV2
```

### 2. Create Container

#### Using Azure Portal
1. Go to your storage account
2. Select "Containers" under "Data storage"
3. Click "Container"
4. Configure container:
   - **Name**: `reports`
   - **Public access level**: Blob (for public reports) or Private

#### Using Azure CLI
```bash
# Get connection string
CONNECTION_STRING=$(az storage account show-connection-string \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --output tsv)

# Create container
az storage container create \
    --name reports \
    --connection-string "$CONNECTION_STRING" \
    --public-access blob
```

### 3. Get Connection String

#### Using Azure Portal
1. Go to storage account > "Access keys"
2. Copy "Connection string" from key1 or key2

#### Using Azure CLI
```bash
# Get connection string
az storage account show-connection-string \
    --name playwrightreports \
    --resource-group playwright-reports-rg
```

## Security Configuration

### Access Keys vs SAS Tokens

#### Access Keys (Simple but less secure)
```bash
# Get access keys
az storage account keys list \
    --account-name playwrightreports \
    --resource-group playwright-reports-rg
```

#### SAS Tokens (Recommended)
```bash
# Generate account SAS token
az storage account generate-sas \
    --account-name playwrightreports \
    --account-key YOUR_ACCOUNT_KEY \
    --expiry 2024-12-31T23:59:59Z \
    --permissions rwl \
    --resource-types sco \
    --services b

# Generate container SAS token
az storage container generate-sas \
    --name reports \
    --connection-string "$CONNECTION_STRING" \
    --expiry 2024-12-31T23:59:59Z \
    --permissions rwl
```

### Managed Identity (For Azure Resources)

#### System-Assigned Identity
```bash
# Enable system-assigned identity on VM/App Service
az vm identity assign --name my-vm --resource-group my-rg

# Or for App Service
az webapp identity assign --name my-app --resource-group my-rg
```

#### User-Assigned Identity
```bash
# Create user-assigned identity
az identity create \
    --name playwright-identity \
    --resource-group playwright-reports-rg

# Assign to VM
az vm identity assign \
    --name my-vm \
    --resource-group my-rg \
    --identities /subscriptions/.../resourcegroups/playwright-reports-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/playwright-identity
```

### RBAC Permissions

#### Storage Blob Data Contributor Role
```bash
# Get storage account resource ID
STORAGE_ID=$(az storage account show \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --query id --output tsv)

# Assign role to user
az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee user@domain.com \
    --scope $STORAGE_ID

# Assign role to service principal
az role assignment create \
    --role "Storage Blob Data Contributor" \
    --assignee YOUR_SERVICE_PRINCIPAL_ID \
    --scope $STORAGE_ID
```

#### Custom Role (Minimal Permissions)
```json
{
    "Name": "Playwright Report Uploader",
    "Description": "Minimal permissions for uploading Playwright reports",
    "Actions": [],
    "DataActions": [
        "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/write",
        "Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read"
    ],
    "NotDataActions": [],
    "AssignableScopes": [
        "/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/playwright-reports-rg/providers/Microsoft.Storage/storageAccounts/playwrightreports"
    ]
}
```

```bash
# Create custom role
az role definition create --role-definition role-definition.json

# Assign custom role
az role assignment create \
    --role "Playwright Report Uploader" \
    --assignee YOUR_SERVICE_PRINCIPAL_ID \
    --scope $STORAGE_ID
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
      provider: 'azure',
      reportDir: './playwright-report',
      azureConnectionString: process.env.AZURE_CONNECTION_STRING,
      azureContainer: 'reports',
      azurePrefix: 'playwright/',
      publicAccess: true,
      generateIndex: true
    }]
  ]
});
```

### Environment Variables

```bash
# Required
export AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=playwrightreports;AccountKey=your-key;EndpointSuffix=core.windows.net"
export AZURE_CONTAINER=reports

# Optional
export AZURE_PREFIX=playwright/
export PUBLIC_ACCESS=true
export GENERATE_INDEX=true

# Alternative: Individual components
export AZURE_STORAGE_ACCOUNT=playwrightreports
export AZURE_STORAGE_KEY=your-storage-key
# OR
export AZURE_STORAGE_SAS_TOKEN=your-sas-token
```

### JSON Configuration

```json
{
  "provider": "azure",
  "reportDir": "./playwright-report",
  "azureConnectionString": "DefaultEndpointsProtocol=https;AccountName=playwrightreports;AccountKey=your-key;EndpointSuffix=core.windows.net",
  "azureContainer": "reports",
  "azurePrefix": "playwright/",
  "publicAccess": true,
  "generateIndex": true
}
```

## Advanced Configuration

### Azure CDN Integration

```bash
# Create CDN profile
az cdn profile create \
    --name playwright-cdn \
    --resource-group playwright-reports-rg \
    --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
    --name playwright-reports \
    --profile-name playwright-cdn \
    --resource-group playwright-reports-rg \
    --origin playwrightreports.blob.core.windows.net \
    --origin-host-header playwrightreports.blob.core.windows.net
```

### Lifecycle Management

```json
{
    "rules": [
        {
            "name": "PlaywrightReportLifecycle",
            "type": "Lifecycle",
            "definition": {
                "actions": {
                    "baseBlob": {
                        "tierToCool": {
                            "daysAfterModificationGreaterThan": 30
                        },
                        "tierToArchive": {
                            "daysAfterModificationGreaterThan": 90
                        },
                        "delete": {
                            "daysAfterModificationGreaterThan": 365
                        }
                    }
                },
                "filters": {
                    "prefixMatch": ["reports/"]
                }
            }
        }
    ]
}
```

```bash
# Apply lifecycle policy
az storage account management-policy create \
    --account-name playwrightreports \
    --resource-group playwright-reports-rg \
    --policy lifecycle-policy.json
```

### Geo-Redundancy Setup

```bash
# Create storage account with geo-redundancy
az storage account create \
    --name playwrightreportsgrs \
    --resource-group playwright-reports-rg \
    --location eastus \
    --sku Standard_GRS \
    --access-tier Hot

# Enable read access to secondary region
az storage account update \
    --name playwrightreportsgrs \
    --resource-group playwright-reports-rg \
    --sku Standard_RAGRS
```

## Authentication Methods

### Connection String (Basic)
```bash
export AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=playwrightreports;AccountKey=your-key;EndpointSuffix=core.windows.net"
```

### Account Key
```bash
export AZURE_STORAGE_ACCOUNT=playwrightreports
export AZURE_STORAGE_KEY=your-storage-key
```

### SAS Token
```bash
export AZURE_STORAGE_ACCOUNT=playwrightreports
export AZURE_STORAGE_SAS_TOKEN=your-sas-token
```

### Service Principal
```bash
# Create service principal
az ad sp create-for-rbac \
    --name playwright-sp \
    --role "Storage Blob Data Contributor" \
    --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/playwright-reports-rg/providers/Microsoft.Storage/storageAccounts/playwrightreports

# Use in configuration
export AZURE_CLIENT_ID=your-client-id
export AZURE_CLIENT_SECRET=your-client-secret
export AZURE_TENANT_ID=your-tenant-id
export AZURE_STORAGE_ACCOUNT=playwrightreports
```

### Managed Identity (Azure Resources)
```typescript
// No credentials needed when running on Azure with Managed Identity
const config = {
  provider: 'azure',
  azureStorageAccount: 'playwrightreports',
  azureContainer: 'reports',
  // No connection string or keys needed
  useManagedIdentity: true
};
```

## Monitoring and Logging

### Storage Analytics

```bash
# Enable storage analytics
az storage logging update \
    --services b \
    --log rwd \
    --retention 30 \
    --connection-string "$CONNECTION_STRING"

# Enable metrics
az storage metrics update \
    --services b \
    --api true \
    --hour true \
    --minute false \
    --retention 30 \
    --connection-string "$CONNECTION_STRING"
```

### Azure Monitor Integration

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
    --workspace-name playwright-logs \
    --resource-group playwright-reports-rg \
    --location eastus

# Enable diagnostic settings
az monitor diagnostic-settings create \
    --name storage-diagnostics \
    --resource $STORAGE_ID \
    --workspace playwright-logs \
    --logs '[{"category":"StorageRead","enabled":true},{"category":"StorageWrite","enabled":true}]' \
    --metrics '[{"category":"Transaction","enabled":true}]'
```

### Cost Monitoring

```bash
# Create budget
az consumption budget create \
    --budget-name storage-budget \
    --amount 100 \
    --category Cost \
    --start-date 2024-01-01 \
    --end-date 2024-12-31 \
    --time-grain Monthly \
    --time-period BillingMonth
```

## Performance Optimization

### Hot vs Cool vs Archive Tiers

```bash
# Set blob tier
az storage blob set-tier \
    --name report.html \
    --container-name reports \
    --tier Cool \
    --connection-string "$CONNECTION_STRING"

# Bulk tier change
az storage blob set-tier \
    --name "*.html" \
    --container-name reports \
    --tier Cool \
    --connection-string "$CONNECTION_STRING"
```

### Parallel Upload Configuration

```typescript
const config = {
  provider: 'azure',
  azureConnectionString: process.env.AZURE_CONNECTION_STRING,
  azureContainer: 'reports',
  // Optimize for large files
  maxConcurrency: 4,
  blockSize: 4 * 1024 * 1024,  // 4MB blocks
  maxSingleShotSize: 64 * 1024 * 1024  // 64MB
};
```

### Regional Optimization

```typescript
// Choose region closest to your CI/CD infrastructure
const config = {
  provider: 'azure',
  azureConnectionString: process.env.AZURE_CONNECTION_STRING,
  azureContainer: 'reports',
  // Consider regional endpoints for better performance
  azureEndpoint: 'https://playwrightreports.blob.core.windows.net'
};
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors
```bash
# Test connection string
az storage container list --connection-string "$CONNECTION_STRING"

# Check account access
az storage account show \
    --name playwrightreports \
    --resource-group playwright-reports-rg

# Verify permissions
az role assignment list \
    --assignee YOUR_PRINCIPAL_ID \
    --scope $STORAGE_ID
```

#### 2. Container Not Found
```bash
# List containers
az storage container list --connection-string "$CONNECTION_STRING"

# Check container exists
az storage container show \
    --name reports \
    --connection-string "$CONNECTION_STRING"

# Create container if needed
az storage container create \
    --name reports \
    --connection-string "$CONNECTION_STRING"
```

#### 3. Upload Failures
```bash
# Test manual upload
az storage blob upload \
    --file test.html \
    --name test.html \
    --container-name reports \
    --connection-string "$CONNECTION_STRING"

# Check storage account status
az storage account show \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --query 'statusOfPrimary'
```

#### 4. Access Level Issues
```bash
# Check container access level
az storage container show \
    --name reports \
    --connection-string "$CONNECTION_STRING" \
    --query 'properties.publicAccess'

# Update access level
az storage container set-permission \
    --name reports \
    --public-access blob \
    --connection-string "$CONNECTION_STRING"
```

### Debug Mode

```typescript
// Enable debug logging
const config = {
  provider: 'azure',
  azureConnectionString: process.env.AZURE_CONNECTION_STRING,
  azureContainer: 'reports',
  debug: true,
  azureOptions: {
    enableRequestLogging: true,
    enableResponseLogging: true
  }
};
```

```bash
# Enable Azure CLI debug
export AZURE_DEBUG=1
az storage container list --connection-string "$CONNECTION_STRING" --debug
```

## Security Best Practices

### 1. Access Control
- Use RBAC instead of access keys when possible
- Implement least privilege principle
- Use SAS tokens with limited scope and time
- Regularly rotate access keys

### 2. Network Security
- Configure firewall rules to restrict access
- Use private endpoints for internal access
- Enable secure transfer (HTTPS only)

```bash
# Configure firewall
az storage account network-rule add \
    --account-name playwrightreports \
    --resource-group playwright-reports-rg \
    --ip-address 203.0.113.0/24

# Require secure transfer
az storage account update \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --https-only true
```

### 3. Encryption
- Enable encryption at rest (default)
- Use customer-managed keys for additional control
- Enable encryption in transit

```bash
# Configure customer-managed encryption
az storage account update \
    --name playwrightreports \
    --resource-group playwright-reports-rg \
    --encryption-key-source Microsoft.Keyvault \
    --encryption-key-vault https://myvault.vault.azure.net \
    --encryption-key-name mykey
```

### 4. Monitoring
- Enable diagnostic logging
- Set up alerts for unusual activity
- Monitor access patterns

## Cost Optimization

### 1. Storage Tiers
- Use Hot tier for frequently accessed reports
- Move to Cool tier after 30 days
- Archive old reports for long-term retention

### 2. Lifecycle Management
- Implement automatic tier transitions
- Delete old reports automatically
- Use blob index tags for advanced policies

### 3. Compression
- Compress large reports before upload
- Use appropriate content types
- Consider client-side compression

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
          AZURE_CONNECTION_STRING: ${{ secrets.AZURE_CONNECTION_STRING }}
          AZURE_CONTAINER: reports
```

### Azure DevOps
```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
- group: 'playwright-secrets'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

- script: npm ci
  displayName: 'Install dependencies'

- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers'

- script: npx playwright test
  env:
    AZURE_CONNECTION_STRING: $(AZURE_CONNECTION_STRING)
    AZURE_CONTAINER: reports
  displayName: 'Run Playwright tests'
```

### Docker
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

ENV AZURE_CONTAINER=reports

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "test"]
```

```bash
# Run with Azure credentials
docker run \
  -e AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..." \
  my-playwright-tests
```

### Azure Container Instances
```bash
# Create container instance with managed identity
az container create \
    --name playwright-runner \
    --resource-group playwright-reports-rg \
    --image my-playwright-tests \
    --assign-identity \
    --environment-variables \
        AZURE_STORAGE_ACCOUNT=playwrightreports \
        AZURE_CONTAINER=reports \
    --restart-policy Never
```

