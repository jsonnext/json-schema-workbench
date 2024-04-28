import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TODO: fix auto-generics
export function debounce<A = unknown, R = void>(
  fn: (args: A) => R,
  ms: number
): [(args: A) => Promise<R>, () => any] {
  let timer: NodeJS.Timeout;

  const debouncedFunc = (args: A): Promise<R> =>
      new Promise((resolve) => {
          if (timer) {
              clearTimeout(timer);
          }

          timer = setTimeout(() => {
              resolve(fn(args));
          }, ms);
      });

  const teardown = () => clearTimeout(timer);

  return [debouncedFunc, teardown];
}
