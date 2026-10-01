# Chrome Web Store submission — Chrome Custom Zoom 1.1.1

Audit date: October 1, 2026. Compared the current `master` source of `masalha-alaa/chrome-custom-zoom` (58f99c63) with `masalha-alaa/chatbot-direction-control` (9bca2fbc). This is a source/package audit, not a Google approval or inspection of the publisher dashboard.

## Result

The repository had the core extension, an MIT license, and valid icons, but lacked the privacy and listing materials prepared here. Its README incorrectly advertised decimal input and did not document presets. The new submission assets cover those gaps. Complete the account/listing fields and a real Chrome install check before submitting; Google makes the approval decision.

| Item | Store requirement | Custom Zoom before audit | Chatbot Direction Control | Result in this branch |
| --- | --- | --- | --- | --- |
| Manifest, name, version, short description | Required | Manifest V3; 1.1.0 | Manifest V3 | 1.1.1; updated 95-character description and repository homepage |
| Minimum permissions | Required | Only `storage` | `storage` plus content scripts on supported chatbot sites | Retained only `storage`; no runtime changes |
| Package without remote executable code | Required for this MV3 extension | Local JS/CSS; no remote code | Local executable code | Verified; runtime-only ZIP builder added |
| Icons | 128px PNG required; smaller sizes useful | 16, 32, 48, 128px PNGs | Icons supplied | Existing icons retained and dimensions checked |
| README | Recommended, not a Store submission field | Outdated | Detailed README | Updated for whole numbers, presets, privacy, packaging, and support |
| License | Not a Store submission requirement | MIT | MIT | Existing MIT license retained |
| Privacy policy | Required when handling user data, including locally handled data | Missing | `docs/privacy.html` | `PRIVACY.md` and matching `docs/privacy.html` added |
| Website/support | Website is optional; public policy URL must be accessible | No website source | `docs/` website | Responsive website added; GitHub Issues available; Pages activation remains |
| Screenshot | At least one required | Missing | Four chatbot screenshots plus settings capture | Two 1280×800 PNGs added |
| Small promo | Required | Missing | 440×280 assets | 440×280 PNG added |
| Marquee | Optional | Missing | 1400×560 asset | 1400×560 PNG added |
| Listing description/privacy declarations | Required in dashboard | Missing from repo | Listing linked from README | Copy-ready fields below |
| Developer account and distribution | Dashboard requirements | Not inspected | Existing extension is not proof of current account eligibility | Publisher must confirm |

## Upload package

Build with Python 3.9 or newer:

```sh
python3 tools/build_release.py
```

Windows alternative: `py tools/build_release.py`.

Upload **`dist/chrome-custom-zoom-1.1.1.zip`**. The ZIP contains `manifest.json` at its root, `popup.html`, `popup.css`, `popup.js`, the four icons, and `LICENSE`. Documentation, screenshots, source tools, and development files are excluded. Do not upload the outer submission-kit ZIP as the extension package.

Version 1.1.1 changes listing metadata only. The production popup files and permissions are byte-for-byte identical to the audited upstream source. If this version was already uploaded to your Store draft, use a higher version before another upload.

## Listing fields

- **Name:** Chrome Custom Zoom (from the manifest).
- **Short description:** Set exact page zoom, choose your own zoom step, and save up to five presets in a compact popup.
- **Detailed description:** Copy `store/description.txt`.
- **Category suggestion:** Productivity → Tools, if this category is offered in your dashboard.
- **Language:** English.
- **Support URL:** https://github.com/masalha-alaa/chrome-custom-zoom/issues
- **Website available now:** https://github.com/masalha-alaa/chrome-custom-zoom
- **Privacy policy available on this branch:** https://github.com/masalha-alaa/chrome-custom-zoom/blob/feature/web-store-preparation/PRIVACY.md
- **Privacy URL after merge to master:** https://github.com/masalha-alaa/chrome-custom-zoom/blob/master/PRIVACY.md

A custom domain is unnecessary. The public GitHub privacy document provides an accessible policy URL without a separate hosting service. Keep the branch if you use its URL; after merging, prefer the stable master URL or the published website URL.

### Website publication

GitHub reports `has_pages: false` for this repository. The connector used for this work cannot enable repository Pages settings. Website source is ready in `docs/`; no hosted website is claimed.

After merging through `develop` to `master`, enable **Settings → Pages → Deploy from a branch → master → /docs**. Then check that these pages load publicly before using their URLs in the listing:

- https://masalha-alaa.github.io/chrome-custom-zoom/
- https://masalha-alaa.github.io/chrome-custom-zoom/privacy.html

Once the extension is approved, replace the website's “Get the extension” repository link with its actual Chrome Web Store URL. No unpublished Store ID has been invented.

