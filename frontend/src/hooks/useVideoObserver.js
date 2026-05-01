import { useEffect, useRef } from "react";

export default function useVideoObserver(callback, options) {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options);

    return () => observerRef.current?.disconnect();
  }, [callback, options]);

  return observerRef;
}
