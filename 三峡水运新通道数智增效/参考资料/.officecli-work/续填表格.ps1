$ErrorActionPreference = 'Stop'
$taskDirectory = $PSScriptRoot
$taskFile = Join-Path $taskDirectory '项目1.5申报书模板.docx'
$taskData = Get-Content -LiteralPath (Join-Path $taskDirectory '子课题三_表1表2续填数据.json') -Raw -Encoding UTF8 | ConvertFrom-Json

# 首个国外新增行已完成克隆。后续逐次添加并检查结构。
foreach ($taskRowNumber in 18..21) {
    & officecli add $taskFile '/body/tbl[4]' --from '/body/tbl[4]/tr[16]' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "表1第$taskRowNumber 行克隆失败" }
    $taskReadback = & officecli get $taskFile "/body/tbl[4]/tr[$taskRowNumber]" --depth 1 --json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $taskReadback.data.results[0].childCount -ne 6) { throw '表1新增行结构异常' }
}
foreach ($taskRowNumber in 22..26) {
    & officecli add $taskFile '/body/tbl[5]' --from '/body/tbl[5]/tr[21]' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "表2第$taskRowNumber 行克隆失败" }
    $taskReadback = & officecli get $taskFile "/body/tbl[5]/tr[$taskRowNumber]" --depth 1 --json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $taskReadback.data.results[0].childCount -ne 5) { throw '表2新增行结构异常' }
}

$taskCommands = [System.Collections.Generic.List[object]]::new()
foreach ($taskGroup in @(@{table=4;start=17;entries=$taskData.foreign}, @{table=5;start=22;entries=$taskData.domestic})) {
    for ($taskEntryIndex=0; $taskEntryIndex -lt $taskGroup.entries.Count; $taskEntryIndex++) {
        $taskEntry = $taskGroup.entries[$taskEntryIndex]
        $taskRow = $taskGroup.start + $taskEntryIndex
        $taskRowPath = "/body/tbl[$($taskGroup.table)]/tr[$taskRow]"
        $taskProps = @{cantSplit='true';height='0.2cm'}
        for ($taskColumn=1; $taskColumn -le $taskEntry.cells.Count; $taskColumn++) {
            $taskProps["c$taskColumn"] = [string]$taskEntry.cells[$taskColumn-1]
        }
        $taskCommands.Add(@{command='set';path=$taskRowPath;props=$taskProps})
        for ($taskColumn=1; $taskColumn -le $taskEntry.cells.Count; $taskColumn++) {
            $taskCellPath = "$taskRowPath/tc[$taskColumn]"
            $taskAlignment = if ($taskColumn -eq 1) {'center'} else {'left'}
            $taskCommands.Add(@{command='set';path=$taskCellPath;props=@{font='宋体';size='10.5pt';color='FF0000';align=$taskAlignment;valign='top';bold='false';nowrap='false'}})
            $taskCommands.Add(@{command='set';path="$taskCellPath/p[1]";props=@{lineSpacing='1.3x';spaceBefore='0pt';spaceAfter='0pt'}})
        }
        foreach ($taskReference in $taskEntry.refs) {
            $taskCommands.Add(@{command='add';parent="$taskRowPath/tc[4]/p[1]";type='hyperlink';props=@{text=" [$($taskReference.id)]";url=$taskReference.url;tooltip=$taskReference.title; color='FF0000';font='宋体';size='10.5pt'}})
        }
    }
}
$taskCommands.Add(@{command='add';parent='/body';type='paragraph';after='/body/tbl[4]';props=@{text='子课题三续填说明：新增序号16–20为国外候选机构，原有条目保留。自评价列说明拟研究差异，现有证据不足以作领跑／并跑／跟跑评级；正式申报时需对整表筛选至不超过5家。方括号编号为可点击的来源链接。';font='宋体';size='10.5pt';color='FF0000';lineSpacing='1.3x';spaceAfter='6pt'}})
$taskCommands.Add(@{command='add';parent='/body';type='paragraph';after='/body/tbl[5]';props=@{text='子课题三续填说明：新增序号20–24为国内候选机构，原有条目保留。调度论文用于说明运行响应研究基础，本子课题聚焦响应规律及航运内部市场反馈；产业链与区域经济效应由相关子课题衔接。正式申报时需对整表筛选至不超过5家。来源检索日期：2026年10月5日。';font='宋体';size='10.5pt';color='FF0000';lineSpacing='1.3x';spaceAfter='6pt'}})
$taskBatchPath = Join-Path $taskDirectory '表格续填操作.json'
$taskCommands | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $taskBatchPath -Encoding UTF8
& officecli batch $taskFile --input $taskBatchPath --stop-on-error --json | Set-Content -LiteralPath (Join-Path $taskDirectory '表格续填执行结果.json') -Encoding UTF8
if ($LASTEXITCODE -ne 0) { throw '续填批处理失败，检查执行结果' }
& officecli save $taskFile
if ($LASTEXITCODE -ne 0) { throw '保存失败' }

$taskMemo = [System.Collections.Generic.List[string]]::new()
$taskMemo.Add('# 子课题三表1、表2续填检索依据')
$taskMemo.Add('')
$taskMemo.Add('检索日期：2026年10月5日。主题：枢纽施工扰动下航运系统波动响应研究。')
$taskMemo.Add('')
$taskMemo.Add('已在原模板表1末尾新增5家国外机构（序号16–20），表2末尾新增5家国内机构（序号20–24），全部新增文字为红色。原文件已备份。正式申报需依模板要求对每张整表遴选不超过5家。')
$taskMemo.Add('')
$taskMemo.Add('本次只补充相关研究资料，不将外部机构成果表述为本团队成果；实测校准、历史数据试验、统计监测和工程试点分别说明。自评价列按拟研究差异填写，不无依据评级。机构官网、原始论文发布页、工具官方文档和官方报告为主要依据；个别页面正文访问受限时使用搜索返回的该官方页面内容。')
$taskMemo.Add('')
foreach ($taskGroupName in @('foreign','domestic')) {
    $taskMemo.Add($(if ($taskGroupName -eq 'foreign') {'## 表1国外机构'} else {'## 表2国内机构'}))
    $taskMemo.Add('')
    foreach ($taskEntry in $taskData.$taskGroupName) {
        $taskMemo.Add("### $($taskEntry.cells[0]). $($taskEntry.cells[1])")
        $taskMemo.Add('')
        $taskMemo.Add("研究内容：$($taskEntry.cells[2])")
        $taskMemo.Add('')
        $taskMemo.Add("代表成果：$($taskEntry.cells[3])")
        $taskMemo.Add('')
        $taskMemo.Add("应用证据：$($taskEntry.cells[4])")
        $taskMemo.Add('')
        foreach ($taskReference in $taskEntry.refs) { $taskMemo.Add("- [$($taskReference.id)：$($taskReference.title)]($($taskReference.url))") }
        $taskMemo.Add('')
    }
}
$taskMemo | Set-Content -LiteralPath (Join-Path $taskDirectory '子课题三_表1表2检索依据.md') -Encoding UTF8
Write-Output '表1、表2已续填并保存，检索依据已写入。'
