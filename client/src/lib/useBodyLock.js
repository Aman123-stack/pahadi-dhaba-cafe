import { useEffect } from 'react';

// Stops the page behind an overlay from scrolling. Counted, so stacked overlays don't fight.
let locks = 0;

export function useBodyLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    locks += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      locks -= 1;
      if (locks === 0) document.body.style.overflow = '';
    };
  }, [active]);
}
