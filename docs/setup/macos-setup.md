# macOS Setup Guide

Complete guide for setting up Playwright Report Uploader on macOS.

## Prerequisites

### System Requirements
- macOS 10.15 (Catalina) or later
- Xcode Command Line Tools
- Terminal or iTerm2
- Internet connection

### Install Xcode Command Line Tools
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
```

### Node.js Installation

#### Option 1: Using Homebrew (Recommended)
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

#### Option 2: Using Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.zshrc

# Install latest Node.js LTS
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

#### Option 3: Direct Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the macOS installer
3. Run the .pkg installer
4. Verify installation in Terminal

## Installation

### 1. Create Project Directory
```bash
# Create and navigate to project directory
mkdir ~/my-playwright-project
cd ~/my-playwright-project

# Initialize npm project
npm init -y
```

### 2. Install Dependencies
```bash
# Install Playwright
npm install @playwright/test

# Install Playwright Report Uploader
npm install playwright-report-uploader

# Install Playwright browsers
npx playwright install

# Install system dependencies (if needed)
npx playwright install-deps
```

### 3. Environment Setup

#### Shell Configuration (zsh - default in macOS Catalina+)
```bash
# Edit ~/.zshrc
nano ~/.zshrc

# Add environment variables
cat >> ~/.zshrc << 'EOF'
# Playwright Report Uploader Configuration
export AWS_BUCKET="my-playwright-reports"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export UPLOAD_PROVIDER="aws"
export PUBLIC_ACCESS="true"
export GENERATE_INDEX="true"
EOF

# Reload configuration
source ~/.zshrc
```

#### For Bash users (older macOS versions)
```bash
# Edit ~/.bash_profile
nano ~/.bash_profile

# Add environment variables
cat >> ~/.bash_profile << 'EOF'
# Playwright Report Uploader Configuration
export AWS_BUCKET="my-playwright-reports"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
EOF

# Reload configuration
source ~/.bash_profile
```

#### .env File (Project-specific, Recommended)
```bash
# Create .env file
cat > .env << 'EOF'
AWS_BUCKET=my-playwright-reports
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
UPLOAD_PROVIDER=aws
PUBLIC_ACCESS=true
GENERATE_INDEX=true
EOF

# Secure the .env file
chmod 600 .env
```

### 4. Configuration

#### Create Playwright Configuration
```bash
# Create playwright.config.ts
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';
import { PlaywrightReportUploader } from 'playwright-report-uploader';

