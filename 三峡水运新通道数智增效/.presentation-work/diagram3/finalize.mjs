import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const skill='C:/Users/xindodo/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const workspace=path.resolve('../..');
const source=path.resolve('source.pptx');
process.env.RUNTIME_NODE_MODULES='C:/Users/xindodo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const final=path.join(workspace,'.presentation-output/子课题3_技术路线图2_新增第三页.pptx');
await fs.mkdir(path.dirname(final),{recursive:true});
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')));
const result=await finalizePresentation({
 workspaceDir:workspace,candidatePath:path.resolve('candidate.pptx'),finalPath:final,
 pythonExecutable:'C:/Users/xindodo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 explicitTotalSlideCount:3,
 layoutArgs:['--expected-slide-size-emu','12192000,25199975','--validate-bullet-geometry','--validate-heading-fit'],
 fontPolicy:{basis:'reference',families:['微软雅黑'],referencePath:source,referenceSha256:createHash('sha256').update(await fs.readFile(source)).digest('hex')},
 verifyArtifactToolImport:true,receiptPath:path.resolve('validation.json')
});
console.log(JSON.stringify(result,null,2));
const p=await PresentationFile.importPptx(await FileBlob.load(final));
for(let i=0;i<3;i++){
 const b=await p.slides.items[i].export({format:'png',scale:1});
 await fs.writeFile(`final-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));
}
await fs.writeFile('final.inspect.ndjson',(await p.inspect({kind:'slide,textbox,shape,notes',maxChars:95000})).ndjson);
