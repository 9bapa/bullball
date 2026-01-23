# BullRhun - Design System & Patterns

## 🎨 Design Philosophy

**"Pixar-Inspired Futurism"**

Our design language combines the warmth and approachability of Pixar's character design with modern fintech aesthetics. We create interfaces that feel alive, approachable, and trustworthy while maintaining a forward-thinking, progressive identity.

### Core Principles

1. **Approachable Tech** - Make complex crypto concepts feel friendly and accessible
2. **Warm Modernity** - Use vibrant colors and soft shapes, not cold minimalism
3. **Playful Precision** - Balance whimsy with professional polish
4. **Emotional Connection** - Design creates trust through warmth, not just utility

---

## 🎯 Color System

### Primary Colors (Themeable)

Our color system is built around three customizable color tokens:

```
--custom-primary   // Main brand color (CTAs, active states, brand elements)
--custom-secondary // Supporting color (backgrounds, secondary elements)
--custom-accent   // Highlight color (gradients, details, decorative elements)
```

#### Default Palette (BullRun)

```
Primary:   #669933 - Deep earthy green (growth, finance, trust)
Secondary: #CC9933 - Muted gold (wealth, premium quality)
Accent:    #996633 - Clay/sand (stability, foundation)
```

### Preset Categories

We provide 7 curated preset families for different brand personalities:

1. **Default** - Original BullRun earthy tones
2. **Nature** - Forest, Ocean, Sunset (organic, calming)
3. **Modern** - Slate, Electric, Midnight (professional, tech-forward)
4. **Crypto** - Bitcoin Gold, Ethereum Blue, DeFi Green (industry-specific)
5. **Vibrant** - Tropical, Candy, Neon (bold, playful)
6. **Minimal** - Monochrome, Cream, Blush (subtle, elegant)
7. **Retro** - Vaporwave, Arcade, GameBoy (nostalgic, distinctive)

### Color Usage Rules

#### DO ✅

- Use primary for: Main CTAs, active navigation, selected states, brand elements
- Use secondary for: Backgrounds, card headers, supporting elements, containers
- Use accent for: Gradient overlays, decorative elements, highlights, hover effects
- Ensure adequate contrast ratios (WCAG AA minimum 4.5:1 for text)
- Test colors in both light and dark modes

#### DON'T ❌

- Don't use pure black (#000000) - use dark grays (#1a1a1a)
- Don't use pure white (#FFFFFF) on white backgrounds
- Don't exceed 3 accent colors in a single view
- Don't sacrifice accessibility for aesthetics
- Don't use neon/cyberpunk effects (unless using Neon preset subtly)

### Gradient Guidelines

- **Primary Gradients**: `from-primary to-primary/80` (subtle depth)
- **Background Gradients**: `from-primary/10 via-primary/5 to-background` (very subtle)
- **Hero Gradients**: `from-primary/15 via-primary/8 to-transparent` (gentle wash)
- **Card Gradients**: `from-primary/5 to-transparent` (top accent)

**Important**: Gradients should be subtle, not overwhelming. Think " Pixar softness", not "Gamer RGB".

---

## 📐 Typography System

### Font Families

```css
--font-sans: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace
--font-display: 'Outfit', system-ui, sans-serif
```

### Type Scale

| Level | Size | Weight | Usage | Line Height |
|-------|-------|--------|------------|
| H1 | 4rem / 6rem | Hero titles | 1.1 |
| H2 | 3rem | Section titles | 1.2 |
| H3 | 2rem | Card titles | 1.3 |
| H4 | 1.25rem | Subsection titles | 1.4 |
| Body | 1rem | Body text | 1.6 |
| Small | 0.875rem | Metadata, captions | 1.5 |
| X-Small | 0.75rem | Labels, tags | 1.4 |

### Typography Patterns

#### Headings
- Use `font-display` for H1-H3 (brand personality)
- Use `font-sans` for H4 and below (readability)
- Apply `font-bold` or `font-semibold` weight
- Add subtle tracking: `tracking-tight`

#### Body Text
- Always use `font-sans` for maximum readability
- Use `leading-relaxed` (line-height: 1.625) for paragraphs
- Use `leading-tight` (line-height: 1.25) for tight spacing

#### Monospace Usage
- Use for: Prices, data values, technical labels, badges
- Never use for paragraphs or long text
- Apply `tracking-wider` for labels (uppercase)

#### Emphasis Patterns
```tsx
// Primary emphasis
<span className="font-semibold text-primary">

// Secondary emphasis
<span className="font-medium text-foreground/90">

// Subtle emphasis
<span className="text-muted-foreground">
```

---

## 🧩 Spacing System

### Scale

Based on 4px base unit:

```css
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)  - Default padding
--space-6: 1.5rem   (24px)  - Section spacing
--space-8: 2rem     (32px)  - Large sections
--space-12: 3rem    (48px)  - Page sections
--space-16: 4rem    (64px)  - Hero sections
```

