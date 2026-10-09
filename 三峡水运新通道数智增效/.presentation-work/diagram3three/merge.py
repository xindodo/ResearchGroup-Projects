from zipfile import ZipFile,ZIP_DEFLATED
from pathlib import Path
from xml.etree import ElementTree as ET
import re,json,hashlib
here=Path(__file__).resolve().parent
with ZipFile(here/'source.pptx') as z: source={n:z.read(n) for n in z.namelist()}
with ZipFile(here/'outputs.pptx') as z: donor=z.read('ppt/slides/slide1.xml').decode('utf-8')
slide=source['ppt/slides/slide3.xml'].decode('utf-8')
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
old=ET.fromstring(slide)
remove=set()
for sp in old.findall('.//p:sp',ns):
    off=sp.find('p:spPr/a:xfrm/a:off',ns)
    if off is not None and int(off.attrib['x'])>1020*9525:
        remove.add(sp.find('p:nvSpPr/p:cNvPr',ns).attrib['id'])
assert len(remove)==27,remove
def retain(m):
    b=m.group(0)
    sid=re.search(r'<p:cNvPr\b[^>]*\bid="(\d+)"',b).group(1)
    return '' if sid in remove else b
slide=re.sub(r'<p:sp\b[\s\S]*?</p:sp>',retain,slide)
blocks=re.findall(r'<p:sp\b[\s\S]*?</p:sp>',donor)
assert len(blocks)==9
for i,b in enumerate(blocks):
    blocks[i]=re.sub(r'(<p:cNvPr\b[^>]*\bid=")\d+("\s)',lambda m:m[1]+str(2000+i)+m[2],b,count=1)
slide=slide.replace('</p:spTree>',''.join(blocks)+'</p:spTree>',1)
result=dict(source);result['ppt/slides/slide3.xml']=slide.encode('utf-8')
new=ET.fromstring(slide)
new_ids={n.attrib['id'] for n in new.findall('.//p:cNvPr',ns)}
assert not (new_ids & remove)
assert len(new_ids)==len(new.findall('.//p:cNvPr',ns))
new_map={v.find('p:nvSpPr/p:cNvPr',ns).attrib['id']:v for v in new.findall('.//p:sp',ns)}
for v in old.findall('.//p:sp',ns):
    sid=v.find('p:nvSpPr/p:cNvPr',ns).attrib['id']
    if sid not in remove:assert ET.tostring(v)==ET.tostring(new_map[sid]),sid
assert [n for n in source if source[n]!=result[n]]==['ppt/slides/slide3.xml']
with ZipFile(here/'candidate.pptx','w',ZIP_DEFLATED) as z:
    for n,d in result.items():z.writestr(n,d)
report={'changedOriginalParts':['ppt/slides/slide3.xml'],'originalSlidesPreserved':[1,2],'thirdSlideResearchFlowPreserved':True,'coreDeliverables':3,'sourceSha256':hashlib.sha256((here/'source.pptx').read_bytes()).hexdigest()}
(here/'preservation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
