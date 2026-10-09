import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const H=2645.666666666667;
const p=Presentation.create({slideSize:{width:1280,height:H}});
const s=p.slides.add();s.background.fill='#FFFFFF';
const C={navy:'#1F4E79',blue:'#2E75B6',pblue:'#DEEBF7',green:'#21864B',pgreen:'#E5F1E9',gold:'#BF8F00',pgold:'#FCF3D8',orange:'#C55A11',porange:'#FDEBE0',gray:'#666666'};
let id=0; const meta=[];
function rect(x,y,w,h,fill,line='none',r=8,shadow=false,name='容器'){
 const q=s.shapes.add({name:`${name}_${++id}`,geometry:r?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1.7},borderRadius:r,...(shadow?{shadow:'1px 2px 3px #000000/18'}:{})});return q;
}
function text(x,y,w,h,t,size=16,color=C.gray,bold=false,align='center',name='文字'){
 const q=s.shapes.add({name:`${name}_${++id}`,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=t.split('\n').map(v=>({runs:[v],spaceBefore:0,spaceAfter:0}));
 q.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};
 meta.push({name:q.name,text:t,x,y,w,h,size});return q;
}
function arrow(x,y,w,h,color=C.blue,geom='rightArrow'){
 return s.shapes.add({name:`流程箭头_${++id}`,geometry:geom,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0}});
}
function line(x1,y1,x2,y2,color,width=2){
 // Native editable horizontal and vertical segments keep feedback routes clear.
 return rect(Math.min(x1,x2),Math.min(y1,y2),Math.max(Math.abs(x2-x1),width),Math.max(Math.abs(y2-y1),width),color,'none',0,false,'连接线');
}
function card(x,y,w,h,title,body,color,fill,titleSize=18,bodySize=15.5,titleH=36){
 const q=rect(x,y,w,h,fill,color,10,true,title.replace(/\n/g,' '));
 text(x+7,y+9,w-14,titleH,title,titleSize,color,true);
 text(x+9,y+titleH+17,w-18,h-titleH-26,body,bodySize,C.gray);
 return q;
}
function subcard(x,y,w,h,title,body,color,fill){return card(x,y,w,h,title,body,color,fill,17,14.5,25);}
function band(y,h,title,color){rect(251.52,y,679.68,h,'#FFFFFF',color,10,true,'研究模块');rect(258.24,y+6.72,666.24,42,color,'none',10,true,'模块标题背景');text(277,y+7,634,40,title,19,'#FFFFFF',true,'left','模块标题');}
function down(x,y,h=22,color=C.blue){arrow(x-8,y,16,h,color,'downArrow');}
function join(y,left=421,right=762,center=592,color=C.blue){line(left,y,left,y+16,color);line(right,y,right,y+16,color);line(left,y+16,right,y+16,color);down(center,y+17,21,color);}

// Retain the original font, three-color research modules and side-column layout.
text(59.52,22,570,42,'子课题3  技术路线图',26.67,C.navy,true,'left','总标题');
text(610,28,610,33,'枢纽施工扰动下航运系统波动响应研究',16,C.gray,false,'right','子课题名称');
rect(59.52,72,1160.93,1.5,'#BDD7EE','none',0);
rect(34.56,83,48,2476,C.orange,'none',10,true,'研究基础侧栏');
rect(965.76,83,48,2476,C.navy,'none',10,true,'成果侧栏');
for(const y of [270,1150,2080]){
 text(34.56,y,48,400,'研\n究\n基\n础\n与\n数\n据\n支\n撑',20,'#FFFFFF',true);
 text(965.76,y,48,400,'成\n果\n输\n出\n与\n集\n成\n支\n撑',20,'#FFFFFF',true);
}

