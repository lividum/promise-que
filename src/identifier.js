let count = 0;

export default {
  increment: () => {
    count += 1;
    return count;
  },
  clear: () => {
    count = 0;
  },
};
