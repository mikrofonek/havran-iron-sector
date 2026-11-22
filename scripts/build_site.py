"""Collect only publicly served game files for GitHub Pages."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / '_site'
SITE.mkdir(exist_ok=True)
for name in ('iron-sector', 'havran-apple-silicon', 'havran-5-3-demo', 'media'):
    shutil.copytree(ROOT / name, SITE / name, dirs_exist_ok=True)
shutil.copyfile(ROOT / 'index.html', SITE / 'index.html')
shutil.copyfile(ROOT / 'index-en.html', SITE / 'index-en.html')
(SITE / '.nojekyll').write_text('')
print('Static game ready in _site/')
