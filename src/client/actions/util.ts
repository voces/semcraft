export const newCooldown = (cooldown: number) => {
  let last = -Infinity;
  return () => {
    const now = Date.now();
    if (now - last < cooldown) return true;
    last = now;
    return false;
  };
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const newThrottle = (cooldown: number) => {
  let last = -Infinity;
  let next = false;
  return async () => {
    const now = Date.now();
    if (now - last < cooldown) {
      if (next) return true;
      next = true;
      await sleep(now + cooldown - last);
      next = false;
    }
    last = now;
    return false;
  };
};
