import { useState, useEffect } from 'react';

export function useAutoHideFlash(flashMessage, timeout = 3000) {
  const [showFlash, setShowFlash] = useState(!!flashMessage);

  useEffect(() => {
    if (flashMessage) {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, timeout]);

  return showFlash;
}
