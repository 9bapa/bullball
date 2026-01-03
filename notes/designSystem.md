# Profit Ball Design System & Style Guide

## 🎨 Design Philosophy

The Profit Ball design system embodies the essence of Web3 innovation with a futuristic, profit-driven aesthetic. Our design philosophy centers on:

- **Transparency & Trust**: Clear visibility of all operations and metrics
- **Dynamic Energy**: Animated elements that reflect the dynamic nature of crypto markets
- **Professional Sophistication**: Clean, modern interfaces that inspire confidence
- **Mobile-First Excellence**: Optimized for all devices with responsive design
- **Accessibility**: Inclusive design that works for everyone

## 🌈 Color Palette

### Primary Colors

| Color | Hex | Usage | Emotional Impact |
|-------|-----|-------|------------------|
| **Emerald Green** | `#10b981` | Success, Growth, Profits | Positive, Prosperity, Trust |
| **Purple** | `#a855f7` | Tokens, Balance, Information | Innovation, Mystery, Value |
| **Orange** | `#f97316` | Gifts, Rewards, Actions | Energy, Generosity, Urgency |
| **Blue** | `#3b82f6` | Information, Wallet, Settings | Trust, Stability, Security |

### Secondary Colors

| Color | Hex | Usage | Emotional Impact |
|-------|-----|-------|------------------|
| **Red** | `#ef4444` | Errors, Destructive Actions | Caution, Danger, Alert |
| **Yellow** | `#eab308` | Warnings, Pending States | Attention, Optimism |
| **Gray** | `#6b7280` | Neutral, Secondary Info | Professional, Subtle |

### Background Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Slate-950** | `#020617` | Main background |
| **Slate-900** | `#0f172a` | Card backgrounds |
| **Black/20** | `rgba(0,0,0,0.2)` | Overlays, Backdrops |

### Gradient System

#### Primary Gradients
- **Background**: `from-slate-950 via-purple-950 to-slate-950`
- **Emerald**: `from-emerald-400 via-emerald-500 to-emerald-600`
- **Purple**: `from-purple-400 via-purple-500 to-purple-600`
- **Orange**: `from-orange-400 via-orange-500 to-orange-600`
- **Multi-color**: `from-emerald-400 via-purple-400 to-orange-400`

#### Card Gradients
- **Emerald Cards**: `from-emerald-500/20 to-emerald-600/10`
- **Purple Cards**: `from-purple-500/20 to-purple-600/10`
- **Orange Cards**: `from-orange-500/20 to-orange-600/10`
- **Blue Cards**: `from-blue-500/20 to-blue-600/10`

## 🎭 Typography System

### Font Hierarchy

| Level | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| **H1 (Branding)** | Orbitron | Black (900) | 2.5rem | Main logo, Page titles |
| **H2** | Space Grotesk | Black (900) | 2rem | Section headers |
| **H3** | Space Grotesk | Bold (700) | 1.5rem | Card titles |
| **H4** | Space Grotesk | Semibold (600) | 1.25rem | Sub-sections |
| **Body** | Space Grotesk | Medium (500) | 1rem | Main content |
| **Small** | Space Grotesk | Regular (400) | 0.875rem | Secondary info |
| **Monospace** | JetBrains Mono | Medium (500) | 0.875rem | Addresses, Hashes, Code |

### Typography Patterns

#### Headings
```css
/* H1 - Main Branding */
.text-4xl.font-black.bg-gradient-to-r.from-emerald-400.via-emerald-500.to-emerald-600.bg-clip-text.text-transparent

/* H2 - Section Headers */
.text-3xl.font-black.bg-gradient-to-r.from-purple-400.via-purple-500.to-purple-600.bg-clip-text.text-transparent

/* H3 - Card Titles */
.text-2xl.font-bold.text-white
```

#### Text Elements
```css
/* Primary Text */
.text-white.font-medium

/* Secondary Text */
.text-gray-400.font-medium

/* Accent Text */
.text-emerald-400.font-semibold

/* Monospace Text */
.font-mono.text-xs.text-gray-500
```

## 📐 Layout Patterns

### Container System
```css
/* Main Container */
.container.mx-auto.px-4

/* Max Width Containers */
.max-w-7xl.mx-auto  /* Full width */
.max-w-3xl.mx-auto  /* Content width */
.max-w-md.mx-auto   /* Form width */
```

### Spacing System
| Size | Tailwind | Usage |
|------|----------|-------|
| **XS** | `p-2`, `gap-2` | Tight spacing |
| **SM** | `p-4`, `gap-4` | Default spacing |
| **MD** | `p-6`, `gap-6` | Comfortable spacing |
| **LG** | `p-8`, `gap-8` | Generous spacing |
| **XL** | `p-12`, `gap-12` | Section spacing |

