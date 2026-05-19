export const CaptureEventType = {
  RECORDING: 'recording',
};

export const CaptureProtection = {
  prevent: () => undefined,
  allow: () => undefined,
  addListener: () => ({
    remove: () => undefined,
  }),
  isScreenRecording: async () => false,
};