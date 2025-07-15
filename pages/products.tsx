import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ProductsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new shop page, preserving any query parameters
    router.replace({
      pathname: '/shop',
      query: router.query
    });
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Shop - Cakelandia</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        color: '#663399'
      }}>
        <h1>Redirecting to Shop...</h1>
        <p>Please wait or <a href="/shop" style={{ color: '#663399', textDecoration: 'underline' }}>click here</a> if you are not redirected automatically.</p>
      </div>
    </>
  );
}
