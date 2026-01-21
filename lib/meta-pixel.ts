// Meta Pixel tracking utilities

declare global {
  interface Window {
    fbq?: (
      action: 'init' | 'track',
      event: string,
      params?: Record<string, any>
    ) => void
  }
}

/**
 * Track InitiateCheckout event
 * Call this when a user starts the checkout process
 */
export function trackInitiateCheckout(params?: {
  content_name?: string
  content_ids?: string[]
  value?: number
  currency?: string
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', params)
  }
}

/**
 * Track PageView event (usually handled automatically by base code)
 */
export function trackPageView() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

/**
 * Track Purchase event
 * Call this when a purchase is completed
 */
export function trackPurchase(params?: {
  value?: number
  currency?: string
  content_ids?: string[]
  content_name?: string
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', params)
  }
}

/**
 * Check if Meta Pixel is loaded
 */
export function isMetaPixelLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq !== 'undefined'
}