### Spacing Guidelines

#### Component Internal Spacing
- Card content: `p-4` or `p-6`
- Form fields: `gap-2` between label and input
- Button padding: Use semantic sizes (`p-2` for small, `p-4` for default)

#### Component External Spacing
- Card stack: `gap-4` or `gap-6`
- Section separation: `py-12` or `py-16`
- Page header padding: `py-6` or `py-8`

#### Micro-interactions
- Focus rings: 3px
- Active states: 2px offset
- Hover lifts: `hover:scale-[1.02]`

---

## 🔘 Component Patterns

### Buttons

#### Primary Button
```tsx
<Button className="shadow-lg hover:shadow-xl hover:scale-[1.02]">
  Action
</Button>
```
- Use for: Main CTAs, primary actions
- Add shadow for depth (Pixar feel)
- Include subtle scale on hover

#### Secondary Button
```tsx
<Button variant="outline" className="hover:bg-muted/50">
  Secondary
</Button>
```
- Use for: Secondary actions, cancel operations
- Subtle hover background

#### Icon Buttons
```tsx
<Button variant="ghost" size="icon" className="hover:bg-primary/5">
  <Icon />
</Button>
```
- Use for: Toolbars, navigation icons
- Very subtle hover effect

### Cards

#### Standard Card Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

#### Card Styling Rules
- Default: White background with subtle border
- Hover: Add shadow and slight scale
- Gradient cards: `from-primary/10 to-background`
- Always include proper padding

### Inputs

#### Text Input
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" placeholder="..." />
</div>
```

#### Input Styling
- Height: `h-9` (default), `h-8` (small), `h-10` (large)
- Focus: Border color change + ring effect
- Disabled: Gray background with reduced opacity

### Badges

#### Status Badge
```tsx
<Badge className="bg-emerald-500">
  Verified
</Badge>
```

#### Badge Color Mapping
- Success: `bg-emerald-500`
- Warning: `bg-amber-500`
- Error: `bg-red-500`
- Info: `bg-blue-500`
- Neutral: `bg-secondary`

---

## ✨ Animation Patterns

### Micro-interactions

#### Hover Effects
```tsx
// Subtle lift
hover:scale-[1.02]
hover:-translate-y-0.5

// Shadow enhancement
hover:shadow-xl

// Color shift
hover:text-primary
hover:bg-primary/5
```

#### Transitions
```tsx
// Smooth color/border changes
transition-colors duration-200

// Smooth transforms
transition-transform duration-300

// Complete smooth transition
transition-all duration-300 ease-out
```

#### Click Feedback
```tsx
// Active state
active:scale-95
active:shadow-inner

// Ripple effect (for buttons)
active:bg-primary/90
```

### Page Transitions

#### Fade In
```tsx
// For new content
className="animate-in fade-in-0 duration-300"
```

#### Slide Up
```tsx
// For modals, drawers
className="animate-in slide-in-from-bottom-2 duration-300"
```

### Loading States

#### Skeleton Loading
```tsx
<Skeleton className="h-12 w-full" />
```

#### Loading Spinner
```tsx
<div className="animate-spin">
  <Loader2 className="h-4 w-4" />
</div>
```

### Important Animation Rules

1. **Duration**: Use 200-300ms for UI, 400-500ms for page transitions
2. **Easing**: Prefer `ease-out` for user interactions, `ease-in-out` for page transitions
3. **Subtlety**: Animations should be noticeable, not distracting
4. **Performance**: Use `transform` and `opacity` only (avoid animating layout properties)
5. **Accessibility**: Respect `prefers-reduced-motion` media query

---

## 📱 Layout Patterns

### Container System

```tsx
// Max width container
<div className="container mx-auto px-4 max-w-6xl">

// Full width
<div className="w-full">

// Centered content
<div className="flex justify-center">
```

### Responsive Breakpoints

| Breakpoint | Width | Device |
|------------|--------|---------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Pattern

```tsx
// Start with mobile styles
<div className="p-4">

// Enhance for tablet
<div className="p-4 md:p-6">

// Further enhance for desktop
<div className="p-4 md:p-6 lg:p-8">
```

### Grid Patterns

#### Two-Column Layout
```tsx
<div className="grid md:grid-cols-2 gap-6">
```

#### Three-Column Layout
```tsx
<div className="grid md:grid-cols-3 gap-6">
```

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🎭 Visual Effects

### Shadows

```css
--shadow-sm:   Subtle depth for cards
--shadow-md:   Medium depth for hover states
--shadow-lg:   Strong depth for important elements
--shadow-xl:   Maximum depth for floating elements
```

### Blur Effects

```tsx
// Backdrop blur (glassmorphism)
className="backdrop-blur bg-background/95"

