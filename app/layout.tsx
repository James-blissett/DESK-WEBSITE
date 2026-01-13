
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finally a premium standing desk that won\'t cost an arm and a leg',
  description: 'Discover the perfect standing desk that combines premium quality with affordability',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="ghibli">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
