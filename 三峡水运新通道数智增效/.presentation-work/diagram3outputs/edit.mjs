import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('source.pptx'));
const entries=(await p.inspect({kind:'textbox',maxChars:180000})).ndjson.split('\n').filter(Boolean).map(x=>JSON.parse(x));
const outputs=[
 [163,'施工扰动与通航能力\n动态映射模型','表征能力折减幅度\n刻画持续与恢复过程'],
 [166,'航运需求波动\n响应模型','刻画需求与到达变化\n量化响应幅度与时滞'],
 [169,'运输服务波动响应\n评估技术','评估排队、船期及时效\n量化交付可靠性变化'],
 [172,'运输组织调整与\n运行反馈模型','联动航次与发运调整\n更新运力与到达过程'],
 [175,'航运波动传播与\n恢复评估技术','识别传播放大阈值\n评估积压消散与恢复'],
 [178,'枢纽施工扰动下\n航运动态响应模型','集成能力、需求与组织\n提供航运响应模块'],
 [181,'航运响应模型\n校准与验证技术','支持典型事件校准\n检验跨情景适用性'],
];
const changes=[];
for(const [n,title,body] of outputs){
 for(const [offset,t] of [[0,title],[1,body]]){
  const original=entries.find(e=>e.slide===3 && e.name===`文字_${n+offset}`);
  if(!original)throw new Error(`Missing source anchor ${n+offset}`);
  const q=p.resolve(original.id);const [left,top,width,height]=original.bbox;
  q.text=t.split('\n').map(line=>({runs:[line],spaceBefore:0,spaceAfter:0}));
  q.text.style={typeface:'微软雅黑',fontSize:offset?18:19,color:offset?'#666666':'#2E75B6',bold:!offset,alignment:'center',verticalAlignment:'middle',autoFit:'none',wrap:'square',insets:{left:0,right:0,top:0,bottom:0}};
  q.position={left,top:top+(offset?16:0),width,height:height+(offset?-16:16)};
  changes.push({name:original.name,sourceShapeId:String(n+offset),before:original.text,after:t});
 }
}
await fs.writeFile('changes.json',JSON.stringify(changes,null,2));
await (await PresentationFile.exportPptx(p)).save('authored.pptx');
await fs.writeFile('authored-3.png',new Uint8Array(await (await p.slides.items[2].export({format:'png',scale:1})).arrayBuffer()));
await fs.writeFile('authored.inspect.ndjson',(await p.inspect({kind:'textbox,shape',maxChars:180000})).ndjson);
console.log(JSON.stringify({updatedTextboxes:changes.length}));
