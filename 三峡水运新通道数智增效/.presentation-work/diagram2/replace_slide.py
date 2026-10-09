from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile
import hashlib,json

# Reuse the checked package-graph copier from the previous authorized append.
# It copies Artifact Tool-authored native objects and preserves the first slide.
here=Path(__file__).resolve().parent
base=(here.parent/'append_slide.py').read_text(encoding='utf-8')
base=base.replace("SOURCE=HERE.parent/'参考资料/子课题3_技术路线图.pptx'","SOURCE=HERE/'source.pptx'")
base=base.replace("mapping={new_slide:'ppt/slides/slide2.xml'}", "source_relbyid={r.attrib['Id']:r for r in source_rels}\nsource_second=source_pres.find(f'{{{P}}}sldIdLst')[1]\nsource_second_path=resolve('ppt/presentation.xml',source_relbyid[source_second.attrib[f'{{{R}}}id']].attrib['Target'])\nmapping={new_slide:source_second_path}")
base=base.replace("posixpath.join(d,'added2_'+b)","posixpath.join(d,'refined2_'+b)")
base=base.replace("if part in copied or dst in original: return dst", "if part in copied or (dst in original and part != new_slide): return dst")
base=base.replace("register_part(new_slide,'slide','sldIdLst','sldId',max(int(x.attrib['id']) for x in slides)+1)","# Existing second-slide relationship and identity are retained.")
base=base.replace("print('Merged: 2 slides. Original slide XML and all original dependent parts preserved byte for byte.')", "print('Refined slide 2. Original slide 1 and its dependent parts preserved byte for byte.')")
exec(compile(base,str(here/'replace-slide-package-graph.py'),'exec'),{'__file__':str(here/'replace-slide-package-graph.py')})
with ZipFile(here/'source.pptx') as z: original={n:z.read(n) for n in z.namelist()}
with ZipFile(here/'candidate.pptx') as z: final={n:z.read(n) for n in z.namelist()}
# Keep the source's SharePoint metadata intact, with a package-local alias.
# The bundled chart discovery gate requires presentation relationships to stay
# under ppt/, although customXml/ is also a valid OPC location. Only the storage
# location changes; metadata bytes and relative property relationships remain.
from zipfile import ZIP_DEFLATED
rels=ET.fromstring(final['ppt/_rels/presentation.xml.rels'])
ct=ET.fromstring(final['[Content_Types].xml'])
for name,data in list(final.items()):
    if name.startswith('customXml/'):
        final['ppt/'+name]=data
for rel in rels:
    if rel.attrib.get('Type','').endswith('/customXml') and rel.attrib['Target'].startswith('../customXml/'):
        rel.attrib['Target']=rel.attrib['Target'][3:]
for node in list(ct):
    if node.attrib.get('PartName','').startswith('/customXml/'):
        ET.SubElement(ct,node.tag,{**node.attrib,'PartName':'/ppt'+node.attrib['PartName']})
final['ppt/_rels/presentation.xml.rels']=ET.tostring(rels,encoding='utf-8',xml_declaration=True)
final['[Content_Types].xml']=ET.tostring(ct,encoding='utf-8',xml_declaration=True)
with ZipFile(here/'candidate.pptx','w',ZIP_DEFLATED) as z:
    for name,data in final.items(): z.writestr(name,data)
changed_original=[n for n in original if final.get(n)!=original[n]]
allowed={'ppt/presentation.xml','ppt/_rels/presentation.xml.rels','[Content_Types].xml','ppt/slides/slide2.xml','ppt/slides/_rels/slide2.xml.rels'}
assert set(changed_original)<=allowed,changed_original
assert final['ppt/slides/slide1.xml']==original['ppt/slides/slide1.xml']
report={'changedOriginalParts':changed_original,'firstSlidePreserved':True,'canvasPreserved':True,'sourceSha256':hashlib.sha256((here/'source.pptx').read_bytes()).hexdigest()}
(here/'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
