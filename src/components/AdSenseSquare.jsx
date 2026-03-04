import { useEffect, useRef } from 'react';

export default function AdSenseSquare() {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && adRef.current.innerHTML === '') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  return (
    <ins 
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-7731037445831235"
      data-ad-slot="5105136682"
      data-ad-format="square"
      data-full-width-responsive="false"
    />
  );
}
