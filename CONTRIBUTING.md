# Contributing to Playwright Report Uploader

Thank you for your interest in contributing to Playwright Report Uploader! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)
- [Testing](#testing)
- [Release Process](#release-process)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 🚀 Getting Started

### Ways to Contribute

- **Bug Reports**: Found a bug? Let us know!
- **Feature Requests**: Have an idea for improvement?
- **Code Contributions**: Fix bugs or implement features
- **Documentation**: Improve or expand documentation
- **Testing**: Add tests or improve test coverage
- **Cloud Provider Support**: Add support for new providers

### Before You Start

1. Check existing [issues](https://github.com/dreamquality/playwright-report-uploader/issues) and [pull requests](https://github.com/dreamquality/playwright-report-uploader/pulls)
2. For large changes, open an issue first to discuss
3. Make sure you can commit to maintaining your contribution

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git
- Cloud provider accounts for testing (AWS, Azure, GCP)

### Setup Steps

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/dreamquality/playwright-report-uploader.git
   cd playwright-report-uploader
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   # Unit tests
   npm run test:unit
   
   # Integration tests (requires cloud credentials)
   npm run test:integration
   
   # All tests
   npm test
   ```

5. **Set Up Cloud Credentials** (for integration tests)
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Add your credentials to .env
   # AWS
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_BUCKET=test-bucket
   
   # Azure
   AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
   AZURE_CONTAINER=test-container
   
   # GCP
   GCP_PROJECT_ID=test-project
   GCP_BUCKET=test-bucket
   GCP_KEY_FILE_PATH=./test-service-account.json
   ```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following the style guide
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Lint code
   npm run lint
   
   # Run tests
   npm test
   
   # Build and check
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add support for new cloud provider"
   ```

## 📝 Contributing Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Formatting**: Use consistent formatting (Prettier-compatible)
- **Comments**: Add JSDoc comments for public APIs

### Commit Messages

Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(aws): add support for S3 transfer acceleration
fix(azure): handle connection string parsing edge case
docs(setup): add Windows setup instructions
test(gcp): add integration tests for lifecycle policies
```

### Code Quality

- **Type Safety**: Ensure TypeScript strict mode compliance
- **Error Handling**: Implement proper error handling
- **Testing**: Add appropriate unit and integration tests
- **Performance**: Consider performance implications
- **Security**: Follow security best practices

### File Structure

```
src/
├── index.ts                 # Main entry point
├── types.ts                 # Type definitions
├── upload-manager.ts        # Core upload logic
├── config/
│   └── config-loader.ts     # Configuration handling
├── providers/
│   ├── aws-provider.ts      # AWS S3 implementation
│   ├── azure-provider.ts    # Azure Blob implementation
│   ├── gcp-provider.ts      # GCP Storage implementation
│   └── custom-provider.ts   # Custom provider interface
└── utils/
    ├── file-utils.ts        # File handling utilities
    └── retry-utils.ts       # Retry logic utilities
```

## 🔄 Submitting Changes

### Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Update CHANGELOG.md

2. **Ensure Tests Pass**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Create Pull Request**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Request reviews

4. **Address Feedback**
   - Respond to review comments
   - Make requested changes
   - Update tests if needed

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] CHANGELOG.md updated
```

## 📚 Documentation

### Documentation Types

1. **API Documentation**: JSDoc comments in code
2. **User Documentation**: README.md and docs/
3. **Setup Guides**: Platform and cloud provider setup
4. **Examples**: Practical usage examples

### Documentation Guidelines

- **Clarity**: Use clear, concise language
- **Examples**: Include working code examples
- **Completeness**: Cover all public APIs
- **Accuracy**: Test all examples and instructions
- **Structure**: Use consistent formatting and structure

### Updating Documentation

- Update documentation alongside code changes
- Test all examples before submitting
- Use proper markdown formatting
- Include table of contents for long documents

## 🧪 Testing

### Test Types

1. **Unit Tests**: Test individual functions/classes
2. **Integration Tests**: Test cloud provider integration
3. **End-to-End Tests**: Test complete workflows

### Writing Tests

```typescript
// Unit test example
describe('AwsUploader', () => {
  it('should upload file successfully', async () => {
    const config = createTestConfig();
    const uploader = new AwsUploader(config);
    
    const result = await uploader.uploadFile('./test-file.html');
    
    expect(result.success).toBe(true);
    expect(result.url).toContain('amazonaws.com');
  });
});

// Integration test example
describe('AWS Integration', () => {
  it('should upload to real S3 bucket', async () => {
    // Skip if credentials not available
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log('Skipping AWS integration test - credentials not provided');
      return;
    }
    
    const config = await loadConfig();
    const manager = new UploadManager(config);
    const results = await manager.uploadReport();
    
    expect(results.size).toBeGreaterThan(0);
  });
});
```

### Test Environment Setup

1. **Mock External Services**: Use mocks for unit tests
2. **Real Services**: Use real services for integration tests
3. **Test Data**: Use dedicated test buckets/containers
4. **Cleanup**: Clean up test data after tests

## 🚀 Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Prepare Release**
   ```bash
   # Update version
   npm version patch|minor|major
   
   # Update CHANGELOG.md
   # Build project
   npm run build
   
   # Run all tests
   npm test
   ```

2. **Create Release PR**
   - Update version in package.json
   - Update CHANGELOG.md
   - Commit changes

3. **Publish Release**
   ```bash
   # After PR is merged
   git checkout main
   git pull origin main
   
   # Publish to npm
   npm publish
   
   # Create GitHub release
   gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"
   ```

## �� Getting Help

### Where to Ask Questions

- **GitHub Discussions**: General questions and discussions
- **GitHub Issues**: Bug reports and feature requests
- **Discord/Slack**: Real-time community chat (if available)

### Reporting Issues

When reporting issues, include:

1. **Environment Information**
   ```bash
   node --version
   npm --version
   npx playwright --version
   ```

2. **Configuration** (sanitized, no secrets)
3. **Error Messages** with full stack traces
4. **Steps to Reproduce**
5. **Expected vs Actual Behavior**

### Security Issues

For security vulnerabilities:
1. **DO NOT** open public issues
2. Email security@yourproject.com
3. Include detailed description
4. Allow time for fix before disclosure

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Playwright Report Uploader! 🚀

