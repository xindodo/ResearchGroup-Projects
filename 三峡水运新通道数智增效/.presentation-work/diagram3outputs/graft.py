from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from xml.etree import ElementTree as ET
import re,json,hashlib

here=Path(__file__).resolve().parent
with ZipFile(here/'source.pptx') as z: original={n:z.read(n) for n in z.namelist()}
with ZipFile(here/'authored.pptx') as z: authored=z.read('ppt/slides/slide3.xml').decode('utf-8')
source=original['ppt/slides/slide3.xml'].decode('utf-8')
changes=json.loads((here/'changes.json').read_text(encoding='utf-8'))
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
blocks=re.findall(r'<p:sp\b[\s\S]*?</p:sp>',authored)
by_name={ET.fromstring(b.replace('<p:sp>', '<p:sp xmlns:p="'+ns['p']+'" xmlns:a="'+ns['a']+'">',1)).find('p:nvSpPr/p:cNvPr',ns).attrib['name']:b for b in blocks}
updated=set()
def graft(match):
    block=match.group(0)
    for c in changes:
        if re.search(r'<p:cNvPr\b[^>]*\bid="'+c['sourceShapeId']+'"',block):
            donor=by_name[c['name']]
            for tag in ['p:txBody','a:xfrm']:
                pattern=r'<'+tag+r'\b[\s\S]*?</'+tag+'>'
                value=re.search(pattern,donor).group(0)
                block,count=re.subn(pattern,lambda _:value,block,count=1)
                assert count==1,(c['name'],tag)
            updated.add(c['sourceShapeId'])
            break
    return block
result=dict(original)
result['ppt/slides/slide3.xml']=re.sub(r'<p:sp\b[\s\S]*?</p:sp>',graft,source).encode('utf-8')
assert len(updated)==14,updated
# Preserve SharePoint metadata bytes with presentation-local aliases. The
# bundled chart discovery gate accepts internal presentation parts under ppt/.
rels=ET.fromstring(result['ppt/_rels/presentation.xml.rels'])
ct=ET.fromstring(result['[Content_Types].xml'])
ctnames={n.attrib.get('PartName') for n in ct}
for name,data in list(result.items()):
    if name.startswith('customXml/'): result['ppt/'+name]=data
for rel in rels:
    if rel.attrib.get('Type','').endswith('/customXml') and rel.attrib['Target'].startswith('../customXml/'):
        rel.attrib['Target']=rel.attrib['Target'][3:]
for node in list(ct):
    part=node.attrib.get('PartName','')
    if part.startswith('/customXml/') and '/ppt'+part not in ctnames:
        ET.SubElement(ct,node.tag,{**node.attrib,'PartName':'/ppt'+part})
ET.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/relationships')
result['ppt/_rels/presentation.xml.rels']=ET.tostring(rels,encoding='utf-8',xml_declaration=True)
ET.register_namespace('', 'http://schemas.openxmlformats.org/package/2006/content-types')
result['[Content_Types].xml']=ET.tostring(ct,encoding='utf-8',xml_declaration=True)
# Native text and frame grafts retain all original shapes, IDs and relationships.
with ZipFile(here/'candidate.pptx','w',ZIP_DEFLATED) as z:
    for n,d in result.items(): z.writestr(n,d)
old=ET.fromstring(original['ppt/slides/slide3.xml']);new=ET.fromstring(result['ppt/slides/slide3.xml'])
oldsp=old.findall('.//p:sp',ns);newsp=new.findall('.//p:sp',ns)
assert len(oldsp)==len(newsp)
for a,b in zip(oldsp,newsp):
    sid=a.find('p:nvSpPr/p:cNvPr',ns).attrib['id']
    if sid not in updated: assert ET.tostring(a)==ET.tostring(b),sid
changed=[n for n in original if original[n]!=result[n]]
assert set(changed)<= {'ppt/slides/slide3.xml','ppt/_rels/presentation.xml.rels','[Content_Types].xml'},changed
report={'changedOriginalParts':changed,'originalSlidesPreserved':[1,2],'thirdSlideUnchangedShapesPreserved':len(oldsp)-14,'updatedNativeTextboxes':14,'sourceSha256':hashlib.sha256((here/'source.pptx').read_bytes()).hexdigest()}
(here/'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
