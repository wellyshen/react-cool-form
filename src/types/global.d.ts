declare const __DEV__: boolean;

interface RequestIdleCallback {
  (deadline: {
    readonly didTimeout: boolean;
    timeRemaining: () => number;
  }): void;
}

interface Window {
  requestIdleCallback: (
    callback: RequestIdleCallback,
    options?: { timeout: number }
  ) => any;
  cancelIdleCallback: (handle: any) => void;
}
