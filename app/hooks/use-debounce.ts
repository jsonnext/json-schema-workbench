import { debounce } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';

export const useDebounce = (callback: () => void) => {
  const ref = useRef<() => void>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, 500);
  }, []);

  return debouncedCallback;
};
