import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const H=2645.666666666667;
const p=Presentation.create({slideSize:{width:1280,height:H}});
const s=p.slides.add(); s.background.fill='#FFFFFF';
const C={navy:'#1F4E79',blue:'#2E75B6',pblue:'#DEEBF7',green:'#21864B',pgreen:'#E5F1E9',gold:'#BF8F00',pgold:'#FCF3D8',orange:'#C55A11',gray:'#666666'};
let id=0;const meta=[];
function rect(x,y,w,h,fill,line='none',r=8,shadow=false,name='容器'){
 return s.shapes.add({name:`${name}_${++id}`,geometry:r?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1.7},borderRadius:r,...(shadow?{shadow:'1px 2px 3px #000000/18'}:{})});
}
function text(x,y,w,h,t,size=18,color=C.gray,bold=false,align='center',name='文字'){
 const q=s.shapes.add({name:`${name}_${++id}`,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=t.split('\n').map(v=>({runs:[v],spaceBefore:0,spaceAfter:0}));
 q.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};
 meta.push({name:q.name,text:t,x,y,w,h,size});return q;
}
function arrow(x,y,w,h,color=C.blue,geom='rightArrow'){
 return s.shapes.add({name:`流程箭头_${++id}`,geometry:geom,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0}});
}
function line(x1,y1,x2,y2,color,width=2){return rect(Math.min(x1,x2),Math.min(y1,y2),Math.max(Math.abs(x2-x1),width),Math.max(Math.abs(y2-y1),width),color,'none',0,false,'连接线');}
function down(x,y,h=22,color=C.blue){return arrow(x-8,y,16,h,color,'downArrow');}
function card(x,y,w,h,title,body,color,fill,titleSize=20,bodySize=18,titleH=36){
 rect(x,y,w,h,fill,color,10,true,title.replace(/\n/g,' '));
 text(x+8,y+9,w-16,titleH,title,titleSize,color,true);
 text(x+11,y+titleH+19,w-22,h-titleH-31,body,bodySize,C.gray);
}
function subcard(x,y,w,h,title,body,color,fill){card(x,y,w,h,title,body,color,fill,19,17.5,27);}
function band(y,h,title,color){rect(251.52,y,679.68,h,'#FFFFFF',color,10,true,'研究模块');rect(258.24,y+6.72,666.24,42,color,'none',10,true,'模块标题背景');text(277,y+7,634,40,title,21,'#FFFFFF',true,'left','模块标题');}
function join(y,left=421,right=762,center=592,color=C.blue){line(left,y,left,y+16,color);line(right,y,right,y+16,color);line(left,y+16,right,y+16,color);down(center,y+17,21,color);}
function fork(y,color=C.blue){line(592,y-12,592,y,color);line(421,y,762,y,color);down(421,y+1,20,color);down(762,y+1,20,color);}

// The third slide retains the source palette, typeface, canvas and column system.
text(59.52,22,570,42,'子课题3  技术路线图',26.67,C.navy,true,'left','总标题');
text(610,28,610,33,'枢纽施工扰动下航运系统波动响应研究',16,C.gray,false,'right','子课题名称');
rect(59.52,72,1160.93,1.5,'#BDD7EE','none',0);
rect(34.56,83,48,2476,C.orange,'none',10,true,'数据侧栏');
rect(965.76,83,48,2476,C.navy,'none',10,true,'成果侧栏');
for(const y of [300,1130,2010]){
 text(34.56,y,48,250,'数\n据\n输\n入',22,'#FFFFFF',true);
 text(965.76,y,48,250,'研\n究\n成\n果',22,'#FFFFFF',true);
}

// Inputs contain data only. No foundation or cross-subtask coordination card.
card(94.08,145,124.8,250,'施工与\n通航条件','施工方案\n工期与检修\n停限航窗口\n设施与船型\n放行规则',C.orange,'#FFFFFF',17,16,46);
card(94.08,445,124.8,335,'运行与\n运输需求','船舶轨迹\n到达与通过量\n排队与船期\n港口作业\n货类与流向\n发运与交付\n替代通道',C.orange,'#FFFFFF',17,16,46);
card(94.08,830,124.8,220,'常态运行\n与外部条件','无施工基准\n水文与天气\n季节性需求\n初始负荷',C.orange,'#FFFFFF',17,16,46);
card(94.08,1120,124.8,300,'运输组织\n记录','航次与待闸\n船型与通道\n发运与到达\n港航衔接\n组织调整记录',C.orange,'#FFFFFF',17,16,46);
card(94.08,1830,124.8,360,'典型事件\n与检验数据','施工检修事件\n前后运行记录\n到达与排队\n船期与交付\n独立检验事件\n数据口径核对',C.orange,'#FFFFFF',17,16,46);

