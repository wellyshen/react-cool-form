window.requestIdleCallback =
  window.requestIdleCallback ||
  ((callback: RequestIdleCallback) => {
    const start = Date.now();
    return setTimeout(
      () =>
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        }),
      1
    );
  });

export default (callback: () => any): void =>
  window.requestIdleCallback(callback, { timeout: 2000 });
