# PDF Viewer - Unified Project

A modern PDF viewer based on PDF.js with improved document outline and unified development/production workflow.

## 🚀 Quick Start

1. **Open the viewer**: Open `index.html` in your browser
2. **Choose your mode**:
   - **Development**: Unminified code with hot reloading
   - **Production**: Optimized build with better performance

## 📁 Project Structure

```
pdf-viewer/
├── pdf.js/                    # Main PDF.js source code
│   ├── web/                   # Development files
│   │   ├── viewer.html        # Development viewer
│   │   ├── viewer.css         # Improved outline styles
│   │   └── ...
│   ├── build/generic/web/     # Production build
│   │   ├── viewer.html        # Production viewer
│   │   ├── viewer.css         # Compiled styles
│   │   └── ...
│   └── ...
├── index.html                 # Main entry point
├── package.json              # Project scripts
└── README.md                 # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server with hot reloading
npm run dev

# Build production version
npm run build

# Build minified production version
npm run build:prod

# Build distribution package
npm run build:dist

# Clean build files
npm run clean

# Run linting
npm run lint

# Run tests
npm run test
```

### Development Workflow

1. **For development**: Use `npm run dev` to start the development server
2. **For production**: Use `npm run build` to create optimized builds
3. **Testing changes**: Both dev and production use the same improved styles

## ✨ Document Outline Improvements

The document outline has been enhanced with:

### 🎨 Visual Design
- **More compact spacing** - Reduced padding and margins for better space utilization
- **Better typography hierarchy** - Different font sizes and weights for different outline levels
- **Modern hover effects** - Subtle animations and elevation on hover
- **Improved selected state** - Clear visual indication with modern accent colors

### 🔧 Technical Improvements
- **Consistent styling** - Same improvements apply to both dev and production builds
- **Better accessibility** - Improved focus indicators and keyboard navigation
- **Responsive design** - Works well on different screen sizes
- **Performance optimized** - Smooth transitions without performance impact

### 📱 Features
- **Level-based styling** - Top-level items are more prominent
- **Connecting lines** - Subtle visual guides for nested items
- **Smooth animations** - 150ms transitions with modern easing
- **Dark mode support** - Automatic adaptation to system preferences

## 🔧 Customization

### Modifying Outline Styles

The outline styles are defined in `pdf.js/web/viewer.css`. Key classes:

- `.treeItem > a` - Individual outline items
- `.treeWithDeepNesting > .treeItem > a` - Top-level items
- `.treeItem .treeItem > a` - Second-level items
- `.treeItem.selected > a` - Selected items

### Build Configuration

The build system uses Gulp. Main tasks:
- `generic` - Standard build for general use
- `minified` - Compressed build for production
- `server` - Development server with live reload

## 📦 Production Deployment

1. Run `npm run build` to create the production build
2. Deploy the `pdf.js/build/generic/web/` directory
3. Ensure proper MIME types for `.mjs` files in your web server

## 🐛 Troubleshooting

### Common Issues

**Build fails**: Make sure you have Node.js 20.16.0+ installed
**Styles not updating**: Run `npm run clean` then `npm run build`
**CORS errors**: Serve files through a web server, not file:// protocol

### File Structure

- **Development files**: `pdf.js/web/`
- **Production files**: `pdf.js/build/generic/web/`
- **Source files**: `pdf.js/src/`

## 📄 License

Apache License 2.0 - see the PDF.js project for full license details.

## 🤝 Contributing

1. Make changes to the source files in `pdf.js/web/`
2. Test in development mode
3. Build and test production version
4. Both versions should work identically

---

**Note**: This setup eliminates the need for duplicate `github-pdf-viewer` directory. Everything is now unified under the main `pdf.js` directory with proper development and production builds. 