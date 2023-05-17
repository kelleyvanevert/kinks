export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 5000,
  errorMessage = "Operation timed out"
) {
  let t: any;

  return Promise.race([
    promise.finally(() => {
      clearTimeout(t);
    }),
    new Promise<T>((resolve, reject) => {
      t = setTimeout(() => reject(new Error(errorMessage)), ms);
    }),
  ]);
}
