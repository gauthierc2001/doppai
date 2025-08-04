# Deployment Guide - DoppAI Landing Page

This guide provides step-by-step instructions for deploying the DoppAI landing page to GitHub Pages.

## 🚀 Quick Deployment

### Step 1: Prepare Repository

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DoppAI landing page"
   ```

2. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `doppai`
   - Make it public (required for free GitHub Pages)
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/doppai.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages

1. **Go to Repository Settings**
   - Navigate to your repository on GitHub
   - Click "Settings" tab

2. **Configure Pages**
   - Scroll down to "Pages" section (left sidebar)
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch
   - Select "/ (root)" folder
   - Click "Save"

3. **Wait for Deployment**
   - GitHub will show "Your site is being built"
   - This usually takes 1-2 minutes
   - You'll see a green checkmark when ready

### Step 3: Access Your Site

- **URL**: `https://YOUR_USERNAME.github.io/doppai`
- **Example**: `https://johndoe.github.io/doppai`

## 🔧 Custom Domain (Optional)

If you want to use a custom domain:

1. **Add Custom Domain**
   - In Pages settings, enter your domain (e.g., `doppai.com`)
   - Click "Save"

2. **Configure DNS**
   - Add CNAME record: `doppai.com` → `YOUR_USERNAME.github.io`
   - Or A records pointing to GitHub's IP addresses

3. **Enable HTTPS**
   - Check "Enforce HTTPS" in Pages settings

## 📝 Post-Deployment Checklist

- [ ] Site loads correctly at the GitHub Pages URL
- [ ] All images display properly
- [ ] Medium RSS feed loads
- [ ] Twitter embed works
- [ ] Links open in new tabs
- [ ] Mobile responsiveness works
- [ ] Contact email link functions

## 🔄 Updates

To update the live site:

```bash
git add .
git commit -m "Update: [describe changes]"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes.

## 🐛 Troubleshooting

### Common Issues

1. **Site not loading**
   - Check if repository is public
   - Verify Pages is enabled in settings
   - Wait 5-10 minutes for initial deployment

2. **Images not showing**
   - Ensure image paths are relative (e.g., `public/logo.png`)
   - Check file names match exactly

3. **RSS feed not working**
   - Verify RSS URL is accessible
   - Check browser console for CORS errors

4. **Twitter embed not loading**
   - Ensure Twitter widgets script is included
   - Check if Twitter is blocked by network

### Support

For deployment issues:
- Check [GitHub Pages documentation](https://pages.github.com/)
- Review repository settings
- Check Actions tab for build logs

## 📊 Analytics (Optional)

To add Google Analytics:

1. **Get Tracking ID**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create new property
   - Copy tracking ID (GA_MEASUREMENT_ID)

2. **Add to HTML**
   ```html
   <!-- Add before </head> -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

---

**Your DoppAI landing page is now live! 🎉** 