export default (callback: (args: any) => any): any =>
  (
    window.requestIdleCallback ||
    ((cb) => {
      const start = Date.now();
      return setTimeout(
        () =>
          cb({
            didTimeout: false,
            timeRemaining: /* istanbul ignore next */ () =>
              Math.max(0, 50 - (Date.now() - start)),
          }),
        1
      );
    })
  )(callback, { timeout: 2000 });
