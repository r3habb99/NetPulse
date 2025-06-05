# GitHub Pages Setup Guide for NetPulse

## 🚨 **IMPORTANT: Follow these steps to fix the deployment error**

The deployment is failing because GitHub Pages is not properly configured. Follow these steps exactly:

## Step 1: Enable GitHub Pages in Repository Settings

1. **Go to your repository on GitHub**
   - Navigate to: `https://github.com/YOUR_USERNAME/NetPulse`

2. **Access Repository Settings**
   - Click the "Settings" tab (top right of repository page)
   - Scroll down to find "Pages" in the left sidebar

3. **Configure GitHub Pages**
   - Under "Source", select **"GitHub Actions"** (NOT "Deploy from a branch")
   - This is crucial - it must be "GitHub Actions" for our workflow to work
   - Click "Save"

## Step 2: Verify Repository Permissions

1. **Check Repository Visibility**
   - Your repository should be **Public** for free GitHub Pages
   - If private, you need GitHub Pro/Team/Enterprise

2. **Verify Workflow Permissions**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", ensure:
     - ✅ "Read and write permissions" is selected
     - ✅ "Allow GitHub Actions to create and approve pull requests" is checked

## Step 3: Update Repository Settings (if needed)

If you're still having issues, check these settings:

1. **Repository Settings → Actions → General**
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Repository Settings → Environments**
   - You should see a "github-pages" environment
   - If not, it will be created automatically after Pages is enabled

## Step 4: Manual Workflow Trigger

After configuring Pages:

1. **Go to Actions tab**
2. **Select "Deploy NetPulse to GitHub Pages" workflow**
3. **Click "Run workflow"**
4. **Select "main" branch**
5. **Click "Run workflow" button**

## Step 5: Verify Deployment

After successful deployment:

1. **Check the Actions tab** for green checkmarks
2. **Go to Settings → Pages** to see your live URL
3. **Your site will be available at**: `https://YOUR_USERNAME.github.io/NetPulse`

## 🔧 **Troubleshooting Common Issues**

### Issue 1: "Pages site cannot be found"
**Solution**: Ensure "GitHub Actions" is selected as source in Pages settings

### Issue 2: "Permission denied"
**Solution**: Check workflow permissions in Settings → Actions → General

### Issue 3: "Repository not found"
**Solution**: Verify repository is public or you have proper GitHub plan

### Issue 4: "Workflow not triggering"
**Solution**: Ensure you're pushing to `main` or `master` branch

## 📋 **Quick Checklist**

Before running the workflow, verify:

- [ ] Repository is public (or you have GitHub Pro+)
- [ ] GitHub Pages is enabled with "GitHub Actions" as source
- [ ] Workflow permissions are set to "Read and write"
- [ ] You're pushing to `main` or `master` branch
- [ ] `index.html` exists in repository root

## 🚀 **Expected Results**

After successful setup:

1. **Workflow runs automatically** on every push to main
2. **Deployment completes** in 2-3 minutes
3. **Live site available** at your GitHub Pages URL
4. **Updates deploy automatically** on future pushes

## 📞 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the workflow logs** in the Actions tab for specific errors
2. **Verify all files are committed** and pushed to the repository
3. **Ensure branch name matches** what's configured in Pages settings
4. **Try the manual workflow trigger** from the Actions tab

## 🎯 **Next Steps After Setup**

Once deployment is working:

1. **Bookmark your live URL**: `https://YOUR_USERNAME.github.io/NetPulse`
2. **Test the application** on mobile and desktop
3. **Share your live network monitoring app** with others!

---

**Note**: The first deployment might take a few extra minutes as GitHub sets up the Pages environment. Subsequent deployments will be faster.