// Element blur
className="blur-sm"
```

### Border Radius

```css
--radius-sm:   0.5rem (8px)  - Small elements, tags
--radius-md:   0.75rem (12px) - Buttons, inputs
--radius-lg:   1rem (16px)    - Cards, containers
--radius-xl:   1.5rem (24px)   - Large cards, modals
--radius-2xl:  2rem (32px)   - Hero elements, floating buttons
```

### Gradient Overlays

```tsx
// Top gradient accent
className="bg-gradient-to-b from-primary/10 to-transparent"

// Side gradient
className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5"

// Bottom gradient fade
className="bg-gradient-to-t from-background via-background/80 to-transparent"
```

---

## 🔒 Accessibility Standards

### Color Contrast

- Text on background: Minimum 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1 (WCAG AA)
- Interactive elements: Minimum 3:1 (WCAG AA)

### Focus States

```tsx
// Always provide visible focus indicators
className="focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use semantic HTML (`<button>`, `<a>`, `<input>`)
- Provide logical tab order
- Include visible focus states

### Screen Readers

- Use semantic HTML elements
- Include `aria-label` for icon-only buttons
- Provide `aria-describedby` for form help text
- Use `aria-hidden` for decorative elements

### Reduced Motion

```tsx
// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 Brand Elements

### Logo Usage

- Green pulsing dot indicates live/active status
- Always use "BullRhun" text with consistent font
- Minimum clear space: 2x logo height

### Brand Voice

- **Tone**: Friendly, knowledgeable, approachable
- **Avoid**: Overly technical jargon, slang, corporate speak
- **Personality**: Helpful expert, not just transactional

### Microcopy Patterns

- **Buttons**: Use action verbs ("Add to Cart" not "Purchase")
- **Errors**: Be helpful, not blaming ("Please check your email" not "Invalid email")
- **Success**: Celebrate achievements ("Great! Your order is confirmed")
- **Empty States**: Encourage action ("Add items to get started")

---

## 📦 Component Library

### Required Components

- ✅ Buttons (Primary, Secondary, Ghost, Icon)
- ✅ Cards (Header, Content, Footer variants)
- ✅ Form Elements (Input, Select, Checkbox, Radio, Switch)
- ✅ Badges (Status, Label, Tag)
- ✅ Modals (Dialog, Drawer, Sheet)
- ✅ Navigation (Header, Footer, Mobile Nav)
- ✅ Feedback (Alerts, Toasts, Loading States)

### Component Naming

- Use descriptive names: `CartDrawer`, `ProductCard`, `ThemePanel`
- Be consistent with file naming (PascalCase)
- Group related components: `/components/ui`, `/components/cart`, `/components/layout`

---

## 🧪 Testing Patterns

### Visual Regression Testing

1. Screenshot testing across breakpoints
2. Color contrast validation
3. Interactive state verification
4. Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Responsive Testing

- Test on: Mobile (375px), Tablet (768px), Desktop (1440px)
- Verify: Content readability, touch targets (44px minimum), navigation

### Accessibility Testing

- Keyboard navigation: Tab through all elements
- Screen reader: Test with VoiceOver/NVDA
- Color contrast: Use browser extensions
- Reduced motion: Verify animation preferences respected

---

## 🚀 Performance Guidelines

### Code Optimization

- Tree-shake unused Tailwind utilities
- Lazy load components below the fold
- Optimize images (WebP format, lazy loading)
- Minimize bundle size

### Loading Performance

- Critical CSS inline
- Above-the-fold content first
- Progressive enhancement
- Skeleton loaders for data fetching

---

## 📖 Implementation Checklist

When implementing new features:

- [ ] Follow mobile-first responsive pattern
- [ ] Use appropriate color tokens from theme
- [ ] Include proper TypeScript types
- [ ] Add focus states for all interactive elements
- [ ] Test color contrast ratios
- [ ] Include loading and error states
- [ ] Add hover and active state feedback
- [ ] Use semantic HTML elements
- [ ] Test with keyboard navigation
- [ ] Verify animations are smooth and subtle
- [ ] Check cross-browser compatibility
- [ ] Ensure proper text scaling
- [ ] Test in both light and dark modes

---

## 📚 Resources

### Design Inspiration
- Pixar Animation Studios (character design, color palettes)
- Linear.app (modern fintech aesthetics)
- Stripe (payment UI patterns)
- Vercel (clean, approachable tech)

### Tools
- Color: Coolors.co, Adobe Color
- Contrast: WebAIM Contrast Checker
- Icons: Lucide React (our icon library)
- Typography: Google Fonts (Inter, Outfit)

---

## 🔄 Version History

**v1.0.0** - Initial Design System
- Pixar-inspired futurism philosophy
- Three-color theming system
- 21 color presets across 7 categories
- Responsive-first approach
- Accessibility-focused patterns

---

*This design system is a living document. Update as patterns evolve and new components are added.*
