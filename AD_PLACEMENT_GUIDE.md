# Google AdSense Implementation Guide

## Current Ad Placements

### ✅ Implemented

1. **Game Screen (Home.jsx)** - Bottom Banner
   - Component: `AdSense` (horizontal 60px banner)
   - Location: Below the search input
   - Revenue: Continuous during gameplay
   - Non-intrusive, always visible

2. **Results Modal (Modal.jsx)** - Square Ad
   - Component: `AdSenseSquare` (300x250)
   - Location: Bottom of win/loss modal
   - Revenue: High engagement moment
   - Already implemented

3. **Menu Screen (Menu.jsx)** - Square Ad
   - Component: `AdSenseSquare` (300x250)
   - Location: Bottom of menu page
   - Revenue: User browsing collections
   - Just added

## Ad Components

### AdSense.jsx
- Horizontal banner (100% width, 60px height)
- Best for: Bottom of game screen, footers
- Ad Slot: 5105136682

### AdSenseSquare.jsx
- Square format (300x250 recommended)
- Best for: Modals, menu pages, between content
- Ad Slot: 5105136682

## Revenue Optimization Tips

### High Priority (Implement Next)
- **Interstitial between games**: Show full-screen ad every 2-3 games
- **Rewarded video**: Let users watch ad to reveal a cast member

### Best Practices
- ✅ Ads placed at natural break points
- ✅ Non-intrusive during active gameplay
- ✅ High visibility without blocking content
- ❌ Never cover cast members or hints
- ❌ Never interrupt typing/searching

## Ad Frequency Guidelines

- **Banner ads**: Always visible (continuous)
- **Modal ads**: Every game completion
- **Interstitial**: Every 2-3 games (if implemented)
- **Rewarded**: User choice only

## Testing

Make sure to test:
1. Ad loads properly on all pages
2. Responsive on mobile devices
3. Dark mode compatibility
4. No layout shifts when ads load

## Notes

- Your AdSense client ID: `ca-pub-7731037445831235`
- All ads use the same slot ID currently
- Consider creating separate ad slots for better tracking
- Monitor AdSense dashboard for performance metrics
