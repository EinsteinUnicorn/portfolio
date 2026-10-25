#!/usr/bin/env python3
"""Build portable HTML deliverables. No dependencies, server, or network needed."""
from pathlib import Path
import argparse
import base64
import json
import mimetypes
import re

ROOT = Path(__file__).resolve().parent.parent

def data_url(path):
    file = ROOT / path
    mime = mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
    return 'data:' + mime + ';base64,' + base64.b64encode(file.read_bytes()).decode()

def bundle(filename):
    html = (ROOT / filename).read_text()
    html = re.sub(r'<link[^>]*href="([^"]+\.css)"[^>]*>', lambda m: '<style>\n' + (ROOT / m[1]).read_text() + '\n</style>', html)
    scripts = []
    def script(match):
        path = match[1]
        content = (ROOT / path).read_text().replace('</script', '<\\/script')
        identity = ' id="portfolio-config"' if path == 'portfolio.config.js' else ''
        scripts.append('<script' + identity + '>\n' + content + '\n</script>')
        return ''
    html = re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>', script, html)
    html = re.sub(r'"(assets/[^\"]+)"', lambda m: '"' + data_url(m[1]) + '"', html)
    html = html.replace('</body>', '\n'.join(scripts) + '\n</body>')
    return html

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    portfolio = bundle('index.html')
    studio = bundle('studio.html')
    template = '<script>window.PORTFOLIO_TEMPLATE = ' + json.dumps(portfolio).replace('<', '\\u003c') + ';</script>'
    studio = studio.replace('<script id="portfolio-config">', template + '\n<script id="portfolio-config">')
    (args.output / 'becky-button-portfolio.html').write_text(portfolio)
    (args.output / 'portfolio-design-studio.html').write_text(studio)
    print('Built portfolio and design studio in', args.output.resolve())

if __name__ == '__main__':
    main()
