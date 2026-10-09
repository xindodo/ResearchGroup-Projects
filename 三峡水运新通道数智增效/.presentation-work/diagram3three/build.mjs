import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const p=Presentation.create({slideSize:{width:1280,height:2645.666666666667}});
const s=p.slides.add();s.background.fill='#FFFFFF';
let id=0;
function text(x,y,w,h,t,size,color,bold){
 const q=s.shapes.add({name:`成果文字_${++id}`,geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 q.text=t.split('\n').map(v=>({runs:[v],spaceBefore:0,spaceAfter:0}));
 q.text.style={typeface:'微软雅黑',fontSize:size,color,bold,alignment:'center',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};
}
const outputs=[
 [340,155,'航运能力与需求\n耦合响应模型','耦合通航能力与需求\n刻画排队与服务变化'],
 [930,155,'运输组织调整与\n运行反馈模型','刻画航次与发运调整\n反馈运力与到达变化'],
 [1480,175,'航运波动传播与\n动态推演技术','集成航运动态响应模型\n推演波动传播与恢复\n完成模型校准与验证'],
];
for(const [y,h,title,body] of outputs){
 s.shapes.add({name:`核心成果_${++id}`,geometry:'roundRect',position:{left:1027.2,top:y,width:218.88,height:h},fill:'#F0F6FC',line:{fill:'#2E75B6',width:1.7},borderRadius:10,shadow:'1px 2px 3px #000000/18'});
 text(1035.2,y+7,202.88,54,title,20,'#2E75B6',true);
 text(1038.2,y+67,196.88,h-75,body,18,'#666666',false);
}
await (await PresentationFile.exportPptx(p)).save('outputs.pptx');
await fs.writeFile('outputs.json',JSON.stringify(outputs,null,2));
console.log(JSON.stringify({coreDeliverables:outputs.length,nativeObjects:s.shapes.items.length}));
