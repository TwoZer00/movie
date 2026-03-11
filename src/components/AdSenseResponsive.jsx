import { useEffect, useRef, useState } from 'react';

/**
 * Responsive AdSense component optimized for mobile
 * Automatically adjusts ad format based on screen size and placement
 * 
 * @param {string} format - 'banner' | 'square' | 'vertical' (default: 'banner')
 * @param {string} className - Additional CSS classes
 */
export default function AdSenseResponsive({ format = 'banner', className = '' }) {
  const adRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);

      // Set dimensions based on format and screen size
      if (format === 'banner') {
        setDimensions({
          width: '100%',
          height: mobile ? '50px' : '90px'
        });
      } else if (format === 'square') {
        setDimensions({
          width: mobile ? '300px' : '336px',
          height: mobile ? '250px' : '280px'
        });
      } else if (format === 'vertical') {
        setDimensions({
          width: '160px',
          height: '600px'
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const timer = setTimeout(() => {
      if (adRef.current && !adRef.current.hasChildNodes()) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('AdSense Responsive error:', e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [format]);

  const containerStyle = {
    minHeight: dimensions.height,
    maxHeight: format === 'banner' ? (isMobile ? '60px' : '90px') : dimensions.height,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  };

  const adStyle = {
    display: format === 'banner' ? 'block' : 'inline-block',
    width: dimensions.width,
    height: dimensions.height,
    maxWidth: '100%',
    maxHeight: format === 'banner' && isMobile ? '50px' : dimensions.height
  };

  return (
    <div className={`adsense-responsive ${className}`} style={containerStyle}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-7731037445831235"
        data-ad-slot="5105136682"
        data-ad-format={format === 'banner' ? 'auto' : undefined}
        data-full-width-responsive={format === 'banner' ? 'true' : 'false'}
      />
    </div>
  );
}
