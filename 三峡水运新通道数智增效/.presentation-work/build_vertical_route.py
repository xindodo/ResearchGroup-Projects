import json
from pathlib import Path

ops=[]
def shape(name,x,y,w,h,text='',fill='none',line='none',color='24445F',size=20,bold=False,align='center',preset='rect'):
    ops.append({'command':'add','parent':'/slide[2]','type':'shape','props':dict(name=name,x=f'{x}pt',y=f'{y}pt',width=f'{w}pt',height=f'{h}pt',text=text,fill=fill,line=line,color=color,size=str(size),bold=str(bold).lower(),align=align,valign='middle',font='微软雅黑',margin='8pt',spaceBefore='0pt',spaceAfter='0pt',lineSpacing='1.1x',autoFit='none',preset=preset)})
def arrow(name,x,y,w,h,color='537A9F',preset='downArrow'):
    shape(name,x,y,w,h,fill=color,preset=preset)
def section(name,y,h,title,c,light):
    shape(name,50,y,844,h,fill=light,line=c,preset='roundRect')
    shape(name+'标题',62,y+10,820,44,title,c,color='FFFFFF',size=24,bold=True,preset='roundRect')
def card(name,x,y,w,h,title,body,c,light,size=20):
    shape(name,x,y,w,h,fill='FFFFFF',line=c,preset='roundRect')
    shape(name+'标题',x+8,y+6,w-16,34,title,color=c,size=21,bold=True)
    shape(name+'正文',x+8,y+43,w-16,h-49,body,color='465765',size=size)
def conn(name,x,y,w,h,color='218653',end='none'):
    ops.append({'command':'add','parent':'/slide[2]','type':'connector','props':dict(name=name,x=f'{x}pt',y=f'{y}pt',width=f'{w}pt',height=f'{h}pt',shape='straight',color=color,lineWidth='2pt',tailEnd=end)})

shape('总标题',50,26,844,50,'子课题3  技术路线图',color='1F4E79',size=36,bold=True)
shape('研究题目',50,82,844,38,'枢纽施工扰动下航运系统运输能力与需求波动响应研究',size=25,bold=True)

section('研究基础与数据支撑',142,326,'研究基础与数据支撑','C55A11','FFF8F1')
card('子课题1输入',76,210,390,112,'子课题1：系统特征与常态基准','港航网络、重点货类与流向\n常态运行特征、基准运输需求','C55A11','',19)
card('子课题2输入',484,210,384,112,'子课题2：扰动参数与作用机理','施工阶段、停限航及放行规则\n通航尺度、能力约束、反馈路径','C55A11','',19)
card('运行数据',76,336,390,112,'航运运行与物流数据','AIS、过闸、到达与排队、船型载重\n港口作业、物流时间与费用记录','C55A11','',19)
card('锚地与检验数据',484,336,384,112,'锚地、组织调整与事件数据','锚地位置容量、占用及进出记录\n发运调整、典型与独立扰动事件','C55A11','',19)
arrow('数据进入模型',462,474,30,24)

section('研究一',508,304,'① 施工约束下运输能力与排队—锚地耦合响应','2E75B6','F0F6FC')
card('通过能力',76,578,250,132,'多通道有效运输能力','通航约束与船型载重\n过闸组织与通道替代\n船舶数与货运量换算','2E75B6','',20)
card('排队锚地',348,578,250,132,'排队与锚地耦合','到达—待泊—过闸过程\n锚地布置与容量约束\n分货类等待及占用','2E75B6','',20)
card('运力折减',620,578,248,132,'周转与可用运力','待闸与进出锚地耗时\n船舶周转与港航衔接\n运力折减及运行反馈','2E75B6','',20)
shape('模型一',76,734,792,56,'运输能力与排队—锚地耦合模型：能力约束 → 排队与占用 → 周转及运力',fill='DCEAF7',color='1F4E79',size=20,bold=True,preset='roundRect')
arrow('运行进入成本',462,818,30,24)

