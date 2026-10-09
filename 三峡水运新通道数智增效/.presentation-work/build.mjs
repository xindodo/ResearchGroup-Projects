import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const s=p.slides.add(); s.background.fill='#FFFFFF';
const C={navy:'#1F4E79',blue:'#2E75B6',pblue:'#DEEBF7',green:'#21864B',pgreen:'#E5F1E9',gold:'#BF8F00',pgold:'#FCF3D8',orange:'#C55A11',porange:'#FDEBE0',gray:'#6E6E6E'};
let idx=0;
function rect(x,y,w,h,fill,line='none',r=7,shadow=false){return s.shapes.add({name:`节点_${++idx}`,geometry:r?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1.7},borderRadius:r,...(shadow?{shadow:'1px 2px 3px #000000/20'}:{})});}
function txt(x,y,w,h,text,size=16,color=C.navy,bold=false,align='center'){const q=s.shapes.add({name:`文字_${++idx}`,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=text.split('\n').map(t=>({runs:[t],spaceBefore:0,spaceAfter:0}));q.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};return q;}
function arrow(x,y,w,h,color,geom='rightArrow'){return s.shapes.add({name:`流程箭头_${++idx}`,geometry:geom,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0}});}
function card(x,y,w,h,title,body,color,fill,titleSize=18,bodySize=15){rect(x,y,w,h,fill,color,10,true);txt(x+5,y+9,w-10,30,title,titleSize,color,true);txt(x+6,y+40,w-12,h-48,body,bodySize,C.gray);}
function band(y,h,title,color){rect(251.52,y,679.68,h,'#FFFFFF',color,9,true);rect(258.24,y+6.72,666.24,38.4,color,'none',10,true);txt(276,y+6.72,635,38.4,title,18,'#FFFFFF',true,'left');}
txt(59.52,23.04,614.4,40.32,'子课题3  技术路线图',26.67,C.navy,true,'left');
txt(529.25,28.8,691.2,32.64,'枢纽施工扰动下航运系统波动响应研究',16,C.gray,false,'right');
rect(59.52,71.04,1160.93,1.34,'#BDD7EE','none',0);
rect(34.56,82.56,48,604.8,C.orange,'none',10,true);
txt(34.56,130,48,512,'研\n究\n基\n础\n与\n数\n据\n支\n撑',20,'#FFFFFF',true);
rect(965.76,82.56,48,604.8,C.navy,'none',10,true);
txt(965.76,130,48,512,'成\n果\n输\n出\n与\n集\n成\n支\n撑',20,'#FFFFFF',true);
card(94.08,90.24,124.8,133,'施工扰动\n与通航约束','施工阶段 · 作业范围\n停限航窗口\n通航条件变化',C.orange,'#FFFFFF',15,12.8);
card(94.08,244,124.8,133,'运行与货类\n多源数据','AIS · 到达流\n过坝货量 · 重点货类\n运输时空特征',C.orange,'#FFFFFF',15,12.8);
card(94.08,397.76,124.8,133,'市场与主体\n行为数据','运价 · 成本 · 船期\n运力配置 · 航次安排\n发运与通道选择',C.orange,'#FFFFFF',15,12.8);
card(94.08,551.52,124.8,133,'研究基础\n与背景条件','区域需求 · 网络背景\n空间经济整体模型\n综合交通超级网络',C.orange,'#FFFFFF',15,12.8);
arrow(223,370.56,26.6,52.8,C.orange);
arrow(934,370.56,27.8,52.8,C.blue);
// ① 施工约束 → 供需运行波动 → 服务水平响应。
band(82.56,176.64,'① 施工扰动表征与航运运行波动响应',C.blue);
card(270.72,136.32,190.72,89,'施工扰动表征','阶段 · 范围 · 持续时间\n通航约束与能力折减',C.blue,C.pblue);
card(496,136.32,190.72,89,'供需与组织波动','有效能力 · 需求时空变化\n到达流 · 排队 · 船期',C.blue,C.pblue);
card(721.28,136.32,190.72,89,'运行响应度量','港航作业衔接 · 运输组织\n时效与可靠性变化',C.blue,C.pblue);
arrow(465.28,172,26.88,19.2,C.blue);arrow(690.56,172,26.88,19.2,C.blue);
txt(270.72,230,641.28,23,'方法：施工事件分析 · 基准/扰动情景对照 · 分货类、航线与船型响应识别',13,C.blue);
arrow(584,259.7,15.36,13.6,C.blue,'downArrow');
// ② 直接航运市场与经营经济，主体调整形成反馈。
band(274,195,'② 航运市场与经营经济响应及主体行为反馈',C.green);
card(270.72,328,190.72,89,'成本与经营响应','等待/航行/转运成本\n港航经营收益变化',C.green,C.pgreen);
card(496,328,190.72,89,'运价与市场调整','成本传导 · 供需失衡\n货类/航线/船型差异',C.green,C.pgreen);
card(721.28,328,190.72,89,'主体行为响应','运力配置 · 航次调整\n发运时点 · 通道选择',C.green,C.pgreen);
arrow(465.28,363,26.88,19.2,C.green);arrow(690.56,363,26.88,19.2,C.green);
arrow(306,438,570,7,C.green,'leftArrow');
txt(350,419,505,17,'行为调整反馈至有效运力、到达流与运输需求',12.5,C.green,true);
txt(270.72,446,641.28,20,'方法：运输成本核算 · 运价响应分析 · 离散选择与行为弹性估计',13,C.green);
arrow(584,470,15.36,15,C.green,'downArrow');
// ③ 航运内部网络传播、模块构建与校准检验。
band(486,201.36,'③ 航运波动传播与动态响应模型构建',C.gold);
const xs=[270.72,437.28,603.84,770.4];
card(xs[0],540,141.6,89,'网络传播分析','坝区多通道\n上下游港航网络',C.gold,C.pgold,16,14);
card(xs[1],540,141.6,89,'传播与恢复规律','时滞 · 放大阈值\n积压消散 · 恢复',C.gold,C.pgold,16,14);
card(xs[2],540,141.6,89,'动态响应建模','运行—市场—行为\n耦合反馈模块',C.gold,C.pgold,16,14);
card(xs[3],540,141.6,89,'校准与情景检验','典型历史事件\n多情景 · 敏感性',C.gold,C.pgold,16,14);
for(const x of [414.24,580.8,747.36])arrow(x,575,21.12,17.28,C.gold);
txt(270.72,637,641.28,22,'方法：动态排队理论 · 时变网络 · 离散事件仿真',13,C.gold);
txt(270.72,659,641.28,22,'校验：能力/排队/船期/运价响应 · 参数辨识 · 误差与不确定性评估',12.5,C.gold);
// 右侧输出与子课题五的接口。
card(1027.2,90.24,218.88,107.52,'指标体系与响应规律','能力 · 流量 · 拥堵\n时效 · 可靠性',C.blue,'#F0F6FC',18,15);
card(1027.2,218.88,218.88,107.52,'市场响应与行为参数','成本 · 运价 · 收益变化\n选择弹性 · 调整时滞',C.blue,'#F0F6FC',18,15);
card(1027.2,347.52,218.88,107.52,'波动传播与恢复参数','传播时滞 · 非线性阈值\n积压消散 · 系统恢复',C.blue,'#F0F6FC',18,15);
card(1027.2,476.16,218.88,107.52,'航运动态响应模块','运行—市场—行为耦合\n标准化参数与输入输出接口',C.orange,C.porange,18,15);
for(const y of [201,329.5,458])arrow(1128.96,y,15.36,15.36,C.blue,'downArrow');
rect(1027.2,604.8,218.88,69.12,C.navy,'none',10,true);
txt(1034,609,205,60,'支撑子课题五\n级联模型集成与验证',17,'#FFFFFF',true);
txt(251.52,695,995,18,'研究边界：航运运行、服务及直接市场经营响应；区域经济与产业链响应由相关子课题开展。',12,C.gray,false,'left');
s.speakerNotes.textFrame.setText('依据本项目已讨论确定的子课题三研究内容绘制。研究边界限定为航运运行、运输服务、直接航运市场与经营经济响应，以及其主体行为反馈。子课题一提供多源数据与系统特征，子课题二提供级联机理与关联路径，子课题四开展区域及产业链响应分析，子课题五负责全链条模型集成与整体验证。空间经济整体模型与综合交通超级网络提供区域需求、网络背景和仿真基础；细粒度航运响应模型仍需独立构建、校准及检验。');
await (await PresentationFile.exportPptx(p)).save('new-slide.pptx');
await fs.writeFile('new-slide.png',new Uint8Array(await (await p.export({slide:s,format:'png',scale:1.5})).arrayBuffer()));
await fs.writeFile('new-slide.layout.json',await (await s.export({format:'layout'})).text());
console.log('Added editable roadmap: '+s.shapes.items.length+' native objects');


