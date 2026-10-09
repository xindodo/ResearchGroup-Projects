import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('source.pptx'));
await fs.writeFile('source.inspect.ndjson',(await p.inspect({kind:'slide,layout,textbox,shape',maxChars:65000})).ndjson);
await fs.writeFile('source.proto.json',JSON.stringify(p.toProto()));
for(let i=0;i<2;i++){
 const b=await p.slides.items[i].export({format:'png',scale:0.75});
 await fs.writeFile(`before-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));
}
console.log(p.slides.items.map(x=>x.frame));
