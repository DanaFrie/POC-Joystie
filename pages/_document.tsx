import { Html, Head, Main, NextScript } from 'next/document';

/** Pages-router stub — App Router owns UI; Next still needs these for /404|/500. */
export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
