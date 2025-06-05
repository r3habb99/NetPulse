# GitHub Actions Workflows for NetPulse

This directory contains GitHub Actions workflows for continuous integration and deployment of the NetPulse application.

## Workflows

### 1. `ci-cd.yml` - Comprehensive CI/CD Pipeline

**Purpose**: Full continuous integration and deployment pipeline with testing and validation.

**Triggers**:
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch
- Manual workflow dispatch

**Features**:
- **HTML Validation**: Checks HTML structure and syntax
- **JavaScript Validation**: Validates JavaScript syntax using Node.js
- **File Structure Check**: Ensures all required files and directories exist
- **PWA Manifest Validation**: Validates the Progressive Web App manifest
- **Application Startup Test**: Tests if the application starts correctly
- **Build Report Generation**: Creates detailed build information
- **GitHub Pages Deployment**: Automatically deploys to GitHub Pages

### 2. `pages.yml` - Simple GitHub Pages Deployment

**Purpose**: Lightweight deployment workflow for GitHub Pages.

**Triggers**:
- Push to `main` or `master` branch
- Manual workflow dispatch

**Features**:
- Direct deployment to GitHub Pages
- Minimal setup and configuration
- Fast deployment process

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Source", select "GitHub Actions"
4. Save the settings

### 2. Repository Permissions

The workflows require the following permissions (automatically configured):
- `contents: read` - To read repository content
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For secure deployment

### 3. Branch Protection (Optional but Recommended)

1. Go to repository settings
2. Navigate to "Branches"
3. Add a branch protection rule for `main`/`master`
4. Enable "Require status checks to pass before merging"
5. Select the CI workflow as a required check

## Workflow Details

### CI Job (ci-cd.yml)

The CI job performs the following checks:

1. **Repository Checkout**: Downloads the latest code
2. **Node.js Setup**: Installs Node.js 18 for testing tools
3. **Dependency Installation**: Installs http-server for testing
4. **HTML Validation**: Checks HTML structure and syntax
5. **JavaScript Validation**: Validates all JavaScript files
6. **File Structure Check**: Ensures required files exist
7. **PWA Manifest Validation**: Validates manifest.json
8. **Asset Directory Check**: Verifies required directories
9. **Application Startup Test**: Tests server startup and endpoints
10. **Build Report**: Generates deployment information

### Deploy Job (ci-cd.yml)

The deployment job:

1. **Runs only after CI passes**
2. **Deploys only from main/master branch**
3. **Prepares files for deployment**
4. **Removes unnecessary files** (.git, .github, etc.)
5. **Uploads to GitHub Pages**
6. **Provides deployment URL**

## Monitoring and Troubleshooting

### Viewing Workflow Runs

1. Go to the "Actions" tab in your repository
2. Click on a workflow run to see details
3. Expand job steps to see logs

### Common Issues and Solutions

#### 1. Deployment Fails
- Check if GitHub Pages is enabled in repository settings
- Verify the source is set to "GitHub Actions"
- Ensure the repository is public or you have GitHub Pro/Team

#### 2. CI Tests Fail
- Check the workflow logs for specific error messages
- Ensure all required files exist in the repository
- Verify JavaScript syntax in your files

#### 3. Permission Errors
- Check if the repository has the required permissions
- Verify the GITHUB_TOKEN has necessary scopes

### Manual Deployment

You can manually trigger deployment:

1. Go to "Actions" tab
2. Select the workflow
3. Click "Run workflow"
4. Choose the branch and click "Run workflow"

## File Structure Requirements

The workflows expect the following structure:

```
├── index.html              # Main application file
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── README.md              # Project documentation
├── assets/                # Application assets
├── utils/                 # Utility modules
├── components/            # UI components
└── favicon_io/            # Favicon files
```

## Environment Variables

No environment variables are required for basic deployment. The workflows use:

- `GITHUB_TOKEN` (automatically provided)
- `github.sha` (commit hash)
- `github.ref_name` (branch name)
- `github.repository` (repository name)

## Security Considerations

- Workflows run in isolated environments
- No secrets are exposed in logs
- Only necessary permissions are granted
- Deployment artifacts are temporary

## Performance

- **CI Job**: ~2-3 minutes
- **Deploy Job**: ~1-2 minutes
- **Total Pipeline**: ~3-5 minutes

## Customization

To customize the workflows:

1. Edit the YAML files in this directory
2. Modify validation steps as needed
3. Add or remove deployment steps
4. Adjust triggers and conditions

For more information, see the [GitHub Actions documentation](https://docs.github.com/en/actions).
