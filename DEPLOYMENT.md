# Deployment Guide

## Service Worker Cache Management

**IMPORTANT**: When deploying new code, always update the cache version in `/public/sw.js`:

```javascript
const CACHE_NAME = 'filmdle-v4'; // Increment this number (v3 -> v4 -> v5, etc.)
```

### Why This Is Needed
- Service workers cache files aggressively
- Without version updates, users get old cached content
- Hard refresh is required to bypass cache without version bump

### Deployment Checklist
1. ✅ Update `CACHE_NAME` version in `sw.js`
2. ✅ Build and deploy
3. ✅ Test in incognito/private window
4. ✅ Verify console logs show new SW version

### Current Version: v3
**Next deployment should use: v4**