// Data inputs align with the research stages rather than implying a causal sequence.
card(94.08,145,124.8,260,'施工场景\n与通航约束','施工方案与工期\n施工阶段与作业范围\n检修安排与政策\n停限航时间窗口\n航道与船闸条件\n组织规则及船型限制',C.orange,'#FFFFFF',15.5,13,46);
card(94.08,435,124.8,320,'运行与货类\n多源数据','AIS轨迹与到达流\n实际通过量与过坝货量\n港口作业与船期记录\n重点货类和货种结构\n起讫点与运输批量\n发运节奏与交付期限\n替代运输条件\n货类运输时空特征',C.orange,'#FFFFFF',15.5,13,46);
card(94.08,785,124.8,270,'常态对照\n与外生条件','无施工运行基准\n水文与天气条件\n周期与季节性需求\n节假日及其他管制\n燃料价格与合同条件\n初始负荷与积压状态',C.orange,'#FFFFFF',15.5,13,46);
card(94.08,1155,124.8,355,'市场与主体\n行为数据','分货类航线船型运价\n等待航行与转运成本\n港航经营收益\n船舶周转与承运意愿\n运力配置与航次安排\n待闸绕行和船型调整\n发运时间与通道选择\n行为调查及组织记录',C.orange,'#FFFFFF',15.5,13,46);
card(94.08,1770,124.8,245,'典型事件\n与检验数据','历史施工与检修事件\n事件前中后运行记录\n到达服务与排队数据\n船期运价成本变化\n校准与独立检验事件\n缺失异常及口径核对',C.orange,'#FFFFFF',15.5,13.5,46);
card(94.08,2180,124.8,370,'工作基础\n与子课题协同','空间经济整体模型\n区域需求与网络背景\n综合交通超级网络\n多通道联系及仿真基础\n子课题一数据与特征\n子课题二路径及假设\n子课题四需求情景\n子课题五尺度与接口\n补充精细航运模块\n核查时间分辨率\n与水运校准能力',C.orange,'#FFFFFF',15.5,13,46);

// ① Expand the original constraint mapping, capacity and demand branches.
band(83,905,'① 施工扰动表征与航运运行波动响应',C.blue);
card(270.72,145,190.72,173,'施工扰动参数化','阶段、范围、强度与持续时间\n施工方案、工期与检修组合\n阶段切换及工期不确定性',C.blue,C.pblue,18,15.5);
card(496,145,190.72,173,'通航约束解析','航道通过限制与船闸停航窗口\n可用时段、服务速率与船型限制\n放行节奏、优先规则与作业衔接',C.blue,C.pblue,18,15.5);
card(721.28,145,190.72,173,'多情景扰动库','无施工基准与典型施工阶段\n不同强度、工期及恢复安排\n施工与水文、需求高峰叠加',C.blue,C.pblue,18,15.5);
arrow(465.28,207,26.88,20,C.blue);arrow(690.56,207,26.88,20,C.blue);
text(270.72,328,641.28,35,'方法：施工事件窗口匹配与参数化表达\n统一情景编号、时间尺度、设施与通道口径',14.5,C.blue);
down(592,367,18,C.blue);
rect(270.72,394,300.48,332,'#F6FAFE',C.blue,9);
rect(611.52,394,300.48,332,'#F6FAFE',C.blue,9);
text(280,403,280,30,'能力供给动态建模',19,C.blue,true);
text(621,403,280,30,'需求与到达过程建模',19,C.blue,true);
subcard(280,444,281,81,'航道、船闸、船舶运力三层级输入','通行条件与设施可用性\n服务过程及船型组合',C.blue,C.pblue);
subcard(280,535,281,81,'有效能力与扰动折减映射','服务速率、可用时间及组织规则\n扰动强度对应能力折减与恢复',C.blue,C.pblue);
subcard(280,626,281,81,'能力变化时空特征','折减幅度、持续时间与恢复过程\n能力时间特性及空间瓶颈',C.blue,C.pblue);
subcard(621,444,281,81,'运输需求与船舶到达过程','货类、起讫点及船型时空分布\n区分潜在需求与实际实现流量',C.blue,C.pblue);
subcard(621,535,281,81,'常态需求波动分解','周期性、季节性及突发性\n控制水文、天气及非施工因素',C.blue,C.pblue);
subcard(621,626,281,81,'施工增量响应识别','基准与扰动情景对照及事件分析\n响应幅度、时滞与需求弹性',C.blue,C.pblue);
join(735);
card(270.72,778,641.28,117,'供需失配与运输服务联合响应','到达与有效服务失衡引起排队增长、货物积压与实际通过量变化\n刻画待闸时间分布、船期偏移、港航作业衔接及运输组织调整\n识别时效损失、交付可靠性变化与重点货类差异',C.blue,C.pblue,19,16);
text(270.72,902,641.28,67,'方法：动态排队、基准情景对照与分货类航线船型分析\n输出：有效能力、到达流、通过量、积压量、时效与可靠性\n明确施工影响与常态波动的区分及识别条件',14.5,C.blue);
down(592,991,18,C.blue);

