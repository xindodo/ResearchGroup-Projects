from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import posixpath, hashlib
import xml.etree.ElementTree as ET

HERE=Path(__file__).resolve().parent
SOURCE=HERE.parent/'参考资料/子课题3_技术路线图.pptx'
NEW=HERE/'new-slide.pptx'
OUT=HERE/'candidate.pptx'
P='http://schemas.openxmlformats.org/presentationml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
CT='http://schemas.openxmlformats.org/package/2006/content-types'
ET.register_namespace('p',P); ET.register_namespace('r',R)

def relpath(part):
    folder,base=posixpath.split(part)
    return posixpath.join(folder,'_rels',base+'.rels')
def resolve(part,target):
    return posixpath.normpath(posixpath.join(posixpath.dirname(part),target)).lstrip('/')
def xmlbytes(root): return ET.tostring(root,encoding='utf-8',xml_declaration=True)

with ZipFile(SOURCE) as z:
    original={i.filename:z.read(i.filename) for i in z.infolist()}
with ZipFile(NEW) as z:
    addon={i.filename:z.read(i.filename) for i in z.infolist()}
result=dict(original)
source_pres=ET.fromstring(original['ppt/presentation.xml'])
source_rels=ET.fromstring(original['ppt/_rels/presentation.xml.rels'])
source_ct=ET.fromstring(original['[Content_Types].xml'])
new_pres=ET.fromstring(addon['ppt/presentation.xml'])
new_rels=ET.fromstring(addon['ppt/_rels/presentation.xml.rels'])
new_ct=ET.fromstring(addon['[Content_Types].xml'])
new_relbyid={r.attrib['Id']:r for r in new_rels}
new_slidenode=new_pres.find(f'{{{P}}}sldIdLst')[0]
new_slide=resolve('ppt/presentation.xml',new_relbyid[new_slidenode.attrib[f'{{{R}}}id']].attrib['Target'])
mapping={new_slide:'ppt/slides/slide2.xml'}
copied=set()

# If a notes master exists in the source, reuse it for the new notes slide.
source_notes=next((r for r in source_rels if r.attrib['Type'].endswith('/notesMaster')),None)
new_notes=next((r for r in new_rels if r.attrib['Type'].endswith('/notesMaster')),None)
if source_notes is not None and new_notes is not None:
    mapping[resolve('ppt/presentation.xml',new_notes.attrib['Target'])]=resolve('ppt/presentation.xml',source_notes.attrib['Target'])

def dest(part):
    if part not in mapping:
        d,b=posixpath.split(part); mapping[part]=posixpath.join(d,'added2_'+b)
    return mapping[part]
def copy_part(part):
    dst=dest(part)
    if part in copied or dst in original: return dst
    copied.add(part)
    result[dst]=addon[part]
    rp=relpath(part)
    if rp in addon:
        rels=ET.fromstring(addon[rp])
        for r in rels:
            if r.attrib.get('TargetMode')=='External': continue
            target=resolve(part,r.attrib['Target'])
            r.attrib['Target']=posixpath.relpath(copy_part(target),posixpath.dirname(dst))
        result[relpath(dst)]=xmlbytes(rels)
    return dst
copy_part(new_slide)

def next_relid():
    nums=[int(r.attrib['Id'][3:]) for r in source_rels if r.attrib['Id'].startswith('rId') and r.attrib['Id'][3:].isdigit()]
    return 'rId'+str(max(nums,default=0)+1)
def register_part(part,typ,list_tag,item_tag,identifier=None):
    rid=next_relid()
    ET.SubElement(source_rels,f'{{{PKG}}}Relationship',{'Id':rid,'Type':R+'/'+typ,'Target':posixpath.relpath(dest(part),'ppt')})
    node=source_pres.find(f'{{{P}}}{list_tag}')
    if node is None:
        node=ET.Element(f'{{{P}}}{list_tag}')
        # Schema order: master, notes master, handout master, slide list, sizes.
        order=['sldMasterIdLst','notesMasterIdLst','handoutMasterIdLst','sldIdLst','sldSz','notesSz']
        insert=next((i for i,c in enumerate(source_pres) if c.tag.split('}')[-1] in order and order.index(c.tag.split('}')[-1])>order.index(list_tag)),len(source_pres))
        source_pres.insert(insert,node)
    attrs={f'{{{R}}}id':rid}
    if identifier is not None: attrs['id']=str(identifier)
    ET.SubElement(node,f'{{{P}}}{item_tag}',attrs)

slides=source_pres.find(f'{{{P}}}sldIdLst')
register_part(new_slide,'slide','sldIdLst','sldId',max(int(x.attrib['id']) for x in slides)+1)
for n in new_pres.find(f'{{{P}}}sldMasterIdLst'):
    nr=new_relbyid[n.attrib[f'{{{R}}}id']]
    part=resolve('ppt/presentation.xml',nr.attrib['Target'])
    copy_part(part)
    source_masters=source_pres.find(f'{{{P}}}sldMasterIdLst')
    register_part(part,'slideMaster','sldMasterIdLst','sldMasterId',max(int(x.attrib['id']) for x in source_masters)+1)
if new_notes is not None and source_notes is None:
    part=resolve('ppt/presentation.xml',new_notes.attrib['Target']); copy_part(part)
    register_part(part,'notesMaster','notesMasterIdLst','notesMasterId')

# Register imported part types; preserve every original binary part and slide XML.
existing_overrides={n.attrib['PartName'] for n in source_ct if n.tag.endswith('Override')}
existing_defaults={n.attrib['Extension'] for n in source_ct if n.tag.endswith('Default')}
for n in new_ct:
    if n.tag.endswith('Override'):
        part=n.attrib['PartName'].lstrip('/')
        if part in copied and '/'+dest(part) not in existing_overrides:
            ET.SubElement(source_ct,f'{{{CT}}}Override',{'PartName':'/'+dest(part),'ContentType':n.attrib['ContentType']})
    elif n.attrib['Extension'] not in existing_defaults:
        ET.SubElement(source_ct,f'{{{CT}}}Default',dict(n.attrib))
result['ppt/presentation.xml']=xmlbytes(source_pres)
result['ppt/_rels/presentation.xml.rels']=xmlbytes(source_rels)
ET.register_namespace('',CT)
result['[Content_Types].xml']=xmlbytes(source_ct)
with ZipFile(OUT,'w',ZIP_DEFLATED) as z:
    for name,data in result.items(): z.writestr(name,data)
assert result['ppt/slides/slide1.xml']==original['ppt/slides/slide1.xml']
assert len(source_pres.find(f'{{{P}}}sldIdLst'))==2
print('Merged: 2 slides. Original slide XML and all original dependent parts preserved byte for byte.')
print('Source SHA256:',hashlib.sha256(SOURCE.read_bytes()).hexdigest())
