import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Serai — Premium Wholesale Marketplace',
    template: '%s | Serai',
  },
  description:
    'The wholesale marketplace connecting premium D2C beauty and wellness brands with boutique retailers across India.',
  keywords: ['wholesale beauty', 'D2C brands', 'boutique retail', 'India beauty market'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Serai',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#faf8f5]">{children}</body>
    </html>
  )
}
