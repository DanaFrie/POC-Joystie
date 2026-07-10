import type { NextPageContext } from 'next';

type ErrorProps = {
  statusCode?: number;
};

/** Pages-router stub for /404|/500 when App Router has no custom pages error. */
function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>{statusCode ?? 500}</h1>
      <p>משהו השתבש. נסו לרענן.</p>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
