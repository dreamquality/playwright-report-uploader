# Windows Setup Guide

Complete guide for setting up Playwright Report Uploader on Windows.

## Prerequisites

### System Requirements
- Windows 10 or Windows 11
- Windows PowerShell 5.1+ or PowerShell 7+
- Git for Windows (recommended)
- Internet connection

### Node.js Installation

#### Option 1: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for Windows
3. Run the installer with default settings
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

#### Option 2: Using Chocolatey
```powershell
# Install Chocolatey first (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Verify installation
node --version
npm --version
```

#### Option 3: Using winget
```powershell
# Install Node.js using Windows Package Manager
winget install OpenJS.NodeJS

# Verify installation
node --version
npm --version
```

## Installation

### 1. Create Project Directory
```powershell
# Create and navigate to project directory
mkdir my-playwright-project
cd my-playwright-project

# Initialize npm project
npm init -y
```

### 2. Install Playwright and Report Uploader
```powershell
# Install Playwright
npm install @playwright/test

# Install Playwright Report Uploader
npm install playwright-report-uploader

# Install Playwright browsers
npx playwright install
```

### 3. Environment Setup

#### PowerShell Environment Variables
```powershell
# Set environment variables for current session
$env:AWS_BUCKET = "my-playwright-reports"
$env:AWS_REGION = "us-east-1"
$env:AWS_ACCESS_KEY_ID = "your-access-key"
$env:AWS_SECRET_ACCESS_KEY = "your-secret-key"

# Verify variables
Get-ChildItem Env: | Where-Object {$_.Name -like "AWS_*"}
```

#### Persistent Environment Variables
```powershell
# Set system-wide environment variables (requires admin)
[Environment]::SetEnvironmentVariable("AWS_BUCKET", "my-playwright-reports", "User")
[Environment]::SetEnvironmentVariable("AWS_REGION", "us-east-1", "User")

# Or use Windows GUI:
# 1. Right-click "This PC" > Properties
# 2. Click "Advanced system settings"
# 3. Click "Environment Variables"
# 4. Add variables under "User variables"
```

#### .env File (Recommended)
```powershell
# Create .env file
New-Item -Path .env -ItemType File

# Add content to .env file
@"
AWS_BUCKET=my-playwright-reports
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
UPLOAD_PROVIDER=aws
PUBLIC_ACCESS=true
GENERATE_INDEX=true
"@ | Out-File -FilePath .env -Encoding UTF8
```

### 4. Configuration

#### Create Playwright Configuration
```powershell
# Create playwright.config.ts
@"
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
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
"@ | Out-File -FilePath playwright.config.ts -Encoding UTF8
```

## Testing Installation

### 1. Create Sample Test
```powershell
# Create tests directory
mkdir tests

# Create sample test
@"
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
"@ | Out-File -FilePath tests/example.spec.ts -Encoding UTF8
```

### 2. Run Tests
```powershell
# Run Playwright tests
npx playwright test

# Run with specific browser
npx playwright test --project=chromium

# Run in headed mode
npx playwright test --headed
```

## Windows-Specific Configuration

### PowerShell Execution Policy
```powershell
# Check current execution policy
Get-ExecutionPolicy

# Set execution policy for current user (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify
Get-ExecutionPolicy -List
```

### Path Configuration
```powershell
# Add npm global bin to PATH (if needed)
$npmPath = npm config get prefix
$env:PATH = "$env:PATH;$npmPath"

# Make permanent
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
```

### Firewall Configuration
```powershell
# If running behind corporate firewall, configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Verify configuration
npm config list
```

## Troubleshooting

### Common Windows Issues

#### 1. PowerShell Script Execution
```powershell
# If you get execution policy errors
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Or run with bypass
powershell -ExecutionPolicy Bypass -File script.ps1
```

#### 2. Path Issues
```powershell
# Use forward slashes in configuration
$config = @{
    reportDir = "./playwright-report"  # ✅ Good
    # reportDir = ".\playwright-report"  # ❌ May cause issues
}
```

#### 3. Long Path Support
```powershell
# Enable long path support (Windows 10 version 1607+)
# Run as Administrator
New-ItemProperty -Path "HKLM:SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

#### 4. Permission Issues
```powershell
# Run as Administrator if needed
Start-Process powershell -Verb RunAs

# Or change npm cache directory
npm config set cache "C:\npm-cache" --global
```

### Git Bash Alternative

If you prefer Unix-like commands:

```bash
# Install Git for Windows from https://gitforwindows.org/

# Use Git Bash for better compatibility
export AWS_BUCKET=my-playwright-reports
export AWS_REGION=us-east-1

# Run tests
npx playwright test
```

### WSL (Windows Subsystem for Linux)

For development in a Linux environment on Windows:

```bash
# Install WSL2
wsl --install

# Install Ubuntu
wsl --install -d Ubuntu

# In WSL terminal
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install project dependencies
npm install playwright-report-uploader
```

## Visual Studio Code Integration

### Extensions
1. Install recommended extensions:
   - Playwright Test for VSCode
   - TypeScript and JavaScript Language Features
   - PowerShell (if using PowerShell)

### Settings
```json
// .vscode/settings.json
{
  "playwright.reuseBrowser": true,
  "playwright.showTrace": true,
  "typescript.preferences.quoteStyle": "single"
}
```

### Tasks
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Playwright Tests",
      "type": "shell",
      "command": "npx",
      "args": ["playwright", "test"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

## Docker on Windows

### Using Docker Desktop
```dockerfile
# Dockerfile for Windows containers
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "test"]
```

```powershell
# Build and run
docker build -t my-playwright-tests .
docker run --env-file .env my-playwright-tests
```

## Best Practices for Windows

1. **Use .env files** instead of system environment variables for project-specific configuration
2. **Use forward slashes** in file paths for better cross-platform compatibility
3. **Enable long path support** for projects with deep directory structures
4. **Use Git Bash or WSL** for better Unix compatibility
5. **Keep PowerShell updated** for better scripting capabilities
6. **Use npm instead of yarn** for better Windows compatibility
7. **Configure Windows Defender** to exclude node_modules if builds are slow

