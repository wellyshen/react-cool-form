export default (callback: (args: any) => any): any =>
  (
    window.requestIdleCallback ||
    ((callback) => {
      const start = Date.now();
      return setTimeout(
        () =>
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          }),
        1
      );
    })
  )(callback, { timeout: 2000 });
