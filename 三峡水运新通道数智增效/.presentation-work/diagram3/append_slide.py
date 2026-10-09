from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import hashlib,json

# Append the Artifact Tool-authored native slide, retaining all original parts.
here=Path(__file__).resolve().parent
base=(here.parent/'append_slide.py').read_text(encoding='utf-8')
base=base.replace("SOURCE=HERE.parent/'参考资料/子课题3_技术路线图.pptx'","SOURCE=HERE/'source.pptx'")
base=base.replace("mapping={new_slide:'ppt/slides/slide2.xml'}","mapping={new_slide:'ppt/slides/slide3.xml'}")
base=base.replace("posixpath.join(d,'added2_'+b)","posixpath.join(d,'focused3_'+b)")
base=base.replace("==2","==3")
base=base.replace('Merged: 2 slides. Original slide XML and all original dependent parts preserved byte for byte.','Appended focused slide 3. Slides 1 and 2 and their dependent parts preserved byte for byte.')
exec(compile(base,str(here/'append-third-package-graph.py'),'exec'),{'__file__':str(here/'append-third-package-graph.py')})
with ZipFile(here/'source.pptx') as z: original={n:z.read(n) for n in z.namelist()}
with ZipFile(here/'candidate.pptx') as z: final={n:z.read(n) for n in z.namelist()}
changed=[n for n in original if final.get(n)!=original[n]]
assert set(changed)<= {'ppt/presentation.xml','ppt/_rels/presentation.xml.rels','[Content_Types].xml'},changed
for n in original:
    if n not in changed: assert final[n]==original[n]
P='http://schemas.openxmlformats.org/presentationml/2006/main'
assert ET.fromstring(original['ppt/presentation.xml']).find(f'{{{P}}}sldSz').attrib==ET.fromstring(final['ppt/presentation.xml']).find(f'{{{P}}}sldSz').attrib
ns={'p':P,'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
third=ET.fromstring(final['ppt/slides/slide3.xml'])
visible='\n'.join(t.text or '' for t in third.findall('.//a:t',ns))
for forbidden in ['方法：','动态排队','离散选择','工作基础','子课题协同','经营收益','运价响应','市场响应']:
    assert forbidden not in visible,forbidden
report={'originalSlidesPreserved':[1,2],'changedOriginalParts':changed,'canvasPreserved':True,'sourceSha256':hashlib.sha256((here/'source.pptx').read_bytes()).hexdigest(),'slide3NativeShapes':len(third.findall('.//p:sp',ns)),'slide3Pictures':len(third.findall('.//p:pic',ns))}
(here/'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
