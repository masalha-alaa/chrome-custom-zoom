#!/usr/bin/env python3
"""Build a runtime-only, reproducible Chrome Web Store upload ZIP (stdlib only)."""
import json
from pathlib import Path
import re
import struct
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]


def main():
    manifest = json.loads((ROOT / 'manifest.json').read_text(encoding='utf-8'))
    assert manifest['manifest_version'] == 3, 'Manifest V3 is required'
    version = manifest['version']
    assert re.fullmatch(r'(0|[1-9]\d{0,4})(\.(0|[1-9]\d{0,4})){0,3}', version), 'Invalid version'
    assert all(int(p) <= 65535 for p in version.split('.')) and any(int(p) for p in version.split('.'))
    assert 0 < len(manifest['description']) <= 132, 'Description must fit 132 characters'
    assert manifest['permissions'] == ['storage'], 'Review privacy declarations if permissions change'
    assert not any(manifest.get(k) for k in ('host_permissions', 'content_scripts', 'optional_permissions', 'optional_host_permissions')), 'Review new access before packaging'
    files = {'manifest.json', 'popup.html', 'popup.css', 'popup.js', 'LICENSE'}
    assert manifest['action']['default_popup'] == 'popup.html'
    for icon_map in (manifest['icons'], manifest['action']['default_icon']):
        for size, name in icon_map.items():
            path = ROOT / name
            assert path.resolve().is_relative_to(ROOT), 'Icon path must stay inside repository'
            data = path.read_bytes()
            assert data[:8] == b'\x89PNG\r\n\x1a\n', f'{name} must be PNG'
            assert struct.unpack('>II', data[16:24]) == (int(size), int(size)), f'Wrong icon dimensions: {name}'
            files.add(name)
    assert '128' in manifest['icons'], '128px store icon is required'
    output = ROOT / 'dist' / f'chrome-custom-zoom-{version}.zip'
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
        for name in sorted(files):
            info = ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, (ROOT / name).read_bytes())
    with ZipFile(output) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == files
    print(f'{output} ({output.stat().st_size} bytes, {len(files)} files)')


if __name__ == '__main__':
    main()