## Privacy practices — copy-ready fields

### Single purpose

Allow users to control Chrome's native page zoom with an exact percentage, an adjustable zoom step, and up to five locally saved zoom presets.

### `storage` permission justification

The storage permission saves the user's chosen zoom step and up to five preset zoom percentages in chrome.storage.local so those preferences remain available when the popup is reopened. These values are stored only on the user's device. The extension does not use Chrome Sync, store website addresses or browsing history, or transmit data to the developer or external servers.

### Remote code

Select **No, I am not using remote code**. All executable code is bundled with the extension; it makes no network requests.

### Data usage

For this source version, none of the dashboard's sensitive-data collection categories apply: it does not collect personally identifiable, health, financial, authentication, communication, location, browsing-history, website-content, or activity-log data. Local numeric preferences and the temporary tab ID/zoom state are explicitly disclosed in the privacy policy. Do not omit the policy merely because nothing is sent to a server.

The three data-use certifications are supported by this implementation: no selling/transferring user data outside approved uses; no unrelated use/transfer; no use/transfer for creditworthiness or lending. Recheck the declarations if code or services change.

### Optional reviewer notes

No login, subscription, API key, or account is needed. Open a regular website, then open the toolbar popup. Enter a whole-number zoom between 25 and 500 and press Enter. Use − / + with the configured step. Save a zoom with its star; up to five presets are sorted automatically. Click a saved percentage to apply it. Unstar a preset, close the popup, and reopen it to see the row removed. Reset uses Chrome's configured default zoom, which may differ from 100%. Internal or restricted browser pages may reject zoom changes.

## Listing images

| Upload field | File | Dimensions |
| --- | --- | --- |
| Store icon | `icons/zoom-128.png` | 128×128 RGBA PNG |
| Screenshot 1 | `store/assets/screenshot-01-1280x800.png` | 1280×800 RGB PNG |
| Screenshot 2 | `store/assets/screenshot-02-1280x800.png` | 1280×800 RGB PNG |
| Small promotional tile | `store/assets/small-promo-440x280.png` | 440×280 RGB PNG |
| Optional marquee | `store/assets/marquee-1400x560.png` | 1400×560 RGB PNG |

Screenshots show the actual production popup HTML/CSS/JS rendered with fixed, simulated Chrome API data; the interface is enlarged and labeled accordingly. They are not screen captures of an installed extension in Chrome's toolbar. They introduce no extra features or fabricated browser UI. A native Chrome capture may also be supplied after the final install check.

Development asset generation: install Playwright in your development environment, then run `node tools/generate_store_assets.cjs`. `CHROMIUM_PATH` can select a local browser executable. The generator and Playwright are not extension dependencies and are not packaged.

## Validation performed

- Parsed Manifest V3; checked the description length, referenced files, icon formats/dimensions, and narrow permission set.
- JavaScript syntax check passed. Source review found no external executable code, networking, content scripts, tracking, or unnecessary access.
- Browser checks using the real popup code with simulated Chrome APIs passed for exact zoom, custom steps, decimal/range errors, boundary buttons, ascending presets, the five-preset limit, preset application, immediate saved-data removal with deferred visual removal, persistence, and Reset to a 125% default.
- Website and privacy page rendered at 1280px and 375px widths with working images and no horizontal overflow. Listing images were visually inspected.
- Built and inspected the upload ZIP; manifest is at root, runtime assets are complete, and store/development assets are excluded.

The available browser is a headless build that cannot load this unpacked extension. Full installed-extension testing, the publisher dashboard, and Google review remain outside these checks.

## Remaining submission checks

- Merge the preparation branch through the repository's normal `develop` → `master` flow, or deliberately submit the reviewed branch package.
- Load the final ZIP's extracted contents in Chrome and check zoom, presets, persistence, default Reset, and a restricted page.
- Confirm your registered publisher account, verified contact email, two-step verification, and accurate trader/non-trader status (including any required verification). The existing published extension may mean these are already complete; they were not inspected here.
- Upload the inner extension ZIP and listing images; fill the description and privacy fields above; choose distribution countries and visibility, then submit for review.
- If using GitHub Pages URLs, enable Pages and verify them first. The public GitHub policy URL is an alternative.

## Official references checked

- [Prepare your extension](https://developer.chrome.com/docs/webstore/prepare)
- [Required icons, promotional images, and screenshots](https://developer.chrome.com/docs/webstore/images)
- [Privacy fields and permission justifications](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
- [User data FAQ, including local data handling](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Tabs API permissions and zoom behavior](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Developer account setup](https://developer.chrome.com/docs/webstore/set-up-account)
- [Two-step verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification)
- [Trader/non-trader disclosure](https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure)
