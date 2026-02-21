import './globals.css'
import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import ConditionalNavigation from '@/components/ui/ConditionalNavigation'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ConditionalMainWrapper from '@/components/ui/ConditionalMainWrapper'

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'Joystie - Digital Balance for Kids',
  description: 'Creating financial incentives for balanced digital usage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={lato.variable} style={{ overflowX: 'hidden' }}>
      <body 
        className="font-lato min-h-screen overflow-y-auto overflow-x-hidden" 
        style={{ 
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          scrollBehavior: 'smooth'
        }}
      >
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