### Grid Patterns
```css
/* 2-Column Grid */
.grid.grid-cols-1.md:grid-cols-2.gap-6

/* 3-Column Grid */
.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-6

/* 4-Column Grid */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-4.gap-4
```

## 🎴 Card Design Patterns

### Standard Card Structure
```css
/* Base Card */
Card.className="bg-gradient-to-r.from-slate-800/50.to-slate-900/50.border-slate-700/50.backdrop-blur-sm"

/* Card Header */
CardHeader.className="border-b.border-slate-700/50"

/* Card Content */
CardContent.className="p-6"

/* Card Footer */
CardFooter.className="border-t.border-slate-700/50"
```

### Card Variants

#### Metric Cards
```css
/* Emerald Metric Card */
<div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">

/* Purple Metric Card */
<div className="bg-gradient-to-r from-purple-500/20 to-purple-600/10 border-purple-500/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">

/* Orange Metric Card */
<div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
```

#### Status Cards
```css
/* Status Card */
<div className="bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-blue-500/30 backdrop-blur-sm rounded-xl p-6">
```

### Card Content Patterns

#### Metric Display
```css
/* Icon Container */
<div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">

/* Value Display */
<div className="text-3xl font-black text-white mb-2">1,234.56</div>

/* Label Display */
<div className="text-sm text-gray-400 font-medium">Total Value</div>

/* Change Display */
<div className="text-sm text-emerald-400 font-semibold">+12.5%</div>
```

#### Wallet Display
```css
/* Wallet Address */
<div className="font-mono text-sm text-gray-400 bg-black/30 px-3 py-2 rounded-lg">
  7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
</div>

/* Balance Display */
<div className="text-2xl font-bold text-white">1,234.56 SOL</div>
<div className="text-sm text-gray-400">≈ $123,456.78</div>
```

## 🔘 Button Design Patterns

### Button Variants
```css
/* Primary Action Button */
Button.className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105"

/* Secondary Button */
Button.className="bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-2 px-4 rounded-lg border border-slate-600/50 transition-all duration-300"

/* Danger Button */
Button.className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"

/* Outline Button */
Button.className="border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-medium py-2 px-4 rounded-lg transition-all duration-300"
```

### Button Patterns
```css
/* Icon Button */
<div className="flex items-center space-x-2">
  <Icon className="w-5 h-5" />
  <span>Button Text</span>
</div>

/* Loading Button */
<Button disabled className="opacity-50 cursor-not-allowed">
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
  Loading...
</Button>
```

## 📊 Table Design Patterns

### Table Structure
```css
/* Table Container */
<div className="overflow-x-auto rounded-lg border border-slate-700/50">

/* Table Header */
<thead className="bg-slate-800/50 border-b border-slate-700/50">
  <tr className="text-left">
    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Column</th>
  </tr>
</thead>

/* Table Body */
<tbody className="divide-y divide-slate-700/50">
  <tr className="hover:bg-slate-700/20 transition-colors cursor-pointer">
    <td className="px-6 py-4 text-sm text-white">Data</td>
  </tr>
</tbody>
```

### Table Cell Patterns
```css
/* Status Cell */
<td className="px-6 py-4 whitespace-nowrap">
  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
    Active
  </Badge>
</td>

/* Address Cell */
<td className="px-6 py-4 whitespace-nowrap">
  <div className="font-mono text-sm text-gray-400">7xKXtg2...gAsU</div>
</td>

/* Amount Cell */
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-white font-medium">1,234.56</div>
  <div className="text-gray-400 text-sm">SOL</div>
</td>
```

## 🏷️ Badge Design Patterns

### Badge Variants
```css
/* Status Badges */
<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Success</Badge>
<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Pending</Badge>
<Badge className="bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>
<Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>

/* Type Badges */
<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Buy</Badge>
<Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Gift</Badge>
<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Sell</Badge>
<Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Liquidity</Badge>
```

## 🎯 Interactive Elements

### Hover Effects
```css
/* Card Hover */
hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105

/* Button Hover */
hover:from-emerald-600 hover:to-purple-600 transition-all duration-300

/* Row Hover */
hover:bg-slate-700/20 transition-colors cursor-pointer
```

### Loading States
```css
/* Spinner */
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>

/* Pulse Animation */
<div className="animate-pulse bg-slate-700/50 h-4 w-32 rounded"></div>

/* Skeleton Loading */
<div className="animate-pulse space-y-2">
  <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
  <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
</div>
```

### Focus States
```css
/* Focus Ring */
focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900

/* Focus Within */
focus-within:ring-2 focus-within:ring-emerald-500
```