// ② Two paths: direct adaptation and market-mediated response.
band(1012,654,'② 航运市场与经营经济响应及主体行为反馈',C.green);
card(270.72,1070,641.28,60,'共同驱动：运行状态变化与通航限制','能力、需求、等待时间、船期及可靠性变化分别进入成本市场分析与主体直接调整',C.green,C.pgreen,18,14.5,24);
line(421,1131,421,1138,C.green);line(762,1131,762,1138,C.green);
text(287,1136,270,19,'运行变化引起成本与供需调整',13.5,C.green,true);
text(628,1136,270,19,'通航约束直接引起组织适应',13.5,C.green,true);
down(421,1153,12,C.green);down(762,1153,12,C.green);
rect(270.72,1166,300.48,330,'#F7FCF8',C.green,9);
rect(611.52,1166,300.48,330,'#F7FCF8',C.green,9);
text(281,1173,280,30,'成本与市场响应',19,C.green,true);
text(622,1173,280,30,'主体直接与市场驱动调整',18,C.green,true);
subcard(280,1214,281,81,'运输成本与港航经营响应','待闸、航行、转运及周转变化\n单航次单位成本与经营收益',C.green,C.pgreen);
subcard(280,1305,281,81,'运价响应及其作用条件','供需、成本、合同与替代条件\n控制燃料变化并检验价格方向',C.green,C.pgreen);
subcard(280,1396,281,81,'差异化响应与传导时滞','分货类、航线、船型识别\n成本与运价口径分别核算',C.green,C.pgreen);
subcard(621,1214,281,81,'直接适应通航与服务变化','航次、待闸组织、绕行转运\n船型与发运时间调整',C.green,C.pgreen);
subcard(621,1305,281,81,'市场信息驱动的运输选择','承运意愿、运力配置与航次\n发运时点、通道及方式选择',C.green,C.pgreen);
subcard(621,1396,281,81,'主体行为弹性与调整约束','货类期限、替代能力与资源约束\n行为方向、调整比例与时滞',C.green,C.pgreen);
arrow(578,1336,27,18,C.green);
join(1499,421,762,592,C.green);
card(270.72,1541,641.28,65,'行为反馈更新有效运力、到达流与运输需求','将主体选择转化为分时段运力、到达与货类需求变化，并返回第一部分迭代计算',C.green,C.pgreen,17.5,15,24);
text(270.72,1610,641.28,43,'方法：运输成本核算、运价响应分析、离散选择与行为弹性估计\n反馈方向依据数据检验，区分企业成本、货主支付运费和企业收入',14,C.green);
// Two explicit feedback routes, one for each baseline modeling branch.
line(270.72,1573,239,1573,C.green);line(239,1573,239,485,C.green);line(239,485,254,485,C.green);arrow(254,478,16,16,C.green);
line(912,1573,947,1573,C.green);line(947,1573,947,485,C.green);line(930,485,947,485,C.green);arrow(912,478,18,16,C.green,'leftArrow');
rect(223,1091,27,88,'#FFFFFF','none',0);
rect(932,1142,28,117,'#FFFFFF','none',0);
text(225,1025,25,220,'运\n力\n配\n置\n反\n馈',12.5,C.green,true);
text(934,1070,25,260,'到\n达\n流\n与\n需\n求\n反\n馈',12.5,C.green,true);
down(592,1668,10,C.green);

