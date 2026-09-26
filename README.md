# Chrome Custom Zoom

A compact Chrome-style zoom popup with an editable percentage. It uses Chrome's actual page zoom, so the value persists for the site's origin under Chrome's default zoom settings.

## Install

1. Download the repository and open `chrome://extensions` in Chrome.
2. Enable **Developer mode**, click **Load unpacked**, and select the folder containing `manifest.json`.

Click the extension icon, type a zoom percentage from **25% to 500%** (up to two decimal places), and press **Enter** or click elsewhere in the popup. **−** and **+** move to Chrome's usual preset levels; **Reset** restores the browser's configured default zoom for that tab.

Chrome does not allow extensions to zoom some internal and restricted pages. The extension asks for no permissions, accesses no page content, and sends no data anywhere.

## License

MIT. See [LICENSE](LICENSE).
