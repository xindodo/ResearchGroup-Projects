import json
from pathlib import Path
changes={
'锚地与检验数据标题':'运行组织与事件检验数据',
'锚地与检验数据正文':'发运与待泊组织、典型及独立事件\n锚地位置容量、占用及进出记录',
'研究一标题':'① 施工约束下航运运输能力与排队响应',
'排队锚地标题':'排队规模与等待响应',
'排队锚地正文':'到达—排队—过闸过程\n排队船舶数量变化\n分货类等待时间',
'运力折减正文':'等待延长与周转变化\n船舶周转与港航衔接\n运力折减及运行反馈',
'模型一':'航运运输能力与排队响应模型：能力约束 → 排队与等待 → 周转及运力',
'情景设置正文':'施工强度与持续时间、初始需求\n通道可用条件与运输组织规则',
'输出排队标题':'排队与待泊状态',
'输出排队正文':'排队船舶数量及变化\n锚地占用量与利用率\n超容量待泊规模',
'输出锚地标题':'等待与交付可靠性',
'输出锚地正文':'平均／高分位等待时间\n分货类等待时间变化\n交付可靠性及变化',
'输出恢复标题':'积压消散与服务恢复',
'输出恢复正文':'积压量及其变化\n积压消散过程\n运输服务恢复时间',
}
ops=[{'command':'set','path':f'/slide[2]/shape[@name={n}]','props':{'text':t}} for n,t in changes.items()]
ops.append({'command':'add','parent':'/slide[2]','type':'shape','props':{'name':'锚地辅助约束说明','x':'76pt','y':'710pt','width':'792pt','height':'24pt','text':'辅助约束：锚地位置与容量、适用船型及进出耗时；必要时检验容量不足的影响。','font':'微软雅黑','size':'18','color':'617588','margin':'1pt','align':'center','valign':'middle','fill':'none','line':'none','lineSpacing':'1.0x','spaceBefore':'0pt','spaceAfter':'0pt','autoFit':'none'}})
ops.append({'command':'set','path':'/slide[2]/notes','props':{'text':'本页以施工约束下的运输能力、排队规模、分货类等待及周转造成的运力折减为第一项主线。锚地位置、容量、适用船型及进出耗时作为排队与待泊过程中的辅助约束，以现有或规划配置为输入，仅在容量接近饱和或不足时补充情景检验，不开展独立锚地选址布局优化。锚地利用结果并入排队与待泊状态。物流时间与成本、需求反馈及与子课题1、2、4的接口保持衔接。能力与实际通过量分开，需求折减、延后与转移分别核算。'}})
Path('.presentation-work/anchorage_priority_batch.json').write_text(json.dumps(ops,ensure_ascii=False),encoding='utf-8')
