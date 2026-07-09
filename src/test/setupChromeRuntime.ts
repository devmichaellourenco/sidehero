Object.assign(globalThis, {
  chrome: {
    runtime: {
      id: 'test-extension',
      getURL: (path: string) => `chrome-extension://test/${path}`,
    },
  },
});