// ① Parallel capacity and demand characterization, without research-method text.
band(83,912,'① 施工扰动与航运运行响应',C.blue);
card(270.72,145,190.72,160,'施工扰动表征','阶段、范围与强度\n工期、检修与恢复',C.blue,C.pblue,20,18);
card(496,145,190.72,160,'通航约束变化','通航时间与放行规则\n设施可用与船型限制',C.blue,C.pblue,20,18);
card(721.28,145,190.72,160,'施工扰动情景','常态与施工情景\n水文与需求叠加',C.blue,C.pblue,20,18);
arrow(465.28,212,26.88,20,C.blue);arrow(690.56,212,26.88,20,C.blue);
// Scenario output feeds both branches.
line(816.64,307,816.64,341,C.blue);line(592,341,816.64,341,C.blue);
fork(356,C.blue);
rect(270.72,378,300.48,333,'#F6FAFE',C.blue,9);
rect(611.52,378,300.48,333,'#F6FAFE',C.blue,9);
text(280,387,281,31,'运输能力变化',21,C.blue,true);
text(621,387,281,31,'需求与到达变化',21,C.blue,true);
subcard(280,432,281,81,'能力约束','航道、船闸与船舶运力',C.blue,C.pblue);
subcard(280,525,281,81,'能力折减','折减幅度与持续时间',C.blue,C.pblue);
subcard(280,618,281,81,'时空差异','能力恢复与瓶颈分布',C.blue,C.pblue);
subcard(621,432,281,81,'需求与到达','货类、流向与到达节奏\n区分需求与实际流量',C.blue,C.pblue);
subcard(621,525,281,81,'常态波动','周期、季节与突发变化',C.blue,C.pblue);
subcard(621,618,281,81,'施工影响','变化幅度、时滞与货类差异',C.blue,C.pblue);
join(727);
card(270.72,773,641.28,184,'供需失配与运输服务响应','通过量与货物积压\n排队等待与船期偏移\n港航衔接、运输时效与交付可靠性',C.blue,C.pblue,21,20,38);
down(592,998,12,C.blue);

// ② A deliberately bounded operating-adaptation component, not market economics.
band(1012,476,'② 运输组织调整与运行反馈',C.green);
card(270.72,1070,641.28,73,'通航限制与运输服务变化','待闸、船期与港航衔接变化',C.green,C.pgreen,20,18,26);
fork(1158,C.green);
card(270.72,1182,300.48,166,'船舶组织调整','航次与待闸安排\n船型及通道变化\n港航作业衔接',C.green,C.pgreen,21,19,34);
card(611.52,1182,300.48,166,'货物发运调整','提前或延后发运\n到达节奏变化\n受限货流转移',C.green,C.pgreen,21,19,34);
join(1357,421,762,592,C.green);
card(270.72,1399,641.28,75,'组织调整对运行的反馈','更新运力、到达流与货类运输时序',C.green,C.pgreen,20,18,26);
// Feedback represents recorded or scenario-specified adjustments, not choice optimization.
line(270.72,1437,239,1437,C.green);line(239,1437,239,472,C.green);line(239,472,254,472,C.green);arrow(254,465,16,16,C.green);
line(912,1437,947,1437,C.green);line(947,1437,947,472,C.green);line(930,472,947,472,C.green);arrow(912,465,18,16,C.green,'leftArrow');
rect(224,1112,26,100,'#FFFFFF','none',0);rect(934,1112,26,100,'#FFFFFF','none',0);
text(225,1112,25,100,'运\n力\n反\n馈',14,C.green,true);text(935,1112,25,100,'到\n达\n反\n馈',14,C.green,true);
down(592,1491,14,C.green);

