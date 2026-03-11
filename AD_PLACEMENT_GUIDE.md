# Google AdSense Implementation Guide

## Mobile Optimization ✨

All ad components have been optimized for mobile devices with:
- **Responsive sizing**: Ads automatically adjust based on screen size
- **Performance**: Lazy loading and efficient rendering
- **UX-focused**: Non-intrusive placement that doesn't block gameplay
- **Breakpoints**: 
  - Mobile: < 768px (banner ads, hidden vertical ads)
  - Desktop: ≥ 768px (all ad formats)
  - XL Desktop: ≥ 1280px (vertical sidebar ads visible)

## Current Ad Placements

### ✅ Implemented & Optimized

1. **Game Screens (Home.jsx, LinkGame.jsx, OddOneOut.jsx)**
   - **Mobile**: Responsive banner ad (50-100px height)
   - **Desktop**: Vertical sidebar ads (160x600) + banner
   - Component: `AdSenseResponsive`
   - Location: Below game content, sidebars on XL screens
   - Revenue: Continuous during gameplay
   - Non-intrusive, always visible

2. **Results Modal (Modal.jsx)** - Square Ad
   - Component: `AdSenseSquare` (300x250 mobile, 336x280 desktop)
   - Location: Bottom of win/loss modal
   - Revenue: High engagement moment
   - Responsive sizing

3. **Menu Screen (Menu.jsx)** - Square Ad
   - Component: `AdSenseSquare` (300x250 mobile, 336x280 desktop)
   - Location: Bottom of menu page
   - Revenue: User browsing collections
   - Responsive sizing

## Ad Components

### AdSenseResponsive.jsx ⭐ NEW
- **Universal responsive component**
- Formats: 'banner' | 'square' | 'vertical'
- Auto-adjusts to screen size
- Best for: All placements
- Mobile-optimized

### AdSense.jsx
- Horizontal banner (100% width, responsive height)
- Mobile: 50-100px, Desktop: 60-120px
- Best for: Bottom of game screen, footers
- Ad Slot: 5105136682

### AdSenseSquare.jsx
- Square format (responsive)
- Mobile: 300x250, Desktop: 336x280
- Best for: Modals, menu pages, between content
- Ad Slot: 5105136682

### AdSenseVertical.jsx
- Vertical format (160x600)
- Desktop only (hidden on mobile)
- Best for: Sidebar placements
- Ad Slot: 5105136682

## Mobile-Specific Optimizations

### Layout Strategy
- ✅ Vertical ads hidden on screens < 1280px (XL breakpoint)
- ✅ Banner ads use full-width responsive format
- ✅ Square ads scale down on mobile (300x250)
- ✅ Proper spacing and padding for touch targets
- ✅ No layout shift when ads load

### Performance
- ✅ Lazy loading with 100ms delay
- ✅ Error handling to prevent crashes
- ✅ Resize listeners for orientation changes
- ✅ Cleanup on component unmount

## Revenue Optimization Tips

### High Priority (Implement Next)
- **Interstitial between games**: Show full-screen ad every 2-3 games
- **Rewarded video**: Let users watch ad to reveal a cast member
- **Native ads**: Blend ads with game content

### Best Practices
- ✅ Ads placed at natural break points
- ✅ Non-intrusive during active gameplay
- ✅ High visibility without blocking content
- ✅ Mobile-first responsive design
- ✅ Touch-friendly spacing
- ❌ Never cover cast members or hints
- ❌ Never interrupt typing/searching
- ❌ Never show vertical ads on mobile

## Ad Frequency Guidelines

- **Banner ads**: Always visible (continuous)
- **Sidebar ads**: Desktop XL only (≥1280px)
- **Modal ads**: Every game completion
- **Interstitial**: Every 2-3 games (if implemented)
- **Rewarded**: User choice only

## Testing Checklist

### Mobile Testing (< 768px)
- [ ] Banner ads load and display correctly
- [ ] No vertical sidebar ads visible
- [ ] Square ads are 300x250
- [ ] No horizontal scrolling
- [ ] Touch targets are accessible
- [ ] Ads don't block game controls

### Tablet Testing (768px - 1279px)
- [ ] Banner ads display properly
- [ ] No vertical sidebar ads
- [ ] Square ads scale appropriately
- [ ] Layout remains centered

### Desktop Testing (≥ 1280px)
- [ ] Vertical sidebar ads visible
- [ ] Banner ads display
- [ ] Square ads are 336x280
- [ ] No layout shifts
- [ ] Dark mode compatibility

### General
- [ ] Ads load on all game modes
- [ ] Responsive on orientation change
- [ ] No console errors
- [ ] AdSense script loads properly

## Notes

- Your AdSense client ID: `ca-pub-7731037445831235`
- All ads use the same slot ID currently: `5105136682`
- Consider creating separate ad slots for better tracking
- Monitor AdSense dashboard for performance metrics
- Mobile traffic typically has lower CPM but higher volume
- Test with real AdSense ads (not test ads) for accurate sizing