## 🌊 Animation Patterns

### Background Animations
```css
/* Floating Orbs */
<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

/* Gradient Animation */
animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
```

### Micro-interactions
```css
/* Scale on Hover */
hover:scale-105 transition-transform duration-300

/* Fade In */
animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Slide Up */
animate-slide-up {
  animation: slideUp 0.3s ease-out;
}
```

## 📱 Responsive Design Patterns

### Breakpoint System
| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Mobile** | < 768px | Single column, compact |
| **Tablet** | 768px - 1024px | 2-column grid |
| **Desktop** | > 1024px | 3-4 column grid |

### Responsive Patterns
```css
/* Responsive Grid */
.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-6

/* Responsive Text */
.text-2xl.md:text-3xl.lg:text-4xl

/* Responsive Spacing */
.p-4.md:p-6.lg:p-8

/* Responsive Layout */
.flex.flex-col.md:flex-row.lg:flex-row
```

## 🎨 Component-Specific Patterns

### Product Cards
```css
/* Product Card Container */
<div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">

/* Product Image */
<div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-500/20 flex items-center justify-center mb-4">

/* Product Info */
<div className="flex-1">
  <h3 className="text-lg font-bold text-white mb-2">Product Name</h3>
  <p className="text-sm text-gray-400">Description</p>
</div>

/* Product Metrics */
<div className="text-right">
  <div className="text-2xl font-bold text-emerald-400">+24.5%</div>
  <div className="text-xs text-gray-400">24h Change</div>
</div>
```

### Product Details Components
```css
/* Detail Section */
<div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/50">

/* Detail Header */
<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-bold text-white">Section Title</h3>
  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
</div>

/* Detail Content */
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <span className="text-gray-400">Label</span>
    <span className="text-white font-medium">Value</span>
  </div>
</div>
```

### Form Components
```css
/* Form Container */
<div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm rounded-xl p-6">

/* Form Group */
<div className="space-y-2 mb-4">
  <label className="text-sm font-medium text-gray-400">Label</label>
  <input className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

/* Form Actions */
<div className="flex justify-end space-x-3 mt-6">
  <Button variant="outline">Cancel</Button>
  <Button>Submit</Button>
</div>
```

## 🎯 Accessibility Guidelines

### Color Contrast
- **Text on Background**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Clear focus indicators

### Semantic HTML
```html
<!-- Use semantic elements -->
<header>, <nav>, <main>, <section>, <article>, <footer>

<!-- Use proper heading hierarchy -->
<h1>, <h2>, <h3>, <h4>, <h5>, <h6>

<!-- Use ARIA labels when needed -->
<button aria-label="Close dialog">×</button>
```

### Keyboard Navigation
```css
/* Focus Styles */
:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #10b981;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## 🚀 Performance Guidelines

### CSS Optimization
- **Use Tailwind's PurgeCSS** to remove unused styles
- **Minimize custom CSS** - prefer utility classes
- **Use CSS Grid** for complex layouts
- **Optimize animations** with `transform` and `opacity`

### Image Optimization
- **Use WebP format** for better compression
- **Implement lazy loading** for images
- **Use responsive images** with `srcset`
- **Optimize image sizes** for different screen sizes

### Animation Performance
```css
/* Use transform for animations */
transform: translateX(0) → transform: translateX(100px)

/* Use opacity for fades */
opacity: 0 → opacity: 1

/* Avoid animating layout properties */
/* Don't animate: width, height, margin, padding */
```

## 📋 Design Checklist

### Before Implementing
- [ ] Color palette matches theme
- [ ] Typography follows hierarchy
- [ ] Layout is responsive
- [ ] Components are accessible
- [ ] Hover states are defined
- [ ] Loading states are considered

### After Implementation
- [ ] Design works on all breakpoints
- [ ] Colors meet contrast requirements
- [ ] Animations are smooth
- [ ] Focus indicators are visible
- [ ] Components are reusable
- [ ] Performance is optimized

## 🎨 Design Tokens

### Spacing Tokens
```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
--spacing-2xl: 4rem;    /* 64px */
```

### Border Radius Tokens
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
```

### Shadow Tokens
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 🎯 Conclusion

This design system provides a comprehensive foundation for building consistent, beautiful, and functional interfaces for the Profit Ball ecosystem. By following these patterns and guidelines, we ensure that every component feels cohesive and maintains the futuristic, profit-driven aesthetic that defines our brand.

Remember: **Consistency is key to building trust and creating a professional user experience.** Use this guide as your reference for all design decisions, and don't hesitate to evolve the system as our needs grow.

*Last updated: January 2025*