export default defineConfig({
  testDir: './tests',
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
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
EOF
```

## Testing Installation

### 1. Create Sample Test
```bash
# Create tests directory
mkdir tests

# Create sample test
cat > tests/example.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
  
  // Test navigation
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('screenshot test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });
  await expect(page.locator('h1')).toContainText('Example Domain');
});
EOF
```

### 2. Run Tests
```bash
# Run all tests
npx playwright test

# Run with specific browser
npx playwright test --project=webkit

# Run in headed mode
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

## macOS-Specific Configuration

### Security and Privacy Settings

#### Allow Terminal Full Disk Access (if needed)
1. Go to System Preferences > Security & Privacy > Privacy
2. Select "Full Disk Access" from the left sidebar
3. Click the lock icon and enter your password
4. Add Terminal.app or iTerm2

#### Developer Tools Access
```bash
# Enable developer mode (if needed)
sudo DevToolsSecurity -enable

# Trust developer tools
sudo dscl . append /Groups/_developer GroupMembership $(whoami)
```

### Rosetta 2 (for Apple Silicon Macs)
```bash
# Install Rosetta 2 (for Intel compatibility)
softwareupdate --install-rosetta

# Check architecture
uname -m
# arm64 = Apple Silicon
# x86_64 = Intel

# Run commands with Rosetta (if needed)
arch -x86_64 npm install
```

### Performance Optimization

#### Increase File Limits
```bash
# Check current limits
ulimit -n

# Increase file descriptor limit (temporary)
ulimit -n 65536

# Make permanent - add to ~/.zshrc
echo 'ulimit -n 65536' >> ~/.zshrc
```

#### System Preferences
```bash
# Disable App Nap for Terminal/iTerm2
# System Preferences > Battery > Battery > Options > App Nap (uncheck)

# Increase shared memory (for large test suites)
sudo sysctl -w kern.sysv.shmmax=1073741824
```

## Cloud Provider Setup on macOS

### AWS CLI Installation
```bash
# Using Homebrew
brew install awscli

# Configure AWS
aws configure

# Test configuration
aws sts get-caller-identity
```

### Azure CLI Installation
```bash
# Using Homebrew
brew install azure-cli

# Login to Azure
az login

# Test configuration
az account show
```

### Google Cloud CLI Installation
```bash
# Using Homebrew
brew install google-cloud-sdk

# Initialize gcloud
gcloud init

# Test configuration
gcloud auth list
```

## Development Tools

### VS Code Setup
```bash
# Install VS Code
brew install --cask visual-studio-code

# Install useful extensions
code --install-extension ms-playwright.playwright
code --install-extension ms-vscode.vscode-typescript-next
```

### iTerm2 Configuration
```bash
# Install iTerm2
brew install --cask iterm2

# Install useful terminal tools
brew install tree htop jq
```

## Troubleshooting

### Common macOS Issues

#### 1. Permission Denied Errors
```bash
# Fix npm permission issues
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager like nvm
```

#### 2. Xcode Command Line Tools Issues
```bash
# Reset Xcode Command Line Tools
sudo xcode-select --reset
xcode-select --install
```

#### 3. Browser Installation Issues
```bash
# Clear Playwright browser cache
npx playwright uninstall
npx playwright install

# Manual browser installation
npx playwright install chromium
npx playwright install webkit
npx playwright install firefox
```

#### 4. Environment Variable Issues
```bash
# Check which shell you're using
echo $SHELL

# Check if variables are loaded
env | grep AWS

# Debug shell configuration
echo $PATH
echo $NODE_PATH
```

#### 5. Firewall Issues
```bash
# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
```

### Performance Issues

#### 1. Slow Test Execution
```bash
# Increase system limits
echo 'kern.maxfiles=65536' | sudo tee -a /etc/sysctl.conf
echo 'kern.maxfilesperproc=65536' | sudo tee -a /etc/sysctl.conf

# Restart required
sudo reboot
```

#### 2. Memory Issues
```bash
# Monitor memory usage
top -o MEM

# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
```

## Docker on macOS

### Docker Desktop Setup
```bash
# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop and wait for it to be ready
```

### Running Tests in Docker
```dockerfile
# Dockerfile for macOS development
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npm", "test"]
```

```bash
# Build and run
docker build -t my-playwright-tests .
docker run --env-file .env my-playwright-tests
```

## Best Practices for macOS

1. **Use Homebrew** for package management
2. **Use nvm** for Node.js version management
3. **Secure .env files** with proper permissions (chmod 600)
4. **Use zsh** (default shell in modern macOS)
5. **Configure iTerm2** for better terminal experience
6. **Monitor system resources** during test execution
7. **Use local .env files** instead of global environment variables
8. **Keep Xcode Command Line Tools updated**
9. **Use VS Code** with Playwright extension for debugging
10. **Regular cleanup** of browser caches and temporary files

## Apple Silicon (M1/M2) Specific Notes

### Native vs Rosetta
```bash
# Check if running native or Rosetta
uname -m

# Install native Node.js
arch -arm64 brew install node

# Install with Rosetta (if needed for compatibility)
arch -x86_64 brew install node
```

### Performance Benefits
- Native ARM64 browsers are significantly faster
- Better battery life during test execution
- Improved memory efficiency

### Compatibility
- Most npm packages work natively
- Playwright fully supports Apple Silicon
- Some legacy packages may require Rosetta

