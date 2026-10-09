$ErrorActionPreference = 'Stop'
$taskHtml = Get-Content -LiteralPath (Join-Path $PSScriptRoot '表格续填预览.html') -Raw -Encoding UTF8
$taskStyle = [regex]::Match($taskHtml,'<style>.*?</style>',[System.Text.RegularExpressions.RegexOptions]::Singleline).Value
foreach ($taskTableNumber in @(4,5)) {
    $taskTable = [regex]::Match($taskHtml,"<table[^>]*data-path=`"/body/table\[$taskTableNumber\]`"[^>]*>.*?</table>",[System.Text.RegularExpressions.RegexOptions]::Singleline).Value
    if (-not $taskTable) {throw '预览表格未找到'}
    $taskRows = [regex]::Matches($taskTable,'<tr\b.*?</tr>',[System.Text.RegularExpressions.RegexOptions]::Singleline)
    $taskPrefix = $taskTable.Substring(0,$taskRows[0].Index)
    $taskPreviewRows = $taskRows[0].Value + (($taskRows | Select-Object -Last 5 | ForEach-Object {$_.Value}) -join '')
    $taskTablePreview = $taskPrefix + $taskPreviewRows + '</table>'
    $taskLabel = if($taskTableNumber -eq 4){'表1：国外机构新增内容'}else{'表2：国内机构新增内容'}
    $taskOutputHtml = Join-Path $PSScriptRoot "表$($taskTableNumber-3)新增内容预览.html"
    $taskPreviewHtml = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">' + $taskStyle + '<style>body{background:white;padding:24px} .preview{width:850px;margin:0 auto} h2{font:20px 宋体;color:red;margin-bottom:16px} table{margin:0!important} </style></head><body><div class="preview"><h2>' + $taskLabel + '</h2>' + $taskTablePreview + '</div></body></html>'
    $taskPreviewHtml | Set-Content -LiteralPath $taskOutputHtml -Encoding UTF8
    $taskOutputPng = Join-Path $PSScriptRoot "表$($taskTableNumber-3)新增内容预览.png"
    $taskBrowserProfile = Join-Path $env:TEMP "officecli-table-preview-$taskTableNumber"
    $taskUri = ([Uri]$taskOutputHtml).AbsoluteUri
    $taskArguments = @('--headless','--no-sandbox','--disable-gpu','--disable-gpu-sandbox','--no-first-run','--no-default-browser-check',"--user-data-dir=`"$taskBrowserProfile`"",'--hide-scrollbars','--window-size=1000,2400',"--screenshot=`"$taskOutputPng`"", "`"$taskUri`"")
    $taskBrowser = Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList $taskArguments -WindowStyle Hidden -PassThru
    if (-not $taskBrowser.WaitForExit(45000)) {throw '浏览器预览超时'}
    if (-not (Test-Path -LiteralPath $taskOutputPng)) {throw '预览图未生成'}
    Write-Output $taskOutputPng
}
