import fs from 'node:fs/promises';
import {PresentationFile,FileBlob} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('source.pptx'));
await fs.writeFile('source.inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape,notes',maxChars:180000})).ndjson);
await fs.writeFile('source.proto.json',JSON.stringify(p.toProto()));
for(let i=0;i<p.slides.items.length;i++)await fs.writeFile(`before-${i+1}.png`,new Uint8Array(await (await p.slides.items[i].export({format:'png',scale:1})).arrayBuffer()));
console.log(JSON.stringify({slideCount:p.slides.items.length,size:p.toProto().slideSize}));
