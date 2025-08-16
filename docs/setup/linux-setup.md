# Linux Setup Guide

Complete guide for setting up Playwright Report Uploader on various Linux distributions.

## Prerequisites

### System Requirements
- Linux kernel 4.0+ (recommended)
- glibc 2.17+ or musl libc
- 2GB+ RAM (4GB+ recommended for parallel tests)
- 1GB+ disk space
- Internet connection

### Supported Distributions
- Ubuntu 18.04+
- Debian 9+
- CentOS 7+
- RHEL 7+
- Fedora 30+
- openSUSE Leap 15+
- Alpine Linux 3.13+
- Arch Linux

## Installation by Distribution

### Ubuntu/Debian

#### Update System
```bash
# Update package list
sudo apt update
sudo apt upgrade -y

# Install essential build tools
sudo apt install -y curl wget gnupg2 software-properties-common build-essential
```

#### Install Node.js
```bash
# Method 1: Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Method 2: Using snap
sudo snap install node --classic

# Method 3: Using apt (older version)
sudo apt install -y nodejs npm

# Verify installation
node --version
npm --version
```

#### Install System Dependencies
```bash
# Install Playwright system dependencies
sudo apt install -y \
    libnss3-dev \
    libatk-bridge2.0-dev \
    libdrm2 \
    libxkbcommon-dev \
    libxcomposite-dev \
    libxdamage-dev \
    libxrandr-dev \
    libgbm-dev \
    libxss-dev \
    libasound2-dev
```

### CentOS/RHEL/Fedora

#### Update System
```bash
# CentOS/RHEL
sudo yum update -y
sudo yum groupinstall -y "Development Tools"

# Fedora
sudo dnf update -y
sudo dnf groupinstall -y "Development Tools"
```

#### Install Node.js
```bash
# Method 1: Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Method 2: Using dnf (Fedora)
sudo dnf install -y nodejs npm

# Method 3: Using EPEL (CentOS/RHEL)
sudo yum install -y epel-release
sudo yum install -y nodejs npm

# Verify installation
node --version
npm --version
```

#### Install System Dependencies
```bash
# CentOS/RHEL
sudo yum install -y \
    nss \
    atk \
    at-spi2-atk \
    cups-libs \
    drm \
    gtk3 \
    libXcomposite \
    libXdamage \
    libXrandr \
    libgbm \
    libxss \
    alsa-lib

# Fedora
sudo dnf install -y \
    nss \
    atk \
    at-spi2-atk \
    cups-libs \
    libdrm \
    gtk3 \
    libXcomposite \
    libXdamage \
    libXrandr \
    mesa-libgbm \
    libXScrnSaver \
    alsa-lib
```

### Alpine Linux

#### Update System
```bash
# Update package list
sudo apk update
sudo apk upgrade

# Install essential tools
sudo apk add --no-cache \
    curl \
    wget \
    gnupg \
    build-base \
    linux-headers
```

#### Install Node.js
```bash
# Install Node.js from Alpine repository
sudo apk add --no-cache nodejs npm

# Or install specific version
sudo apk add --no-cache nodejs=18.17.1-r0 npm

# Verify installation
node --version
npm --version
```

#### Install System Dependencies
```bash
# Install Playwright dependencies for Alpine
sudo apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    dbus \
    mesa-gbm \
    xvfb
```

### Arch Linux

#### Update System
```bash
# Update system
sudo pacman -Syu

# Install base development tools
sudo pacman -S base-devel git
```

#### Install Node.js
```bash
# Install Node.js
sudo pacman -S nodejs npm

# Or using AUR helper (yay)
yay -S nodejs-lts-gallium

# Verify installation
node --version
npm --version
```

#### Install System Dependencies
```bash
# Install Playwright dependencies
sudo pacman -S \
    nss \
    atk \
    at-spi2-atk \
    cups \
    libdrm \
    gtk3 \
    libxcomposite \
    libxdamage \
    libxrandr \
    mesa \
    libxss \
    alsa-lib
```

## Project Setup

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

# Install system dependencies (if not already installed)
npx playwright install-deps
```

### 3. Environment Setup

#### Shell Configuration
```bash
# For bash users - edit ~/.bashrc
cat >> ~/.bashrc << 'EOF'
# Playwright Report Uploader Configuration
export AWS_BUCKET="my-playwright-reports"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export UPLOAD_PROVIDER="aws"
export PUBLIC_ACCESS="true"
export GENERATE_INDEX="true"
EOF

# For zsh users - edit ~/.zshrc
cat >> ~/.zshrc << 'EOF'
# Playwright Report Uploader Configuration
export AWS_BUCKET="my-playwright-reports"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
EOF

# Reload configuration
source ~/.bashrc  # or source ~/.zshrc
```

#### .env File (Recommended)
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
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
EOF
```

## Headless Environment Setup

### Virtual Display (Xvfb)
```bash
# Install Xvfb
# Ubuntu/Debian
sudo apt install -y xvfb

# CentOS/RHEL/Fedora
sudo yum install -y xorg-x11-server-Xvfb  # CentOS/RHEL
sudo dnf install -y xorg-x11-server-Xvfb  # Fedora

# Alpine
sudo apk add --no-cache xvfb

# Start virtual display
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
export DISPLAY=:99

# Or use xvfb-run for single commands
xvfb-run --auto-servernum --server-args="-screen 0 1024x768x24" npx playwright test
```

