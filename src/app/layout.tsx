import './globals.css'
import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import ConditionalNavigation from '@/components/ui/ConditionalNavigation'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ConditionalMainWrapper from '@/components/ui/ConditionalMainWrapper'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'Joystie - Digital Balance by Wallet',
  description: 'Creating financial incentives for balanced digital usage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={`layout-root ${heebo.variable}`}>
      <body className="layout-root font-heebo min-h-screen overflow-y-auto overflow-x-hidden">
        <div className="relative min-h-screen">
          <ScrollToTop />
          <ConditionalNavigation />
          <ConditionalMainWrapper>
            {children}
          </ConditionalMainWrapper>
        </div>
      </body>
    </html>
  )
}