// ③ Mechanism identification and model development precede calibrated scenario analysis.
band(1680,792,'③ 航运波动传播与动态响应模型构建',C.gold);
card(270.72,1738,641.28,83,'传播与恢复机制识别','识别坝区多通道及上下游港航网络的连接、剩余能力与积压作用\n根据运行与行为响应证据提出传播、放大及恢复假设',C.gold,C.pgold,19,15.5,28);
down(592,1825,19,C.gold);
card(270.72,1847,641.28,119,'融合运行与市场行为反馈的航运动态响应模型','动态排队、时变网络与离散事件仿真联动刻画能力、到达、积压及港航衔接\n集成成本运价响应、运力配置与货主运输选择，求解航运内部反馈\n统一需求、实际流量与积压守恒，区分延后实现及未满足需求',C.gold,C.pgold,18.5,15.5,31);
line(592,1968,592,1978,C.gold);line(421,1978,762,1978,C.gold);down(421,1979,17,C.gold);down(762,1979,17,C.gold);
card(270.72,1998,300.48,149,'典型事件参数校准','施工与检修事件的前中后数据\n辨识能力、到达、服务与组织参数\n估计成本、运价及行为反馈参数\n说明参数来源与可迁移范围',C.gold,C.pgold,18,15.5);
card(611.52,1998,300.48,149,'独立事件与多指标检验','使用不同事件或时段检验\n通过量、排队及等待时间分布\n船期偏移、运价响应及传播时滞\n评估误差并修正模型假设',C.gold,C.pgold,18,15.5);
// Calibration and validation results return to the response model.
line(270.72,2070,239,2070,C.gold);line(239,2070,239,1900,C.gold);arrow(254,1893,16,16,C.gold);line(239,1900,254,1900,C.gold);
line(912,2070,947,2070,C.gold);line(947,2070,947,1900,C.gold);line(930,1900,947,1900,C.gold);arrow(912,1893,18,16,C.gold,'leftArrow');
rect(223,1983,27,64,'#FFFFFF','none',0);rect(932,1983,28,64,'#FFFFFF','none',0);
text(225,1968,25,91,'参\n数\n修\n正',12.5,C.gold,true);text(934,1968,25,91,'机\n制\n修\n正',12.5,C.gold,true);
join(2153,421,762,592,C.gold);
card(270.72,2195,641.28,112,'多情景传播与恢复推演','组合施工强度、工期、水文、需求高峰、初始负荷及替代通道条件\n分析波动的传播方向、时滞、空间范围与通道间瓶颈转移\n比较不同组织措施下的响应及适应性，形成后续优化任务的参数依据',C.gold,C.pgold,18.5,15,28);
down(592,2310,16,C.gold);
card(270.72,2330,190.72,134,'供需失配与放大阈值','持续积压出现条件\n扰动强度与持续时间阈值\n多次短时限制的累积效应',C.gold,C.pgold,17,14.5,30);
card(496,2330,190.72,134,'积压消散与系统恢复','剩余服务能力与消散速度\n能力恢复后的服务滞后\n恢复时间与累计服务损失',C.gold,C.pgold,17,14.5,30);
card(721.28,2330,190.72,134,'敏感性与不确定性','施工、需求及行为参数扰动\n关键敏感因素与情景范围\n模型适用边界及参数稳健性',C.gold,C.pgold,17,14.5,30);

