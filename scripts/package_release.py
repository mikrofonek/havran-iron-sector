"""Build runnable HAVRAN 5.3 downloads from this checkout."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
VARIANTS = ('iron-sector', 'havran-apple-silicon')


def files_in(folder):
    return {p.relative_to(ROOT).as_posix(): p.read_bytes()
            for p in (ROOT / folder).rglob('*')
            if p.is_file() and '.DS_Store' != p.name and '__pycache__' not in p.parts}


def archive(name, files):
    target = OUT / name
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
        for path, content in sorted(files.items()):
            output.writestr(path, content)
    with zipfile.ZipFile(target) as check:
        assert check.testzip() is None
        for path in check.namelist():
            if not path.endswith('index.html'):
                continue
            for source in re.findall(r'<script[^>]+src="([^"]+)"', check.read(path).decode()):
                assert str(Path(path).parent / source.split('?')[0]) in files, source
    print(f'Built {name} ({target.stat().st_size} bytes)')


def main():
    OUT.mkdir(exist_ok=True)
    common = {name: (ROOT / name).read_bytes() for name in ('LICENSE', 'README.md', 'README.en.md')}
    campaign = dict(common)
    campaign['index.html'] = (ROOT / 'index.html').read_bytes()
    campaign['index-en.html'] = (ROOT / 'index-en.html').read_bytes()
    campaign.update(files_in('media'))
    campaign.update(files_in('docs'))
    for folder, label in zip(VARIANTS, ('classic', 'gpu')):
        game = files_in(folder)
        archive(f'havran-5-3-{label}.zip', {**common, **game})
        campaign.update(game)
    archive('havran-5-3-kampan.zip', campaign)
    demo = {str(Path(name).relative_to('havran-5-3-demo')): data
            for name, data in files_in('havran-5-3-demo').items()}
    demo['LICENSE'] = common['LICENSE']
    archive('havran-5-3-demo-html5.zip', demo)
    complete = {**campaign, **files_in('havran-5-3-demo'), **files_in('havran-tests-5-3'),
                **files_in('scripts'), 'CHANGELOG.md': (ROOT / 'CHANGELOG.md').read_bytes()}
    archive('havran-5-3-komplet.zip', complete)
    sums = []
    for name in ('classic', 'gpu', 'kampan', 'demo-html5', 'komplet'):
        filename = f'havran-5-3-{name}.zip'
        sums.append(hashlib.sha256((OUT / filename).read_bytes()).hexdigest() + '  ' + filename)
    (OUT / 'SHA256SUMS.txt').write_text('\n'.join(sums) + '\n')


if __name__ == '__main__':
    main()
