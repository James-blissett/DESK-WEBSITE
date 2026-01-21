'use client'

import { useEffect } from 'react'
import Script from 'next/script'
// Import the global Window type declaration from meta-pixel.ts
import '@/lib/meta-pixel'

export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

  useEffect(() => {
    if (!pixelId) {
      console.warn('Meta Pixel ID is not configured. Please set NEXT_PUBLIC_META_PIXEL_ID in your environment variables.')
      return
    }

    // Initialize fbq if it doesn't exist
    if (typeof window !== 'undefined' && !window.fbq) {
      // Use a local fbq reference to avoid optional chaining issues
      const fbq: any = function (...args: any[]) {
        fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args)
      }
      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = fbq
    }
  }, [pixelId])

  if (!pixelId) {
    return null
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