// Outputs mirror the detailed modules and remain consistent with the task boundary.
const outputs=[
 [145,245,'扰动情景库与能力映射','施工阶段、强度及工期参数\n通航约束与有效能力映射\n能力折减幅度和持续时间\n多情景编号与标准化输入'],
 [435,230,'需求基准与施工增量','常态货类需求及到达过程\n周期、季节与突发波动特征\n施工增量响应幅度与时滞\n需求弹性及识别条件'],
 [742,230,'运行与服务响应规律','能力、流量、拥堵与组织变化\n排队、船期及港航作业衔接\n运输时效与交付可靠性\n分货类航线船型差异'],
 [1140,255,'市场响应与行为参数','运输成本、运价及收益变化\n直接与市场驱动调整关系\n运力、航次及运输选择弹性\n响应方向、约束与调整时滞'],
 [1460,170,'航运内部反馈模块','主体调整对运力与需求的反馈\n迭代关系及一致费用核算\n运行、市场与行为关联参数'],
 [1870,230,'传播阈值与恢复规律','多通道及上下游传播时滞\n供需失配与非线性放大阈值\n瓶颈转移及积压消散过程\n系统恢复与组织适应性'],
 [2200,225,'动态响应模型与接口','校准模型及独立检验结果\n参数来源与不确定性范围\n分时段通道货类输入输出\n模块可调用性及适用边界'],
];
for(const [y,h,t,b] of outputs)card(1027.2,y,218.88,h,t,b,C.blue,'#F0F6FC',18,15.5,43);
for(const [y,h] of [[397,20],[686,38],[984,130],[1407,35],[1644,201],[2113,61]])down(1137,y,h,C.blue);
rect(1027.2,2454,218.88,104,C.navy,'none',10,true,'集成支撑');
text(1035,2463,203,84,'支撑子课题五\n级联模型集成与整体验证\n提供航运响应模块及接口',17,'#FFFFFF',true);
// Boundary is explicit without absorbing project-level optimization and platform tasks.
text(251.52,2480,679.68,77,'研究边界：航运运行、运输服务及直接市场经营响应\n输出运输时间、成本、运价、可靠性、实现流量及行为参数\n产业库存、生产与区域经济由相关子课题衔接\n完整调度优化、多式联运优化与平台研发由项目相关任务承担',14.5,C.gray,false,'center','研究边界');
text(94.08,2587,1152,35,'数据与模型衔接：子课题一提供数据与特征，子课题二提供全链条作用路径，子课题四反馈需求情景，子课题五统一接口并集成验证。',14,C.gray,false,'left','协同接口');
s.speakerNotes.textFrame.setText('子课题三技术路线细化方案。依据此前确定的三项主要研究内容及两页路线对比完善，保留施工扰动、运行与货类数据、市场行为、网络传播、模型方法、校准检验及成果接口内容。第一部分增加施工参数—通航约束—多情景库，以及能力与需求并行分支、常态波动识别和供需失配服务响应。第二部分区分通航限制引起的直接适应和市场信息驱动调整，两条反馈路线分别更新能力供给及到达需求，不预设成本增加必然引起运价上涨。第三部分将机制识别、响应模型构建、事件校准、独立检验和多情景传播恢复推演联动，校准及检验结果返回模型修正。完整级联模型、产业响应和项目平台任务按子课题分工衔接。');
await (await PresentationFile.exportPptx(p)).save('new-slide.pptx');
await fs.writeFile('new-slide.png',new Uint8Array(await (await s.export({format:'png',scale:1})).arrayBuffer()));
await fs.writeFile('new-slide.layout.json',await (await s.export({format:'layout'})).text());
await fs.writeFile('new-slide.text.json',JSON.stringify(meta,null,2));
console.log(JSON.stringify({objects:s.shapes.items.length,textBlocks:meta.length,width:1280,height:H}));