section('研究二',852,272,'② 排队延误下航运物流时间与成本响应','238653','F1F8F3')
card('全程时间',76,922,390,118,'物流全过程时间','航行、待闸、锚泊、装卸与衔接\n分货类物流时长、到货延迟与可靠性','238653','',20)
card('全程成本',484,922,384,118,'物流费用与广义成本','航行、等待、锚泊、装卸及转运费用\n直接费用与货物时间价值分别核算','238653','',19)
shape('模型二',76,1056,792,48,'物流时间与成本响应模型：运输负荷／有效能力 → 延误与成本阻抗','E0EFE5',color='21643F',size=20,bold=True,preset='roundRect')
arrow('成本进入需求',462,1130,30,24,'238653')

section('研究三',1164,326,'③ 需求反馈与运输能力—需求互动耦合推演','BB8C00','FFFAE9')
card('需求反馈',76,1234,390,116,'时间与成本驱动的需求调整','提前／延后发运、通道转移与折减\n子课题4反馈跨方式选择及需求更新','A77C00','',19)
card('情景设置',484,1234,384,116,'多扰动情景设置','施工强度与持续时间、初始需求\n通道可用条件、锚地配置及组织规则','A77C00','',19)
shape('模型三',76,1370,792,48,'能力—需求互动耦合模型：能力 → 排队 → 时间与成本 → 需求 → 到达流','FFF0BA',color='765C00',size=20,bold=True,preset='roundRect')
shape('校准检验',76,1430,792,42,'典型事件校准 → 独立事件检验 → 情景对比与积压消散、服务恢复推演',size=20,color='765C00')
conn('反馈出线',868,1394,52,0)
conn('反馈回路',920,762,0,632)
conn('反馈入线',868,762,52,0,end='none')
arrow('反馈左箭头',864,753,24,18,'218653','leftArrow')
shape('反馈说明',901,934,38,328,'需\n求\n与\n到\n达\n流\n反\n馈',color='218653',size=20,bold=True)
arrow('模型输出箭头',462,1496,30,24,'BB8C00')

section('模型输出',1530,392,'模型输出｜不同扰动情景下的航运响应量化结果','1F4E79','F0F6FC')
card('输出能力',76,1600,250,120,'通过能力与实际通过量','有效能力、实际船舶数\n货运量及其变化\n（艘/日、吨/日）','1F4E79','',19)
card('输出排队',348,1600,250,120,'排队规模与等待时间','排队船舶数量及变化\n平均／高分位等待时间\n分货类等待影响','1F4E79','',19)
card('输出物流',620,1600,248,120,'物流时间与成本','物流总时长、到货延迟\n单位及总成本增幅\n直接费用与广义成本','1F4E79','',19)
card('输出运力需求',76,1736,250,120,'运力与运输需求变化','可用运力及折减率\n需求折减、延后与转移\n积压及未满足需求','1F4E79','',19)
card('输出锚地',348,1736,250,120,'锚地利用与布置影响','占用量、利用率\n超容量待泊规模\n不同锚地配置响应','1F4E79','',19)
card('输出恢复',620,1736,248,120,'服务可靠性与恢复','交付可靠性及变化\n积压消散过程\n运输服务恢复时间','1F4E79','',19)
shape('子课题4接口',76,1870,792,38,'按货类—起讫点—时间输出至子课题4，支撑产业链／供应链影响量化',fill='DCEAF7',color='1F4E79',size=19,bold=True,preset='roundRect')
shape('口径说明',50,1932,844,30,'口径：能力 ≠ 实际通过量；需求折减、延后与转移分别核算；数据为研究所需输入。',size=16,color='66717B')
ops.append({'command':'add','parent':'/slide[2]','type':'notes','props':{'text':'新版技术路线保留原第一页。子课题1提供系统特征、常态基准及需求基础；子课题2提供施工扰动、通航约束及机理参数。子课题3统筹运输能力、排队、锚地、船舶周转、物流时间与成本、运输需求反馈建模，形成多情景量化输出。实际通过量与有效能力分别计算，暂时积压不等于需求消失。子课题4负责跨运输方式选择与产业链、供应链后果测算，并向本模型反馈需求更新。费用与货物时间价值分别输出，避免重复计入产业损失。锚地布置作为配置情景研究，未承诺开展独立的设施选址优化。模型数据与参数尚需获取、校准及独立事件检验。'}})
Path('.presentation-work/vertical_route_batch.json').write_text(json.dumps(ops,ensure_ascii=False),encoding='utf-8')
print(f'{len(ops)} operations')
