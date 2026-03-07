# Deployment Guide

## Service Worker Cache Management

**AUTOMATIC**: Cache version now auto-generates using timestamp.

### How It Works
- Each build creates unique cache name: `filmdle-{timestamp}`
- No manual version updates needed
- Old caches automatically cleared

### Deployment Checklist
1. ✅ Build and deploy (version auto-updates)
2. ✅ Test in incognito/private window
3. ✅ Verify console logs show new SW version

**No more manual version management required!**