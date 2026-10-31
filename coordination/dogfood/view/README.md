# Open the objective tree

The page is a local snapshot of every `objective.md` in the repository. Regenerate it after changes. Source and evidence links point to GitHub; sign in there to read private files.

## Windows PowerShell

Prerequisites: Git, Python 3.8 or newer, and a local checkout with an upstream branch.

From the Oasis repository root, download the helper once:

```powershell
git pull --ff-only
```

Then update, regenerate, and open the page with one command:

```powershell
& .\coordination\dogfood\view\refresh.ps1
```

The helper checks `python`, `python3`, and `py -3`, pulls the current branch with `--ff-only`, runs the exporter, and opens `oasis.html` in your default browser. It stops if a prerequisite, pull, or export fails. It does not install software or change PowerShell policy. If your machine blocks PowerShell scripts, use the manual steps below, running each only after the previous step succeeds.

## Manual steps

From the repository root:

```powershell
git pull --ff-only
python coordination/dogfood/view/export.py
Invoke-Item .\oasis.html
```

If `python` is unavailable, use `python3` or `py -3`. If none works, install Python 3 and enable its PATH option, then reopen your terminal.

On Linux or macOS, run `python3 coordination/dogfood/view/export.py`, then open `oasis.html` in a browser.

## Verify the exporter

```text
python -m unittest discover -s coordination/dogfood/view -p "test_*.py"
```

The tests use only Python's standard library. They cover nesting, source links, escaped text, attention sections, and failure cases. The PowerShell helper still needs a Windows end-to-end check; these tests exercise the Python exporter.
