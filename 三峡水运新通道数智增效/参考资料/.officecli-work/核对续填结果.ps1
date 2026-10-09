$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Read-TaskDocumentXml([string]$taskPath) {
    $taskZip = [System.IO.Compression.ZipFile]::OpenRead($taskPath)
    try {
        $taskReader = [System.IO.StreamReader]::new($taskZip.GetEntry('word/document.xml').Open())
        try { return [xml]$taskReader.ReadToEnd() } finally {$taskReader.Dispose()}
    } finally {$taskZip.Dispose()}
}
$taskFile = Join-Path $PSScriptRoot '项目1.5申报书模板.docx'
$taskDoc = Read-TaskDocumentXml $taskFile
$taskOriginal = Read-TaskDocumentXml (Join-Path $PSScriptRoot '项目1.5申报书模板_续填前备份.docx')
$taskNamespace = [System.Xml.XmlNamespaceManager]::new($taskDoc.NameTable)
$taskNamespace.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$taskOldTables = $taskOriginal.SelectNodes('//*[local-name()="body"]/*[local-name()="tbl"]')
$taskNewTables = $taskDoc.SelectNodes('/w:document/w:body/w:tbl',$taskNamespace)
if($taskOldTables.Count -ne $taskNewTables.Count){throw '原表格数量发生变化'}
for($taskTableIndex=0; $taskTableIndex -lt $taskOldTables.Count; $taskTableIndex++) {
    $taskOldRows = $taskOldTables[$taskTableIndex].SelectNodes('./*[local-name()="tr"]')
    $taskNewRows = $taskNewTables[$taskTableIndex].SelectNodes('./w:tr',$taskNamespace)
    $taskExtra = if($taskTableIndex -in @(3,4)){5}else{0}
    if($taskNewRows.Count -ne $taskOldRows.Count+$taskExtra){throw '表格行数异常'}
    for($taskRowIndex=0; $taskRowIndex -lt $taskOldRows.Count; $taskRowIndex++) {
        $taskOldText = ($taskOldRows[$taskRowIndex].SelectNodes('.//*[local-name()="t"]') | ForEach-Object {$_.InnerText}) -join ''
        $taskNewText = ($taskNewRows[$taskRowIndex].SelectNodes('.//w:t',$taskNamespace) | ForEach-Object {$_.InnerText}) -join ''
        if($taskOldText -cne $taskNewText){throw '原有表格内容发生变化'}
    }
}
$taskRedRuns=0
$taskLinks=0
foreach($taskScope in @(@{table=4;start=17;end=21},@{table=5;start=22;end=26})) {
    foreach($taskRowNumber in $taskScope.start..$taskScope.end) {
        $taskRow = $taskNewTables[$taskScope.table-1].SelectSingleNode("./w:tr[$taskRowNumber]",$taskNamespace)
        foreach($taskRun in $taskRow.SelectNodes('.//w:r[w:t]',$taskNamespace)) {
            $taskColor = $taskRun.SelectSingleNode('./w:rPr/w:color',$taskNamespace)
            if(-not $taskColor -or $taskColor.GetAttribute('val',$taskNamespace.LookupNamespace('w')) -ne 'FF0000'){throw '新增文字存在非红色字体'}
            $taskRedRuns++
        }
        $taskLinks += $taskRow.SelectNodes('.//w:hyperlink',$taskNamespace).Count
        $taskRowText = ($taskRow.SelectNodes('.//w:t',$taskNamespace) | ForEach-Object {$_.InnerText}) -join ''
        if($taskRowText -match '(\$[A-Za-z_]+\$|\{\{[^}]+\}\}|<TODO>|xxxx|lorem|\\[tn])'){throw '新增文字存在占位符或转义泄漏'}
    }
}
$taskOldParagraphs = @($taskOriginal.SelectNodes('//*[local-name()="body"]/*[local-name()="p"]') | ForEach-Object {($_.SelectNodes('.//*[local-name()="t"]')|ForEach-Object {$_.InnerText}) -join ''})
$taskNewParagraphs = @($taskDoc.SelectNodes('/w:document/w:body/w:p',$taskNamespace) | ForEach-Object {($_.SelectNodes('.//w:t',$taskNamespace)|ForEach-Object {$_.InnerText}) -join ''} | Where-Object {$_ -notmatch '^子课题三续填说明：'})
if(($taskOldParagraphs -join "`n") -cne ($taskNewParagraphs -join "`n")){throw '原有正文文字发生变化'}
Write-Output "原有29张表及正文文字保持一致；表1、表2各新增5行；$taskRedRuns 个新增文本片段均为红色；$taskLinks 个来源超链接已写入；新增内容无占位符和转义泄漏。"
& officecli validate $taskFile
if($LASTEXITCODE -ne 0){throw '最终结构校验失败'}
$taskPageFields = & officecli query $taskFile 'field[fieldType=page]' --json | ConvertFrom-Json
if($LASTEXITCODE -ne 0 -or $taskPageFields.data.results.Count -lt 1){throw '原模板页码字段未检出'}
& officecli close $taskFile
