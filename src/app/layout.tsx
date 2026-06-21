import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Heebo } from 'next/font/google'
import { simplerPro } from '@/lib/fonts'
import { isMetaPixelEnabled, META_PIXEL_ID } from '@/constants/meta-pixel'
import ConditionalNavigation from '@/components/ui/ConditionalNavigation'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ConditionalMainWrapper from '@/components/ui/ConditionalMainWrapper'

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  title: 'Joy Wallet of Digital Balance',
  description: 'Creating financial incentives for balanced digital usage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={`layout-root ${heebo.variable} ${simplerPro.variable}`}>
      <body className="layout-root font-heebo min-h-screen overflow-y-auto overflow-x-hidden">
        {isMetaPixelEnabled() ? (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
            `}
          </Script>
        ) : null}
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