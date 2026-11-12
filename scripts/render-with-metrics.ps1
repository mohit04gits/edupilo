$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot 'output'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Get-DescendantProcessIds {
    param([int]$RootProcessId)

    $allProcesses = Get-CimInstance Win32_Process
    $descendants = [System.Collections.Generic.HashSet[int]]::new()
    $frontier = [System.Collections.Generic.Queue[int]]::new()
    $frontier.Enqueue($RootProcessId)
    [void]$descendants.Add($RootProcessId)

    while ($frontier.Count -gt 0) {
        $parentId = $frontier.Dequeue()
        foreach ($child in $allProcesses | Where-Object { $_.ParentProcessId -eq $parentId }) {
            if ($descendants.Add([int]$child.ProcessId)) {
                $frontier.Enqueue([int]$child.ProcessId)
            }
        }
    }

    return $descendants
}

function Invoke-MeasuredRender {
    param(
        [string]$ScriptName,
        [string]$OutputFile
    )

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $process = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', $ScriptName) -WorkingDirectory $projectRoot -NoNewWindow -PassThru
    $peakWorkingSetBytes = 0L

    while (-not $process.HasExited) {
        try {
            $ids = Get-DescendantProcessIds -RootProcessId $process.Id
            $workingSet = 0L
            foreach ($id in $ids) {
                $tracked = Get-Process -Id $id -ErrorAction SilentlyContinue
                if ($null -ne $tracked) {
                    $workingSet += [long]$tracked.WorkingSet64
                }
            }
            if ($workingSet -gt $peakWorkingSetBytes) {
                $peakWorkingSetBytes = $workingSet
            }
        } catch {
            Write-Verbose "RAM sample skipped: $($_.Exception.Message)"
        }
        Start-Sleep -Milliseconds 500
        $process.Refresh()
    }

    $process.WaitForExit()
    $stopwatch.Stop()

    $expectedOutputPath = Join-Path $projectRoot $OutputFile
    if (($null -ne $process.ExitCode) -and ($process.ExitCode -ne 0)) {
        throw "Render script '$ScriptName' failed with exit code $($process.ExitCode)."
    }
    if (-not (Test-Path -LiteralPath $expectedOutputPath)) {
        throw "Render script '$ScriptName' did not create the expected output '$OutputFile'."
    }

    $file = Get-Item -LiteralPath $expectedOutputPath
    return [ordered]@{
        script = $ScriptName
        output = $OutputFile
        durationSeconds = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)
        peakProcessTreeRamMiB = [math]::Round($peakWorkingSetBytes / 1MB, 2)
        outputSizeMiB = [math]::Round($file.Length / 1MB, 2)
        measuredAtUtc = [DateTime]::UtcNow.ToString('o')
    }
}

Push-Location $projectRoot
try {
    $results = @(
        Invoke-MeasuredRender -ScriptName 'render:english' -OutputFile 'output/rabbit-carrots-en.mp4'
        Invoke-MeasuredRender -ScriptName 'render:hindi' -OutputFile 'output/rabbit-carrots-hi.mp4'
    )

    $metrics = [ordered]@{
        profile = [ordered]@{width = 1920; height = 1080; fps = 30; concurrency = 1}
        note = 'Peak RAM is the sampled working-set sum of npm and observed descendant processes.'
        renders = $results
    }
    $metrics | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $outputDir 'render-metrics.json') -Encoding utf8
    $metrics | ConvertTo-Json -Depth 6
} finally {
    Pop-Location
}
