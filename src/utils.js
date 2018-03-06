export const getIndexFromX = (snaps, x) => {
    let textIndex = 0;
    // Find text index based on x
    snaps.some((snap, index) => {
      textIndex = index;
      return x < snap;
    });
    return textIndex - 1;
};