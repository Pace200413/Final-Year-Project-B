# Troubleshooting Guide

## Port 3000 Already in Use (EADDRINUSE)

**Symptom:** Server fails to start with "EADDRINUSE ::3000" error

**Quick Fix (PowerShell - Recommended):**
```powershell
# Automated - Run the included script
.\kill-port-3000.ps1

# Or manual one-liner:
Get-NetTCPConnection -LocalPort 3000 | Select-Object -First 1 -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Alternative (CMD or PowerShell):**
```bash
# Find the process
netstat -ano | findstr :3000

# Kill it (note the PID from last column)
taskkill /PID <PID> /F

# Or use port 3001 (already configured)
npm run dev  # Runs on port 3001
```

**Prevention:**
- Always stop the dev server (Ctrl+C) before closing terminal
- Check for orphaned node processes before starting
- Use port 3001 as configured in package.json

---

## Next.js Configuration Warnings

**Symptom:** Warning about `experimental.outputFileTracingRoot` deprecation

**Status:** ✅ **FIXED** - Moved to top-level `outputFileTracingRoot` in next.config.ts

**What was changed:**
```typescript
// Before (deprecated)
experimental: {
  outputFileTracingRoot: __dirname,
}

// After (Next 15+)
outputFileTracingRoot: __dirname,
```

---

## Hydration Errors / UI Flicker

**Symptom:** 
- Brief "snap" or flicker when page loads
- Elements shifting size or colors after initial render
- Console warnings about hydration mismatch

**Status:** ✅ **FIXED** in Settings page

**What causes it:**
- Server renders with default values (e.g., theme='system')
- Client reads localStorage and changes value immediately
- React detects mismatch between server HTML and client re-render

**How it's fixed:**
1. Use stable initial state on both server and client
2. Add `mounted` state that starts as `false`
3. Read localStorage only in `useEffect` after mount
4. Pass `mounted` prop to components that need it

**Example:**
```typescript
const [mounted, setMounted] = useState(false);
const [textSize, setTextSize] = useState('default'); // Stable default

useEffect(() => {
  setMounted(true);
  const stored = localStorage.getItem('textSize');
  if (stored) setTextSize(stored); // Update after mount
}, []);

// Use mounted to control rendering
<Slider value={textSize} mounted={mounted} />
```

---

## Mobile Overlay Issues

**Symptom:**
- Modals/sheets overlap bottom navigation
- Content cut off at bottom on iPhone
- Z-index stacking problems

**Status:** ✅ **FIXED** - Safe-area insets added to all overlays

**What was changed:**
- All bottom sheets now use `calc()` for maxHeight and paddingBottom
- Formula: `calc(80vh - env(safe-area-inset-bottom))`
- Padding: `calc(1rem + env(safe-area-inset-bottom))`

**Components updated:**
- ✅ AssistantChat.tsx
- ✅ ContactForm.tsx  
- ✅ Settings page bottom sheets

---

## CSS Not Loading / Unstyled HTML

**Symptom:** 
- Page shows raw HTML with blue links and bullets
- No colors, spacing, or design applied

**Root Cause:** Tailwind CSS not compiling

**Fixes Applied:**
1. ✅ Restored `tailwind.config.js` (v3.4.18 needs JS config)
2. ✅ Removed duplicate `tailwind.config.ts`
3. ✅ Verified PostCSS config includes Tailwind plugin
4. ✅ Confirmed content globs cover `src/app` and `src/components`

**How to verify:**
1. Dev server running on port 3001
2. Check Network tab in DevTools
3. Look for `/_next/static/css/app-*.css` (should be 200 OK, several hundred KB)
4. If tiny or missing, restart dev server

---

## Quick Health Check

Run these commands to verify everything is working:

```bash
# 1. Ensure you're in the project root
cd "C:\Users\ASUS\Desktop\2025 Sem 2\COS40005\swinburne-app-group13-main\swinburne-app-group13-main"

# 2. Kill any orphaned processes
taskkill /IM node.exe /F

# 3. Start dev server (configured for port 3001)
npm run dev

# 4. Check it's running
# Should see: "ready started server on 0.0.0.0:3001"

# 5. Test on local machine
# Open http://localhost:3001

# 6. Test on mobile (same network)
# Open http://[your-ip]:3001
```

---

## Files Modified (Latest Updates)

**Configuration:**
- ✅ `next.config.ts` - Moved outputFileTracingRoot to top-level
- ✅ `package.json` - Dev server bound to 0.0.0.0:3001
- ✅ `tailwind.config.js` - Restored for v3.4.18 compatibility

**Hydration Fixes:**
- ✅ `src/app/settings/page.tsx` - Stable initial state, mounted guard
- ✅ `src/providers/LocaleProvider.tsx` - Deferred localStorage reads
- ✅ `src/components/RoleSwitcher.tsx` - Mounted state

**Safe-Area Fixes:**
- ✅ `src/components/AssistantChat.tsx` - Proper inset handling
- ✅ `src/components/ContactForm.tsx` - Proper inset handling
- ✅ `src/app/settings/page.tsx` - Bottom sheets respect safe areas

**New Features:**
- ✅ `src/lib/clipboard.ts` - Safe clipboard with fallback
- ✅ `src/data/assistant-intents.ts` - Intent routing and department data
- ✅ `src/app/globals.css` - Horizontal scroller styles

---

## When to Restart Dev Server

Restart required after:
- ✅ Changing `next.config.ts`
- ✅ Changing `tailwind.config.js`
- ✅ Changing `postcss.config.mjs`
- ✅ Installing/removing npm packages
- ✅ Modifying `.env` files

No restart needed for:
- ❌ Editing React components
- ❌ Editing CSS files
- ❌ Editing TypeScript files
- ❌ Adding/removing files in src/

---

## Common Error Messages

### "Module not found"
**Fix:** Run `npm install` to ensure all dependencies are installed

### "Tailwind classes not working"
**Fix:** Restart dev server after config changes

### "Hydration failed"
**Fix:** Check for localStorage/window usage during render, move to useEffect

### "Port already in use"
**Fix:** Kill node processes or use configured port 3001

---

## Support Contacts

For build/deployment issues:
- Check Next.js docs: https://nextjs.org/docs
- Tailwind CSS docs: https://tailwindcss.com/docs

For app-specific questions:
- Review this troubleshooting guide
- Check git commit history for recent changes
- Verify all modified files listed above

