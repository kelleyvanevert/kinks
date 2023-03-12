import { RefObject, useEffect, useState } from "react";

export function useBoundingClientRect(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect>();

  useEffect(() => {
    const getRect = () => {
      if (!ref.current) return;
      setRect(ref.current.getBoundingClientRect());
    };

    getRect();
    window.addEventListener("resize", getRect);
    return () => window.removeEventListener("resize", getRect);
  }, [setRect]);

  return rect;
}
