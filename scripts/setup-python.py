"""Install private learning runtimes without replacing the user's Python."""
import argparse
import hashlib
import json
from pathlib import Path
import os
import shutil
import subprocess
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / '.runtime'

def run(*args):
    print('$', *map(str, args), flush=True)
    subprocess.run(list(map(str, args)), check=True)

def setup():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--python-only', action='store_true')
    args = parser.parse_args()
    RUNTIME.mkdir(exist_ok=True)
    if os.name == 'nt':
        python315 = RUNTIME / 'python315' / 'python.exe'
        if not python315.exists():
            # This is the same complete runtime archive advertised to Python Install Manager.
            manifest_url = 'https://www.python.org/ftp/python/3.15.0/windows-3.15.0.json'
            with urllib.request.urlopen(manifest_url, timeout=60) as response:
                manifest = json.load(response)
            release = next(v for v in manifest['versions'] if v['id'] == 'pythoncore-3.15-64')
            url = release['url']
            if not url.startswith('https://www.python.org/ftp/python/3.15.0/'):
                raise RuntimeError('Unexpected Python archive source; no download performed.')
            archive = RUNTIME / 'python315.zip'
            print('Downloading official Python 3.15 runtime:', url, flush=True)
            urllib.request.urlretrieve(url, archive)
            digest = hashlib.sha256(archive.read_bytes()).hexdigest()
            if digest != release['hash']['sha256']:
                raise RuntimeError('Python archive checksum mismatch; archive was not executed.')
            destination = RUNTIME / 'python315'
            with zipfile.ZipFile(archive) as package:
                for name in package.namelist():
                    target = (destination / name).resolve()
                    if not target.is_relative_to(destination.resolve()):
                        raise RuntimeError('Unexpected archive path.')
                package.extractall(destination)
    else:
        python315 = Path(os.environ.get('PYTHON315', 'python3.15'))
    run(python315, '--version')
    pyenv = ROOT / '.venv-python'
    pyexe = pyenv / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not pyexe.exists():
        run(python315, '-m', 'venv', pyenv)
    run(pyexe, '-m', 'pip', 'install', 'ruff==0.17.1')
    config = {'python': str(pyexe), 'ml': None}
    config_path = RUNTIME / 'runtimes.json'
    if config_path.exists():
        config['ml'] = json.loads(config_path.read_text(encoding='utf-8')).get('ml')
    config_path.write_text(json.dumps(config, indent=2), encoding='utf-8')
    if not args.python_only:
        mlenv = ROOT / '.venv-ml'
        mlexe = mlenv / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
        bootstrap = os.environ.get('PYTHON_ML_BOOTSTRAP', sys.executable)
        if not os.environ.get('PYTHON_ML_BOOTSTRAP') and sys.version_info[:2] != (3, 14):
            if os.name == 'nt':
                candidate = subprocess.run(['py', '-3.14', '-c', 'import sys; print(sys.executable)'], capture_output=True, text=True)
                bootstrap = candidate.stdout.strip() if candidate.returncode == 0 else None
            else:
                bootstrap = shutil.which('python3.14')
            if not bootstrap:
                raise RuntimeError('ML lessons require a supported Python 3.14 installation. Set PYTHON_ML_BOOTSTRAP to its executable; the Python 3.15 track is already ready.')
        if not mlexe.exists():
            run(bootstrap, '-m', 'venv', mlenv)
        run(mlexe, '-m', 'pip', 'install', 'torch==2.14.0', '--index-url', 'https://download.pytorch.org/whl/cpu')
        run(mlexe, '-m', 'pip', 'install', '-r', ROOT / 'requirements-ml.txt')
        config['ml'] = str(mlexe)
        config_path.write_text(json.dumps(config, indent=2), encoding='utf-8')
        with (RUNTIME / 'ml-resolved.txt').open('w', encoding='utf-8') as output:
            subprocess.run([str(mlexe), '-m', 'pip', 'freeze'], stdout=output, check=True)
    print('Private runtimes ready. Your system Python and PATH are unchanged.', flush=True)

if __name__ == '__main__':
    setup()
