# DoppAI Landing Page

A modern, responsive landing page for DoppAI - showcasing the future of AI agents that embody human expression, thinking, and connection.

## 🚀 Live Demo

Visit the live website: [DoppAI Landing Page](https://your-username.github.io/doppai)

## ✨ Features

- **Modern Design**: Clean, professional interface with gradient backgrounds and glassmorphism effects
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Dynamic Content**: Real-time Medium RSS feed integration
- **Social Integration**: Twitter/X embed and Medium profile links
- **Brand Identity**: Custom logo pattern background and cohesive branding
- **Performance Optimized**: Fast loading with optimized assets

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with modern design patterns
- **Content**: RSS feed integration via RSS2JSON API
- **Social Media**: Twitter/X official embed, Medium integration
- **Deployment**: GitHub Pages ready

## 📁 Project Structure

```
doppai/
├── index.html          # Main landing page
├── public/             # Static assets
│   ├── doppai.png      # Original logo
│   └── doppaitransp.png # Transparent logo
├── server.py           # Flask development server
├── requirements.txt    # Python dependencies
└── README.md          # Project documentation
```

## 🎨 Design Highlights

### Visual Elements
- **Gradient Background**: Custom gradient from `#f5b0be` to `#8eb5da`
- **Logo Pattern**: Subtle background pattern using the DoppAI logo
- **Glassmorphism**: Modern glass-like effects on sections
- **Typography**: Professional font hierarchy with gradient text effects

### Interactive Features
- **Hover Effects**: Smooth transitions and animations
- **Social Links**: Direct integration with Twitter/X and Medium
- **Dynamic Content**: Live Medium article feed
- **Responsive Navigation**: Mobile-optimized layout

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Python 3.7+ (for local development)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/doppai.git
   cd doppai
   ```

2. **Install dependencies** (optional, for Flask server)
   ```bash
   pip install -r requirements.txt
   ```

3. **Run locally**
   ```bash
   # Option 1: Python HTTP server
   python -m http.server 8000
   
   # Option 2: Flask server (with additional features)
   python server.py
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8000` or `http://localhost:5000`

### GitHub Pages Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Save

3. **Access live site**
   - Your site will be available at `https://your-username.github.io/doppai`

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1200px+ (full layout with all features)
- **Tablet**: 768px - 1199px (adjusted spacing and sizing)
- **Mobile**: < 768px (stacked layout, optimized touch targets)

## 🔧 Customization

### Colors
Main colors can be modified in the CSS variables:
```css
--primary-gradient: linear-gradient(135deg, #f5b0be 0%, #8eb5da 100%);
--section-bg: rgba(255, 255, 255, 0.95);
--text-primary: #2d3748;
```

### Content
- **Logo**: Replace `public/doppaitransp.png`
- **Social Links**: Update URLs in `index.html`
- **Medium Feed**: Modify RSS URL in JavaScript
- **Contact Info**: Update email in footer

## 📊 Performance

- **Page Load**: < 2 seconds
- **Assets**: Optimized images and minified CSS
- **SEO**: Meta tags and semantic HTML
- **Accessibility**: WCAG 2.1 compliant

## 🔗 Integrations

- **Medium**: RSS feed integration for latest articles
- **Twitter/X**: Official embed for social proof
- **Email**: Direct mailto links for contact
- **Analytics**: Ready for Google Analytics integration

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🤝 Support

For technical support or customization requests, please contact:
- **Email**: contact@doppai.com
- **Project Manager**: [Your Name]

---

**Built with ❤️ for DoppAI** 