import { useEffect, useRef, useState } from 'react';

let adCounter = 0;

/**
 * Responsive AdSense component with fixed standard IAB sizes
 * Properly handles navigation and remounting
 * 
 * @param {string} format - 'banner' | 'square' | 'vertical' (default: 'banner')
 * @param {string} className - Additional CSS classes
 */
export default function AdSenseResponsive({ format = 'banner', className = '' }) {
  const adRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adKey] = useState(() => `adsense-${format}-${++adCounter}-${Date.now()}`);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Load ad only once per component instance
    const timer = setTimeout(() => {
      if (adRef.current && !isLoadedRef.current) {
        try {
          // Check if the ins element is empty (not already loaded)
          if (!adRef.current.hasChildNodes() || adRef.current.innerHTML === '') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoadedRef.current = true;
          }
        } catch (e) {
          console.error('AdSense Responsive error:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Fixed standard IAB ad sizes
  const getAdSize = () => {
    if (format === 'banner') {
      return isMobile 
        ? { width: '320px', height: '50px' }   // Mobile Banner
        : { width: '728px', height: '90px' };  // Leaderboard
    } else if (format === 'square') {
      return isMobile
        ? { width: '300px', height: '250px' }  // Medium Rectangle
        : { width: '336px', height: '280px' }; // Large Rectangle
    } else if (format === 'vertical') {
      return { width: '160px', height: '600px' }; // Wide Skyscraper
    }
  };

  const adSize = getAdSize();

  const containerStyle = {
    minHeight: adSize.height,
    maxHeight: adSize.height,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  };

  const adStyle = {
    display: 'inline-block',
    width: adSize.width,
    height: adSize.height
  };

  return (
    <div className={`adsense-responsive ${className}`} style={containerStyle}>
      <ins 
        key={adKey}
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
      />
    </div>
  );
}
