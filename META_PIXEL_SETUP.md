# Meta Pixel Setup Guide

This document explains how Meta Pixel is integrated into the website and how to verify it's working correctly.

## Implementation Overview

The Meta Pixel has been integrated into the website with the following components:

1. **Base Pixel Code** (`components/MetaPixel.tsx`)
   - Loads on every page automatically
   - Tracks PageView events
   - Uses environment variable for Pixel ID

2. **InitiateCheckout Tracking** (`components/CheckoutForm.tsx`)
   - Automatically tracks when users click "Proceed to Checkout"
   - Includes product information (name, ID, price, currency)

3. **Tracking Utilities** (`lib/meta-pixel.ts`)
   - Reusable functions for tracking various Meta Pixel events

## Environment Variable Setup

### Local Development (.env.local)

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_META_PIXEL_ID=984883318036668
```

**Important:** 
- The variable name must be `NEXT_PUBLIC_META_PIXEL_ID` (with `NEXT_PUBLIC_` prefix for client-side access)
- Replace `984883318036668` with your actual Meta Pixel ID if different
- Restart your dev server after adding/updating environment variables

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `NEXT_PUBLIC_META_PIXEL_ID`
   - **Value:** `984883318036668` (or your actual Pixel ID)
   - **Environment:** Production, Preview, and Development (select all)
4. **Redeploy** your application for the changes to take effect

## Verification Steps

### 1. Check Environment Variable

Verify the environment variable is set correctly:

```bash
# In your terminal, check if the variable is accessible
echo $NEXT_PUBLIC_META_PIXEL_ID
```

Or check your `.env.local` file contains:
```
NEXT_PUBLIC_META_PIXEL_ID=984883318036668
```

### 2. Test in Browser

1. **Open your website** in a browser (preferably in incognito/private mode to avoid cached data)
2. **Open Developer Tools** (F12 or Right-click → Inspect)
3. Go to the **Network** tab
4. Filter by `fbevents` or `facebook`
5. **Reload the page** - you should see a request to `https://connect.facebook.net/en_US/fbevents.js`
6. You should also see POST requests to `https://www.facebook.com/tr/` when events fire

### 3. Use Meta Pixel Helper (Recommended)

1. Install the [Meta Pixel Helper Chrome Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Visit your website
3. Click the extension icon - it should show:
   - ✅ Pixel ID detected: `984883318036668`
   - ✅ PageView event fired
4. Fill out the checkout form and click "Proceed to Checkout"
5. The extension should show:
   - ✅ InitiateCheckout event fired

### 4. Check Meta Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Go to **Test Events** tab
4. Enter your website URL
5. Interact with your website - you should see events appearing in real-time:
   - `PageView` events when pages load
   - `InitiateCheckout` events when users click checkout

## Troubleshooting

### Meta Says Pixel Isn't Detected

**Common Issues:**

1. **Environment variable not set correctly**
   - Verify `NEXT_PUBLIC_META_PIXEL_ID` is in `.env.local`
   - Make sure there are no spaces around the `=` sign
   - Restart your dev server after adding the variable

2. **Variable not deployed to Vercel**
   - Check Vercel environment variables are set
   - Ensure you've redeployed after adding the variable
   - Verify the variable name matches exactly: `NEXT_PUBLIC_META_PIXEL_ID`

3. **Browser caching**
   - Clear browser cache or use incognito mode
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **Ad blockers**
   - Disable ad blockers temporarily to test
   - Some privacy extensions block Meta Pixel

5. **Script not loading**
   - Check browser console for errors
   - Verify the script tag appears in page source (View Page Source → search for "fbevents.js")
   - Check Network tab for failed requests

### Events Not Tracking

1. **Check browser console** for JavaScript errors
2. **Verify fbq function exists**: In browser console, type `window.fbq` - it should return a function
3. **Manually test tracking**: In browser console, type:
   ```javascript
   window.fbq('track', 'InitiateCheckout')
   ```
   Then check Meta Events Manager to see if the event appears

### Pixel ID Mismatch

If Meta shows a different Pixel ID or no ID:
- Double-check your `.env.local` file has the correct Pixel ID
- Verify Vercel environment variable matches
- Ensure you've restarted/redeployed after changes

## Event Tracking

### Currently Tracked Events

- **PageView**: Automatically tracked on every page load
- **InitiateCheckout**: Tracked when user clicks "Proceed to Checkout" button

### Adding More Events

To track additional events, use the utility functions in `lib/meta-pixel.ts`:

```typescript
import { trackPurchase } from '@/lib/meta-pixel'

// Example: Track purchase after successful checkout
trackPurchase({
  value: 299.99,
  currency: 'AUD',
  content_ids: ['product-123'],
  content_name: 'Standing Desk',
})
```

## Performance Goal Setup

For "Maximizing the number of conversions" with "InitiateCheckout" as the conversion event:

1. Go to Meta Ads Manager
2. Create a new campaign or edit existing campaign
3. Set **Campaign Objective** to "Sales" or "Conversions"
4. In **Ad Set** settings:
   - **Optimization & Delivery**: Select "Conversions"
   - **Conversion Event**: Select "InitiateCheckout"
5. The pixel will automatically track InitiateCheckout events when users click checkout

## Support

If you continue to have issues:
1. Check Meta's [Pixel Troubleshooting Guide](https://www.facebook.com/business/help/490558087422411)
2. Use Meta Pixel Helper extension for detailed diagnostics
3. Check browser console for JavaScript errors
4. Verify environment variables are set correctly in both local and production environments