// ③ Model development remains a research task; named methods/algorithms are omitted.
band(1508,964,'③ 航运波动传播与动态响应模型构建',C.gold);
card(270.72,1567,641.28,93,'波动传播与恢复特征','坝区多通道与上下游传播\n波动时滞、放大与恢复',C.gold,C.pgold,21,19,28);
down(592,1665,24,C.gold);
card(270.72,1694,641.28,121,'航运动态响应模型','能力、需求、排队与组织调整联动\n区分实际流量、积压与未满足需求',C.gold,C.pgold,21,19,34);
fork(1831,C.gold);
card(270.72,1855,300.48,170,'典型事件校准','能力与到达参数\n排队与组织调整参数\n参数来源与适用范围',C.gold,C.pgold,20,19,34);
card(611.52,1855,300.48,170,'独立事件检验','通过量与等待时间\n船期偏移与传播时滞\n误差与模型修正',C.gold,C.pgold,20,19,34);
line(270.72,1940,239,1940,C.gold);line(239,1940,239,1754,C.gold);line(239,1754,254,1754,C.gold);arrow(254,1747,16,16,C.gold);
line(912,1940,947,1940,C.gold);line(947,1940,947,1754,C.gold);line(930,1754,947,1754,C.gold);arrow(912,1747,18,16,C.gold,'leftArrow');
rect(224,1820,26,100,'#FFFFFF','none',0);rect(934,1820,26,100,'#FFFFFF','none',0);
text(225,1820,25,100,'参\n数\n修\n正',14,C.gold,true);text(935,1820,25,100,'模\n型\n修\n正',14,C.gold,true);
join(2035,421,762,592,C.gold);
card(270.72,2075,641.28,117,'多情景传播与恢复响应','不同施工强度、工期、负荷与通道条件\n传播范围、瓶颈转移与组织适应',C.gold,C.pgold,21,19,34);
down(592,2199,25,C.gold);
card(270.72,2230,190.72,180,'供需失配与阈值','持续积压条件\n波动放大阈值\n扰动累积效应',C.gold,C.pgold,18.5,18,32);
card(496,2230,190.72,180,'积压消散与恢复','积压消散速度\n运输服务恢复时间\n累计服务损失',C.gold,C.pgold,18.5,18,32);
card(721.28,2230,190.72,180,'响应差异与边界','关键影响因素\n货类与通道差异\n模型适用范围',C.gold,C.pgold,18.5,18,32);

// Results only: no working-foundation or subtask-coordination content.
const outputs=[
 [145,215,'施工情景与能力变化','通航约束与能力折减\n持续时间与恢复过程'],
 [428,225,'需求与到达变化','常态需求特征\n施工影响幅度与时滞'],
 [754,220,'运行与服务响应','通过量、积压与等待\n船期、时效与可靠性'],
 [1140,305,'组织调整与反馈','航次与发运调整\n运力与到达变化\n调整幅度与响应时滞'],
 [1620,225,'传播与恢复规律','传播范围与时滞\n放大阈值与恢复过程'],
 [1940,225,'响应模型与参数','航运动态响应模块\n运行参数与适用范围'],
 [2250,200,'模型检验结果','运行指标误差\n典型情景适用性'],
];
for(const [y,h,t,b] of outputs)card(1027.2,y,218.88,h,t,b,C.blue,'#F0F6FC',19,18,42);
for(const [y,h] of [[377,35],[674,59],[994,124],[1470,127],[1867,53],[2184,48]])down(1137,y,h,C.blue);
text(251.52,2490,679.68,60,'研究边界：航运能力、需求、拥堵、运输组织与服务响应',17,C.gray,false,'center','研究边界');
s.speakerNotes.textFrame.setText('第三页为研究范围收缩后的技术路线，第一、二页原图保留。根据用户要求，删去可见研究方法、算法名称和工作基础及子课题协同内容，缩短全图文字。子课题三仅研究施工扰动下能力、需求、排队拥堵、运输组织、时效可靠性、传播与恢复。第二部分改为运输组织调整与运行反馈，使用记录或预设情景刻画航次、待闸、船型、通道、发运时点与到达节奏变化，分析其运行影响，不承担独立运价预测、成本收益评估、复杂主体行为选择建模或多式联运优化。建议的任务衔接为：子课题一统筹公共市场与运行数据；子课题二分析成本、运价和市场行为在施工—航运—产业全链条中的传导机理；子课题四结合场景开展港航经营及产业、区域经济影响分析；子课题五依据前述研究集成必要的市场—产业反馈并开展整体验证。该分工是本次收缩范围的建议，需要课题组落实，不表述为其他子课题已接受的任务。第三页不把运价、收益或价格驱动行为作为子课题三的独立研究任务。');
await (await PresentationFile.exportPptx(p)).save('new-slide.pptx');
await fs.writeFile('new-slide.png',new Uint8Array(await (await s.export({format:'png',scale:1})).arrayBuffer()));
await fs.writeFile('new-slide.layout.json',await (await s.export({format:'layout'})).text());
await fs.writeFile('new-slide.text.json',JSON.stringify(meta,null,2));
console.log(JSON.stringify({objects:s.shapes.items.length,textBlocks:meta.length,width:1280,height:H}));
