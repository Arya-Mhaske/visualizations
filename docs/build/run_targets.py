"""Build tools unattended: one fresh Claude Code session per target in docs/build/targets.txt.

    python docs/build/run_targets.py --list                  what's left, in order
    python docs/build/run_targets.py --count 3 --dry-run     show the next 3 sessions without starting them
    python docs/build/run_targets.py --count 3               build the next 3 targets, then stop
    python docs/build/run_targets.py --count 3 --model opus --effort high

A target is finished when every tool in it has a template, so re-running skips what's done and resumes
what isn't. A line in targets.txt may set its own model and effort, and those beat the flags.

After each session this script checks the result itself: the session succeeded, every tool is live, nothing
is left uncommitted, and the whole test suite passes. It stops at the first failure, so a problem can't
spread through later boxes. Output goes to docs/build/logs/. Sessions can't push, and neither does this.
"""
import argparse
import json
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUILD = ROOT / 'docs/build'
TARGETS = BUILD / 'targets.txt'
PROMPT = BUILD / 'SESSION_PROMPT.md'
LOGS = BUILD / 'logs'
BRANCH = 'build/tools'

COMMANDS = ['python manage.py *', 'DEBUG=False SECRET_KEY=x python manage.py *', 'python docs/build/*', 'git status*', 'git diff*', 'git log*', 'git show*',
            'git add *', 'git commit *', 'git branch --show-current', 'git checkout build/tools', 'node *']
FORBIDDEN = ['git push*', 'git remote*', 'git reset*', 'git rebase*', 'git merge*', 'git clean*', 'rm -rf*']
ALLOWED = [f'{shell}({rule})' for shell in ('Bash', 'PowerShell') for rule in COMMANDS]
DENIED = [f'{shell}({rule})' for shell in ('Bash', 'PowerShell') for rule in FORBIDDEN]


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, encoding='utf-8').stdout.strip()


def read_targets():
    """[(target, model, effort)] from targets.txt, in order. Blanks and # comments are skipped."""
    targets = []
    for line in TARGETS.read_text(encoding='utf-8').splitlines():
        parts = line.split('#')[0].split()
        if parts:
            targets.append((parts[0], parts[1] if len(parts) > 1 else None, parts[2] if len(parts) > 2 else None))
    return targets


def tool_paths(target):
    """Template paths for every tool in a box (subject/box) or a whole subject."""
    subject, _, box = target.partition('/')
    source = ROOT / f'catalogue/data/{subject}.json'
    if not source.exists():
        sys.exit(f'targets.txt: no such subject in "{target}"')
    data = json.loads(source.read_text(encoding='utf-8'))
    boxes = [child for child in data['children'] if not box or child['slug'] == box]
    if not boxes:
        sys.exit(f'targets.txt: no such box "{target}"')
    return [ROOT / 'templates/tools' / subject / child['slug'] / f"{tool['slug']}.html"
            for child in boxes for tool in child['children']]


def missing(target):
    return sum(not path.exists() for path in tool_paths(target))


def build_prompt(target):
    body = PROMPT.read_text(encoding='utf-8').split('\n---\n', 1)[1].lstrip()
    lines = [f'TARGET: {target}' if line.startswith('TARGET:') else line for line in body.splitlines()]
    return '\n'.join(lines) + '\nThis is an unattended session: nobody can answer questions. Log doubts in QUESTIONS.md and carry on.\n'


def command(claude, model, effort, budget):
    args = [claude, '--print', '--model', model, '--effort', effort, '--permission-mode', 'acceptEdits',
            '--allowedTools', ','.join(ALLOWED), '--disallowedTools', ','.join(DENIED)]
    return args + ['--max-budget-usd', str(budget)] if budget else args


def preflight():
    if git('branch', '--show-current') != BRANCH:
        sys.exit(f'Switch to {BRANCH} first.')
    if git('status', '--porcelain'):
        sys.exit('Uncommitted changes. Commit or stash them first, so no session sweeps them into a box commit.')


def verify(target):
    """Problems with a finished session, checked here and not taken from its report."""
    problems = []
    if missing(target):
        problems.append(f'{missing(target)} tools still have no template')
    if git('status', '--porcelain'):
        problems.append('the session left uncommitted changes')
    if git('branch', '--show-current') != BRANCH:
        problems.append(f'the session left {BRANCH}')
    tests = subprocess.run([sys.executable, 'manage.py', 'test'], cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if tests.returncode:
        problems.append('python manage.py test fails')
    return problems


def run(target, model, effort, budget, claude):
    LOGS.mkdir(exist_ok=True)
    stamp = datetime.now().strftime('%Y%m%d-%H%M')
    log = LOGS / f"{stamp}-{target.replace('/', '-')}.log"
    start = time.time()
    with log.open('w', encoding='utf-8') as out:
        session = subprocess.run(command(claude, model, effort, budget), cwd=ROOT, input=build_prompt(target),
                                 stdout=out, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
    print(f'  finished in {(time.time() - start) / 60:.0f} min, log: {log.relative_to(ROOT)}', flush=True)
    problems = [f'session exited with code {session.returncode}'] if session.returncode else []
    return problems + verify(target)


def main():
    parser = argparse.ArgumentParser(description='One fresh Claude Code session per target.')
    parser.add_argument('--count', type=int, default=1, help='targets to finish before stopping (default 1)')
    parser.add_argument('--model', default='sonnet', help='model for lines that set none (default sonnet)')
    parser.add_argument('--effort', default='medium', help='effort for lines that set none (default medium)')
    parser.add_argument('--budget', type=float, help='dollar limit per session, for API billing')
    parser.add_argument('--list', action='store_true', help='show remaining targets and exit')
    parser.add_argument('--dry-run', action='store_true', help='show what would run and exit')
    options = parser.parse_args()

    todo = [item for item in read_targets() if missing(item[0])]
    if options.list:
        for target, model, effort in todo:
            print(f'{target:<62} {missing(target):>3} tools  {model or options.model} {effort or options.effort}')
        print(f'{len(todo)} targets, {sum(missing(item[0]) for item in todo)} tools left')
        return
    batch = todo[:options.count]
    if not batch:
        print('Nothing left to build.')
        return
    if options.dry_run:
        for target, model, effort in batch:
            print(f'would build {target} with {model or options.model} at {effort or options.effort} effort')
        print('\nPrompt for the first one:\n\n' + build_prompt(batch[0][0]))
        return

    claude = shutil.which('claude')
    if not claude:
        sys.exit('Claude Code is not on PATH.')
    preflight()
    for index, (target, model, effort) in enumerate(batch, 1):
        model, effort = model or options.model, effort or options.effort
        print(f'[{index}/{len(batch)}] {target} ({model}, {effort})', flush=True)
        problems = run(target, model, effort, options.budget, claude)
        if problems:
            print(f'STOPPED at {target}:')
            for problem in problems:
                print(f'  - {problem}')
            print('Fix or finish it, commit, then run this again. It resumes from what is left.')
            sys.exit(1)
        print('  verified', flush=True)
    print(f'Done: {len(batch)} targets built and verified. Nothing has been pushed.')


if __name__ == '__main__':
    main()
