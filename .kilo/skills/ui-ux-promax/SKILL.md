---
name: ui-ux-promax
description: UI/UX Promax - Advanced design principles, accessibility, and modern interface patterns for building exceptional user experiences
---

# UI/UX Promax Skill

Comprehensive guide for creating world-class user interfaces and experiences.

## Design Principles

### Visual Hierarchy
- **Size & Scale**: Primary actions 1.5-2x larger than secondary
- **Color & Contrast**: WCAG AA minimum 4.5:1 for text, 3:1 for UI elements
- **Typography**: Max 3 font weights, 2 font families, consistent scale (1.25 ratio)
- **Whitespace**: 8px base unit, 4px increments for micro-spacing

### Color System
- **Primary**: Brand color, used for primary actions, links, focus states
- **Secondary**: Supporting actions, less prominent CTAs
- **Semantic**: Success (green), Warning (amber), Error (red), Info (blue)
- **Neutral**: 10-step grayscale (50-950) for text, borders, backgrounds
- **Dark Mode**: Invert neutrals, desaturate colors by 10-15%, maintain contrast ratios

### Typography Scale
```
Display: 57px/64px (headlines, hero)
H1: 40px/48px (page titles)
H2: 32px/40px (section headers)
H3: 24px/32px (subsection headers)
H4: 20px/28px (card titles)
Body: 16px/24px (default reading)
Small: 14px/20px (labels, captions)
Micro: 12px/16px (timestamps, badges)
```

## Component Patterns

### Buttons
- **Primary**: Filled, high contrast, default action
- **Secondary**: Outlined, supporting actions
- **Tertiary**: Text-only, minimal emphasis
- **Destructive**: Red fill/outline, irreversible actions
- **Sizes**: Large (48px), Default (40px), Small (32px), Icon-only (40x40px)
- **States**: Default, Hover, Active, Focus, Disabled, Loading

### Forms
- **Labels**: Always visible, above input, required indicator
- **Validation**: Inline, real-time on blur, summary on submit
- **Error State**: Red border, error icon, descriptive message below
- **Success State**: Green border, checkmark for async validation
- **Accessibility**: `aria-describedby` for help/error, `aria-invalid`, `aria-required`

### Navigation
- **Header**: Logo left, primary nav center/right, user menu far right
- **Sidebar**: Collapsible, 240px expanded / 64px collapsed
- **Breadcrumbs**: Current page non-clickable, separators chevron
- **Tabs**: Horizontal, underline indicator, keyboard operable
- **Pagination**: First/Prev/Next/Last + page numbers, max 5 visible

### Feedback
- **Toast**: Top-right, auto-dismiss 5s, action button optional
- **Modal**: Centered, backdrop blur, focus trap, ESC to close
- **Drawer**: Side panel, 320-480px, swipe dismiss on mobile
- **Progress**: Linear (determinate/indeterminate), Circular (loaders)
- **Skeleton**: Match content structure, shimmer animation

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- Tab order matches visual order
- Focus visible (2px offset outline, 3:1 contrast)
- Skip links for main content
- No keyboard traps

### Screen Readers
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<aside>`)
- ARIA landmarks, roles, labels where native insufficient
- Live regions for dynamic content (`aria-live="polite"`)
- Descriptive alt text for images, empty for decorative

### Motion & Animation
- Respect `prefers-reduced-motion`
- Transitions ≤ 200ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`
- No flashing > 3Hz
- Parallax disabled when reduced motion

## Responsive Breakpoints
```
Mobile:     320px - 767px   (1 col)
Tablet:     768px - 1023px  (2 col)
Desktop:    1024px - 1439px (3-4 col)
Wide:       1440px+         (4-5 col)
```

## Performance Guidelines
- **Images**: WebP/AVIF, responsive `srcset`, lazy load below fold
- **Fonts**: `font-display: swap`, subset, preload critical
- **CSS**: Critical inline, non-critical async, minimize unused
- **JS**: Code-split by route, defer non-critical, minimize main thread

## Design Tokens Structure
```json
{
  "color": { "primary": {}, "neutral": {}, "semantic": {} },
  "spacing": { "base": 8, "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64] },
  "typography": { "fontFamily": {}, "fontSize": {}, "fontWeight": {}, "lineHeight": {} },
  "borderRadius": { "none": 0, "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999 },
  "shadow": { "sm": "0 1px 2px", "md": "0 4px 6px", "lg": "0 10px 15px", "xl": "0 20px 25px" },
  "transition": { "fast": "150ms", "normal": "200ms", "slow": "300ms" },
  "zIndex": { "dropdown": 100, "sticky": 200, "modal": 300, "popover": 400, "tooltip": 500 }
}
```

## UX Patterns

### Onboarding
- Progressive disclosure, one concept per screen
- Interactive walkthrough > static slides
- Skip option always visible
- Completion celebration

### Empty States
- Illustrative graphic, clear headline, actionable CTA
- Context-aware messaging (first use vs. cleared data)
- Link to help/docs if complex

### Error Handling
- Inline for field errors, toast for system errors
- Human-readable, actionable, non-technical
- Recovery path always provided
- Log technical details server-side only

### Loading States
- Skeleton for known structure
- Spinner for unknown duration
- Progress bar for measurable operations
- Optimistic UI for instant perceived performance

## Modern Patterns (2024+)

### Micro-interactions
- Button ripple, input focus ring, card hover lift
- Staggered entrance animations (50-100ms delay)
- Drag preview, drop zone highlight

### AI-Enhanced UX
- Inline suggestions, predictive input
- Natural language commands
- Contextual help generated on-demand
- Smart defaults from user behavior

### Inclusive Design
- Language selection with auto-detect
- RTL support built-in
- High contrast mode toggle
- Font size user preference persistence

## Usage

Reference this skill when:
- Designing new components or screens
- Auditing existing UI for accessibility
- Creating design system documentation
- Reviewing PRs for UX quality
- Onboarding team members to design standards

Invoke with: "Apply ui-ux-promax principles to..." or "Review this design against ui-ux-promax guidelines"