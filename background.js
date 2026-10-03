chrome.runtime.onInstalled.addListener(async () => {
  try {
    const stored = await chrome.storage.local.get('fontSizeEnabled');

    if (stored.fontSizeEnabled !== true) {
      await Promise.all([
        chrome.fontSettings.clearDefaultFontSize(),
        chrome.fontSettings.clearMinimumFontSize()
      ]);

      await chrome.storage.local.set({ fontSizeEnabled: false });
    }
  } catch (error) {
    console.error(error?.message ?? error);
  }
});