### System Service for Xvfb
```bash
# Create systemd service
sudo tee /etc/systemd/system/xvfb.service << 'EOF'
[Unit]
Description=Virtual Frame Buffer X Server
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset
Restart=always
RestartSec=1
User=nobody

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable xvfb
sudo systemctl start xvfb

# Set DISPLAY environment variable globally
echo 'export DISPLAY=:99' | sudo tee -a /etc/environment
```

## Docker Setup on Linux

### Install Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Alpine
sudo apk add --no-cache docker
sudo rc-update add docker boot
sudo service docker start
sudo addgroup $USER docker
```

### Playwright Docker Setup
```dockerfile
# Dockerfile for Linux
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "test"]
```

```bash
# Build and run
docker build -t my-playwright-tests .
docker run --env-file .env my-playwright-tests

# With volume mount for development
docker run -v $(pwd):/app --env-file .env my-playwright-tests
```

## Performance Optimization

### System Limits
```bash
# Check current limits
ulimit -a

# Increase file descriptor limit
echo '* soft nofile 65536' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65536' | sudo tee -a /etc/security/limits.conf

# Increase process limit
echo '* soft nproc 32768' | sudo tee -a /etc/security/limits.conf
echo '* hard nproc 32768' | sudo tee -a /etc/security/limits.conf

# Apply immediately (logout/login required for permanent effect)
ulimit -n 65536
```

### Memory Optimization
```bash
# Increase shared memory (for Chrome)
echo 'tmpfs /dev/shm tmpfs defaults,noatime,nosuid,nodev,noexec,relatime,size=2G 0 0' | sudo tee -a /etc/fstab

# Or mount manually
sudo mount -t tmpfs -o size=2G tmpfs /dev/shm
```

### CPU Optimization
```bash
# Check CPU info
cat /proc/cpuinfo | grep processor | wc -l

# Set CPU governor to performance
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

## Cloud Provider CLI Setup

### AWS CLI
```bash
# Ubuntu/Debian
sudo apt install -y awscli

# CentOS/RHEL/Fedora
sudo yum install -y awscli  # CentOS/RHEL
sudo dnf install -y awscli  # Fedora

# Alpine
sudo apk add --no-cache aws-cli

# Configure
aws configure
```

### Azure CLI
```bash
# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# CentOS/RHEL/Fedora
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf install -y azure-cli  # Fedora
sudo yum install -y azure-cli  # CentOS/RHEL

# Login
az login
```

### Google Cloud CLI
```bash
# Download and install
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize
gcloud init
```

## Troubleshooting

### Common Linux Issues

#### 1. Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or change npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 2. Browser Launch Failures
```bash
# Install missing dependencies
npx playwright install-deps

# Check browser installation
npx playwright install --dry-run

# Manual browser check
ldd ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome

# Run with debug info
DEBUG=pw:browser npx playwright test
```

#### 3. Display Issues
```bash
# Check if X11 is available
echo $DISPLAY

# Start Xvfb if needed
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

# Or use headless mode
npx playwright test --config=playwright.headless.config.ts
```

#### 4. Memory Issues
```bash
# Monitor memory usage
free -h
top -o %MEM

# Clear cache
echo 3 | sudo tee /proc/sys/vm/drop_caches

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 5. Network Issues
```bash
# Check DNS resolution
nslookup google.com

# Test connectivity
curl -I https://playwright.dev

# Configure proxy (if needed)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Distribution-Specific Issues

#### Ubuntu/Debian
```bash
# Fix broken packages
sudo apt --fix-broken install

# Update ca-certificates
sudo apt update && sudo apt install -y ca-certificates
```

#### CentOS/RHEL
```bash
# Enable additional repositories
sudo yum install -y epel-release
sudo yum update -y

# Fix SELinux issues (if needed)
sudo setsebool -P httpd_can_network_connect 1
```

#### Alpine Linux
```bash
# Install glibc compatibility (if needed)
wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.34-r0/glibc-2.34-r0.apk
sudo apk add glibc-2.34-r0.apk
```

## CI/CD on Linux

### GitHub Actions Runner
```bash
# Install self-hosted runner
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure runner
./config.sh --url https://github.com/owner/repo --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### Jenkins Setup
```bash
# Install Jenkins
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
echo 'deb https://pkg.jenkins.io/debian binary/' | sudo tee -a /etc/apt/sources.list
sudo apt update
sudo apt install -y jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

## Best Practices for Linux

1. **Use package managers** for installing dependencies
2. **Set proper file permissions** for security
3. **Use virtual displays** for headless environments
4. **Monitor system resources** during test execution
5. **Configure proper limits** for file descriptors and processes
6. **Use Docker** for consistent environments
7. **Keep system updated** for security and performance
8. **Use systemd services** for long-running processes
9. **Configure log rotation** to prevent disk space issues
10. **Use .env files** for environment-specific configuration

