# FlowNote Landing Page

A stunning, premium landing page for FlowNote built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- ✨ **Premium Design**: Glassmorphism effects, soft gradients, and smooth animations
- 🎨 **Modern UI**: Inspired by Rewind.ai, Linear, and Arc Browser
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- ♿ **Accessible**: WCAG AA compliant with proper focus indicators
- 🚀 **Performance**: Optimized animations using GPU-accelerated transforms
- 🎭 **Animations**: Scroll-triggered animations with Framer Motion

## Getting Started

### Prerequisites

- Node.js 18.5.0+ (system Node.js v22.21.0 recommended)
- pnpm (already installed and configured in zsh)

### Important: Node.js Version

If you're using conda and getting Node.js version errors, ensure the system Node.js is used:

```bash
# Option 1: Temporarily prioritize system Node.js
export PATH="/usr/local/bin:$PATH"

# Option 2: Add to your ~/.zshrc permanently
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then verify:
```bash
node --version  # Should show v22.21.0 or higher
```

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout with fonts
│   ├── page.tsx        # Main page component
│   └── globals.css     # Global styles and utilities
├── components/
│   ├── Navigation.tsx  # Sticky navigation with glass effect
│   ├── Hero.tsx        # Hero section with email input
│   ├── HowItWorks.tsx  # 3-step process section
│   ├── Features.tsx    # Bento grid features section
│   ├── Testimonials.tsx # Customer testimonials
│   ├── Privacy.tsx     # Privacy-focused section
│   ├── FinalCTA.tsx    # Final call-to-action
│   ├── Footer.tsx      # Footer with links
│   └── GradientOrbs.tsx # Animated background orbs
└── ...
```

## Design System

### Colors
- **Primary Gradient**: Purple (#8B5CF6) → Blue (#3B82F6)
- **Background**: Soft lavender → light purple → near-white gradient
- **Glass Effect**: White at 60-70% opacity with backdrop blur

### Typography
- **Headlines**: Crimson Pro (serif) - mixed weights for visual interest
- **Body**: Inter (sans-serif) - clean and readable

### Components
- **Glass Cards**: Translucent white with backdrop blur and purple-tinted shadows
- **Buttons**: Gradient primary buttons and glass secondary buttons
- **Inputs**: Rounded-full with glass effect and purple focus ring

## Customization

### Replace Screenshots
The product mockups currently show placeholder gradients. Replace them with actual screenshots:
- Hero section: Update the laptop and phone mockup backgrounds
- Features section: Add relevant UI mockups

### Colors
Modify colors in `tailwind.config.ts` and `app/globals.css`

### Content
Update text content in each component file

## Build for Production

```bash
pnpm build
pnpm start
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Crimson Pro** - Serif font for headlines
- **Inter** - Sans-serif font for body text

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Node.js Version Issues

If you see `ERR_PNPM_UNSUPPORTED_ENGINE`, ensure you're using the system Node.js:

```bash
# Check current Node.js version
node --version

# If it shows v18.5.0 or lower, prioritize system Node.js
export PATH="/usr/local/bin:$PATH"
node --version  # Should now show v22.21.0

# Then run pnpm install again
pnpm install
```

## License

MIT
