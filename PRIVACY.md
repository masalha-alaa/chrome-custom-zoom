# Privacy Policy — Chrome Custom Zoom

Last updated: October 1, 2026

Chrome Custom Zoom is developed by Alaa Masalha. Its single purpose is to control Chrome's native page zoom through an exact percentage, adjustable step size, and saved presets.

## Information handled by the extension

The extension processes the active tab's numeric ID, current zoom factor, and default zoom factor in memory to display and change zoom. It does not read website content, tab URLs or titles, browsing history, cookies, passwords, or personal communications.

It saves only the following preferences in `chrome.storage.local` on your device:

- `zoomStep`: your chosen number of percentage points per click.
- `zoomPresets`: up to five saved zoom percentages.

These preferences are used only to provide the zoom controls. The extension does not create accounts, identify users, record a history of actions, or include advertising, analytics, or telemetry. It does not transmit, sell, or share your preferences or other user data with the developer or third parties. It does not use `chrome.storage.sync`.

## Chrome's zoom settings

The extension calls Chrome's native zoom APIs. Under Chrome's normal settings, Chrome remembers zoom for a site's origin and may apply it to other tabs on the same origin. Chrome manages those browser settings separately. The extension does not store site addresses or control Chrome's own account, synchronization, or privacy settings.

## Permissions and executable code

The only requested permission is `storage`, used for the two preferences above. The extension does not request host, browsing-history, `tabs`, or `activeTab` permissions, and does not inject scripts into websites. It obtains a tab ID and adjusts zoom using the parts of Chrome's Tabs API that do not require those permissions.

All executable extension code is included in the package. The extension makes no network requests and does not download or execute remote JavaScript or WebAssembly.

## Retention and deletion

Preferences remain in your local Chrome profile until you change or delete them or uninstall the extension. Clicking a preset's filled star removes it from saved storage immediately; the row remains visible in the current popup until it closes. Uninstalling removes the extension's local storage.

Site zoom settings are owned by Chrome and may remain after uninstalling. Use Reset before uninstalling, or manage saved zoom levels in Chrome's settings. The developer has no copy of your local preferences to retrieve or delete.

## Website and support

The project website contains no analytics or tracking scripts. When you visit the public GitHub repository, GitHub Pages website, or submit a support issue, GitHub may process ordinary connection information and any content you choose to provide under [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). These visits are separate from the extension's local operation. GitHub issues are public; do not include confidential information.

## Limited Use

Chrome Custom Zoom uses information received from Google APIs solely to provide its disclosed zoom controls and complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. It does not sell data, use data for advertising or credit decisions, or transfer data for unrelated purposes.

## Changes and contact

This policy will be updated if the extension's data handling changes. Questions and privacy requests can be submitted through the [project issue tracker](https://github.com/masalha-alaa/chrome-custom-zoom/issues).
