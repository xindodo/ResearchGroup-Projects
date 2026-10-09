$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskFile = Join-Path $PSScriptRoot '项目1.5申报书模板.docx'
$taskBackup = Join-Path $PSScriptRoot '项目1.5申报书模板_续填前备份.docx'
$taskZip = [System.IO.Compression.ZipFile]::OpenRead($taskBackup)
$taskReader = [System.IO.StreamReader]::new($taskZip.GetEntry('word/styles.xml').Open())
$taskStyles = [xml]$taskReader.ReadToEnd()
$taskReader.Dispose()
$taskZip.Dispose()
$taskRepairs = [System.Collections.Generic.List[object]]::new()
# 仅调整样式子元素顺序，保留所有取值与可见样式。
$taskStyleOrder = @('name','aliases','basedOn','next','link','autoRedefine','hidden','uiPriority','semiHidden','unhideWhenUsed','qFormat','locked','personal','personalCompose','personalReply','rsid','pPr','rPr','tblPr','trPr','tcPr','tblStylePr')
foreach ($taskStyle in @($taskStyles.DocumentElement.ChildNodes | Where-Object {$_.LocalName -eq 'style'})) {
    $taskNodes = @($taskStyle.ChildNodes)
    $taskOrdered = @($taskNodes | Sort-Object { $taskOrder = [array]::IndexOf($taskStyleOrder,$_.LocalName); if($taskOrder -lt 0){999}else{$taskOrder} })
    foreach ($taskNode in $taskOrdered) { [void]$taskStyle.AppendChild($taskNode) }
}
$taskRepairs.Add(@{command='raw-set';part='/styles';xpath='/*';action='replace';xml=$taskStyles.DocumentElement.OuterXml})
# 评论段落标识超出schema范围，保留低31位，并避开冲突。
$taskBaseline = Get-Content -LiteralPath (Join-Path $PSScriptRoot '模板校验基线.json') -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($taskWarning in $taskBaseline.warnings) {
    if ($taskWarning.message -match "paraId' has invalid value '([0-9A-F]{8})'") {
        $taskOldId = $Matches[1]
        if ($taskOldId -eq 'FDFE17C4') { continue } # 已单独完成该标识修复。
        $taskNewId = ([Convert]::ToUInt32($taskOldId,16) -band 0x7FFFFFFF).ToString('X8')
        $taskRepairs.Add(@{command='raw-set';part='/comments';xpath="//*[local-name()='p' and @*[local-name()='paraId']='$taskOldId']";action='setattr';xml="w14:paraId=$taskNewId"})
    }
}
# 原模板备用VML形状具有重复id，仅为第二个同名形状设置唯一标识。
$taskRepairs.Add(@{command='raw-set';part='/document';xpath="(//*[local-name()='shape' and @id='文本框 2'])[2]";action='setattr';xml='id=文本框_2_唯一'})
$taskInput = Join-Path $PSScriptRoot '模板结构修复操作.json'
$taskRepairs | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskInput -Encoding UTF8
& officecli batch $taskFile --input $taskInput --stop-on-error --json | Set-Content -LiteralPath (Join-Path $PSScriptRoot '模板结构修复执行结果.json') -Encoding UTF8
if ($LASTEXITCODE -ne 0) { throw '模板结构修复失败' }
& officecli close $taskFile
if ($LASTEXITCODE -ne 0) { throw '保存关闭失败' }
& officecli validate $taskFile --json | Set-Content -LiteralPath (Join-Path $PSScriptRoot '续填后校验.json') -Encoding UTF8
Write-Output '模板结构修复后校验结果：'
Get-Content -LiteralPath (Join-Path $PSScriptRoot '续填后校验.json') -Raw -Encoding UTF8
