import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <ins 
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', height: '90px' }}
      data-ad-client="ca-pub-7731037445831235"
      data-ad-slot="5105136682"
      data-ad-format="horizontal"
      data-full-width-responsive="false"
    />
  );
}
