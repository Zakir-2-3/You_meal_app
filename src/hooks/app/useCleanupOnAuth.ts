import { useRef } from 'react';

export function useCleanupOnAuth() {
  const cleanupDone = useRef(false);
  
  return () => {
    if (!cleanupDone.current) {
      cleanupDone.current = true;
      fetch("/api/cleanup", { method: "POST" }).catch(console.warn);
    }
  };
}