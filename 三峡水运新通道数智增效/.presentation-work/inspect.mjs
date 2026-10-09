import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load('../参考资料/子课题3_技术路线图.pptx'));
console.log((await p.inspect({kind:'slide,layout,textbox,shape',maxChars:35000})).ndjson);
await fs.writeFile('source.proto.json',JSON.stringify(p.toProto(),null,2));
await fs.writeFile('source.layout.json',await (await p.slides.items[0].export({format:'layout'})).text());
const b=await p.export({slide:p.slides.items[0],format:'png',scale:1.5});
await fs.writeFile('source.png',new Uint8Array(await b.arrayBuffer()));
console.log(p.help('slides',{search:'duplicate|clone|insert',maxChars:5000}).ndjson);
