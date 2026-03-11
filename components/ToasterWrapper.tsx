'use client';

import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ToasterWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <Toaster
      position={isMobile ? 'bottom-center' : 'top-center'}
      toastOptions={{
        duration: 2500,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          fontSize: '13px',
          fontWeight: '600',
          padding: '10px 16px',
          backdropFilter: 'blur(20px)',
        },
        success: {
          iconTheme: { primary: '#ff6b6b', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#e74c3c', secondary: '#fff' },
        },
      }}
      containerStyle={isMobile ? { bottom: 80 } : {}}
    />
  );
}
