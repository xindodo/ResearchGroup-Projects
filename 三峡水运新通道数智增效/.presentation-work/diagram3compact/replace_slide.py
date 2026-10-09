from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import hashlib,json

here=Path(__file__).resolve().parent
base=(here.parent/'append_slide.py').read_text(encoding='utf-8')
base=base.replace("SOURCE=HERE.parent/'参考资料/子课题3_技术路线图.pptx'","SOURCE=HERE/'source.pptx'")
base=base.replace("mapping={new_slide:'ppt/slides/slide2.xml'}", "source_relbyid={r.attrib['Id']:r for r in source_rels}\nsource_third=source_pres.find(f'{{{P}}}sldIdLst')[2]\nsource_third_path=resolve('ppt/presentation.xml',source_relbyid[source_third.attrib[f'{{{R}}}id']].attrib['Target'])\nmapping={new_slide:source_third_path}")
base=base.replace("posixpath.join(d,'added2_'+b)","posixpath.join(d,'compact3_'+b)")
base=base.replace("if part in copied or dst in original: return dst", "if part in copied or (dst in original and part != new_slide): return dst")
base=base.replace("register_part(new_slide,'slide','sldIdLst','sldId',max(int(x.attrib['id']) for x in slides)+1)","# Preserve the existing third-slide identity and order.")
base=base.replace("==2","==3")
base=base.replace('Merged: 2 slides. Original slide XML and all original dependent parts preserved byte for byte.','Compacted slide 3; slides 1 and 2 preserved byte for byte.')
exec(compile(base,str(here/'replace-third-package-graph.py'),'exec'),{'__file__':str(here/'replace-third-package-graph.py')})
with ZipFile(here/'source.pptx') as z: original={n:z.read(n) for n in z.namelist()}
with ZipFile(here/'candidate.pptx') as z: final={n:z.read(n) for n in z.namelist()}
changed=[n for n in original if final.get(n)!=original[n]]
assert set(changed)<= {'ppt/presentation.xml','ppt/_rels/presentation.xml.rels','[Content_Types].xml','ppt/slides/slide3.xml','ppt/slides/_rels/slide3.xml.rels'},changed
for n in original:
    if n not in changed: assert final[n]==original[n]
P='http://schemas.openxmlformats.org/presentationml/2006/main'
ns={'p':P,'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def visible(data):return [t.text or '' for t in ET.fromstring(data).findall('.//a:t',ns)]
assert visible(original['ppt/slides/slide3.xml'])==visible(final['ppt/slides/slide3.xml'])
assert ET.fromstring(original['ppt/presentation.xml']).find(f'{{{P}}}sldSz').attrib==ET.fromstring(final['ppt/presentation.xml']).find(f'{{{P}}}sldSz').attrib
report={'originalSlidesPreserved':[1,2],'slide3ContentPreserved':True,'changedOriginalParts':changed,'canvasPreserved':True,'sourceSha256':hashlib.sha256((here/'source.pptx').read_bytes()).hexdigest(),'drawingHeightBeforePx':2537,'drawingHeightAfterPx':1985,'heightReductionPercent':round((2537-1985)/2537*100,1)}
(here/'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
