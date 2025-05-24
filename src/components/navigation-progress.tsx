'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect will run whenever the pathname or search params change
    // We'll use this to show/hide the loading indicator
    setIsNavigating(true);

    // Hide the loading indicator after a short delay
    // This ensures it's visible long enough for users to notice
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-100 overflow-hidden">
      <div 
        className="h-full bg-blue-600 absolute"
        style={{ 
          animation: 'progress 2s ease-in-out infinite',
          width: '100%'
        }}
      />
    </div>
  );
}
