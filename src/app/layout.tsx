import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { appRubik } from '@/lib/fonts'
import { isMetaPixelEnabled, META_PIXEL_ID } from '@/constants/meta-pixel'
import ScrollToTop from '@/components/ui/ScrollToTop'
import ConditionalMainWrapper from '@/components/ui/ConditionalMainWrapper'
import { SessionRouteWaiter } from '@/components/auth/SessionRouteWaiter'

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
    <html lang="he" dir="rtl" className={`layout-root ${appRubik.variable}`}>
      <body className="layout-root font-rubik min-h-screen overflow-y-auto overflow-x-hidden">
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
          <ConditionalMainWrapper>
            {children}
          </ConditionalMainWrapper>
          <Suspense fallback={null}>
            <SessionRouteWaiter />
          </Suspense>
        </div>
      </body>
    </html>
  )
}
