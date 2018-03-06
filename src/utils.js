export const getIndexFromX = (snaps, x) => {
    let textIndex = 0;
    // Find text index based on x
    snaps.some((snap, index) => {
      textIndex = index;
      return x < snap;
    });
    return textIndex - 1;
};


export const debounce = (func, wait, immediate) => {
  let timeout;
  return args => {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
        func(args);
    }
  };
};