export function randomFromArray<T>(arr: T[], exclude?: T[]) {
  if (exclude) {
    arr = arr.filter((a) => !exclude.includes(a));
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
