
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MetaPixel from '@/components/MetaPixel'
import { Analytics } from '@vercel/analytics/react'
import { CartProvider } from '@/contexts/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Noxcraft Standing Desks',
  description: 'Premium standing desks inspired by nature, delivered with care',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="ghibli">
      <body className={inter.className}>
        <CartProvider>
          <MetaPixel />
          {children}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  )
}
