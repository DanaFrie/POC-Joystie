import './globals.css'
import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import Navigation from '@/components/ui/Navigation'
import ConditionalNavigation from '@/components/ui/ConditionalNavigation'

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
          background: `
            radial-gradient(at 0% 0%, rgba(45, 50, 60, 0.3) 0%, transparent 50%),
            radial-gradient(at 100% 0%, rgba(135, 206, 250, 0.4) 0%, transparent 50%),
            radial-gradient(at 0% 100%, rgba(154, 205, 50, 0.3) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(64, 224, 208, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, rgba(250, 245, 240, 0.8) 0%, rgba(240, 248, 255, 0.9) 100%),
            #FFFCF8
          `,
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="relative min-h-screen">
          <ConditionalNavigation />
          <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8 lg:[&>*]:rounded-[20px] lg:rounded-[20px] rounded-none overflow-x-hidden" style={{ border: 'none', outline: 'none' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}