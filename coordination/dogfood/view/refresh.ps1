# Run from any directory: & <path-to-oasis>/coordination/dogfood/view/refresh.ps1
$ErrorActionPreference = 'Stop'
$repository = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path

try {
    if (-not (Get-Command git -CommandType Application -ErrorAction SilentlyContinue)) {
        throw 'Git was not found. Install Git and reopen PowerShell, then try again.'
    }

    $python = $null
    $pythonPrefix = @()
    foreach ($candidate in @(
        @{ Name = 'python'; Prefix = @() },
        @{ Name = 'python3'; Prefix = @() },
        @{ Name = 'py'; Prefix = @('-3') }
    )) {
        $command = Get-Command $candidate.Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $command) { continue }
        $prefix = $candidate.Prefix
        try {
            & $command.Source @prefix -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)' 2>$null
            if ($LASTEXITCODE -eq 0) {
                $python = $command.Source
                $pythonPrefix = $prefix
                break
            }
        } catch {
            # A missing runtime or Windows app alias may exist on PATH; try the next name.
        }
    }
    if (-not $python) {
        throw 'Python 3.8+ was not found. Install Python 3 with PATH enabled, reopen PowerShell, then try again.'
    }

    & git -C $repository pull --ff-only
    if ($LASTEXITCODE -ne 0) {
        throw 'Git pull failed. Resolve the Git error above, then rerun this script. The page was not regenerated or opened.'
    }

    & $python @pythonPrefix (Join-Path $PSScriptRoot 'export.py') --root $repository
    if ($LASTEXITCODE -ne 0) {
        throw 'Export failed. The page was not opened; any existing oasis.html may be out of date.'
    }
    Invoke-Item -LiteralPath (Join-Path $repository 'oasis.html')
} catch {
    Write-Error $_
    exit 1
}
