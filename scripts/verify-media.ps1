$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$files = @(
    Join-Path $projectRoot 'output\rabbit-carrots-en.mp4'
    Join-Path $projectRoot 'output\rabbit-carrots-hi.mp4'
)

$ffprobePath = & node -e "process.stdout.write(require('@ffprobe-installer/ffprobe').path)"
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $ffprobePath)) {
    throw 'The approved local FFprobe evaluation binary could not be resolved.'
}

$results = foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing expected render: $file"
    }

    $json = & $ffprobePath -v error -show_entries 'format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate' -of json $file
    if ($LASTEXITCODE -ne 0) {
        throw "ffprobe failed for $file"
    }
    $probe = $json | ConvertFrom-Json
    $video = $probe.streams | Where-Object { $_.codec_type -eq 'video' } | Select-Object -First 1

    if ($null -eq $video) { throw "No video stream in $file" }
    if ($video.width -ne 1920 -or $video.height -ne 1080) { throw "Unexpected resolution in $file" }
    if ($video.r_frame_rate -ne '30/1') { throw "Unexpected frame rate in ${file}: $($video.r_frame_rate)" }
    $audioPresent = [bool]($probe.streams | Where-Object { $_.codec_type -eq 'audio' })
    if (-not $audioPresent) { throw "No narration audio stream in $file" }

    [ordered]@{
        file = [IO.Path]::GetFileName($file)
        codec = $video.codec_name
        width = $video.width
        height = $video.height
        frameRate = $video.r_frame_rate
        durationSeconds = [math]::Round([double]$probe.format.duration, 3)
        sizeMiB = [math]::Round([double]$probe.format.size / 1MB, 2)
        audioStreamPresent = $audioPresent
    }
}

$report = [ordered]@{
    expectedAudio = $true
    audioNote = 'ElevenLabs Phase 0 narration and timestamp-derived scene timing are integrated for English and Hindi.'
    videos = @($results)
}
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'output\media-validation.json') -Encoding utf8
$report | ConvertTo-Json -Depth 5
