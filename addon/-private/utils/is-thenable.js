export function isThenable(obj) {
  if ((typeof obj === 'object' && obj !== null) || typeof obj === 'function') {
    return typeof obj.then === 'function';
  }

  return false;
}
