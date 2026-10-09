import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const skill='C:/Users/xindodo/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const workspace=path.resolve('..');
const source=path.join(workspace,'参考资料/子课题3_技术路线图.pptx');
const final=path.join(workspace,'.presentation-output/子课题3_技术路线图_已追加.pptx');
process.env.RUNTIME_NODE_MODULES='C:/Users/xindodo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
await fs.mkdir(path.dirname(final),{recursive:true});
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')));
const result=await finalizePresentation({
  workspaceDir:workspace,candidatePath:path.resolve('candidate.pptx'),finalPath:final,
  pythonExecutable:'C:/Users/xindodo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
  explicitTotalSlideCount:2,
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
  fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
  verifyArtifactToolImport:true,
  receiptPath:path.resolve('validation.json')
});
console.log(JSON.stringify(result,null,2));
const p=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<p.slides.items.length;i++){
 const img=await p.export({slide:p.slides.items[i],format:'png',scale:1.5});
 await fs.writeFile(`final-${i+1}.png`,new Uint8Array(await img.arrayBuffer()));
}
await fs.writeFile('final.inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape',maxChars:50000})).ndjson);
