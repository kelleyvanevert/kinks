import { useRef, useCallback } from "react";

export function useRefCallback<A extends any[], T>(
  fn: (...args: A) => T
): ((...args: A) => T) & { provided: boolean };

export function useRefCallback<A extends any[], T>(
  fn?: (...args: A) => T
): ((...args: A) => undefined | T) & { provided: boolean };

export function useRefCallback<A extends any[], T>(
  fn?: (...args: A) => T
): ((...args: A) => undefined | T) & { provided: boolean } {
  const _fn = useRef(fn);
  _fn.current = fn;

  const wrapper = useCallback((...args: A) => {
    if (_fn.current) {
      return _fn.current(...args);
    }
  }, []);

  // @ts-ignore
  wrapper.provided = !!fn;

  // @ts-ignore
  return wrapper;
}
