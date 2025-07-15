import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head key="document-head" />
      <body>
        <Main key="document-main" />
        <NextScript key="document-scripts" />
      </body>
    </Html>
  );
}
