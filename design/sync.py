#!/usr/bin/env python3
"""Vendor a reviewed canonical design bundle from an explicit local app checkout."""
import argparse
from pathlib import Path
import shutil
import subprocess
import sys

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('app_repository', type=Path)
args = parser.parse_args()
source = args.app_repository.resolve()
target = Path(__file__).resolve().parent.parent
if source == target:
    sys.exit('Source and destination must differ')
if not (source / 'chordlist.icon/Assets/progressions.svg').is_file():
    sys.exit('Source is not the canonical chordlist app checkout')
subprocess.run([sys.executable, str(source / 'design/build.py'), '--check'], check=True)
files = ['DESIGN.md', 'docs/design-audit.md'] + ['design/' + name for name in
         ['tokens.json', 'mark.json', 'build.py', 'sync.py', 'core.css', 'mark.svg', 'generated.ts', 'manifest.json']]
for name in files:
    destination = target / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source / name, destination)
subprocess.run([sys.executable, str(target / 'design/build.py'), '--check'], check=True)
print('Synced design bundle. Review and commit the diff; no network access was used.')
