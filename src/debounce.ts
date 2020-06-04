export function debounce(f: () => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;

  const defer = function () {
    timeout = null;
    f();
  };

  return function () {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(defer, wait);
  };
}
