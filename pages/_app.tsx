import type { AppProps } from 'next/app';

/** Pages-router stub — keeps Next’s default error pages compiling on Windows. */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
