from pathlib import Path
import re
from docx import Document
root=Path(__file__).resolve().parent
h=(root/'document-preview-final.html').read_text(encoding='utf-8-sig')
h=re.sub(r'<script\b[^>]*>.*?</script>','',h,flags=re.S)
doc=Document(root.parent/'子课题三_研究方案与申报材料汇编.docx')
for i,p in enumerate(doc.paragraphs,1):
    selector=f'data-path="/body/p[{i}]"'
    if p.style.name.startswith('Heading'):
        h=h.replace(selector,selector+' class="heading-preview"')
    if p._p.xpath('.//m:oMath'):
        h=re.sub(r'(<p\b[^>]*'+re.escape(selector)+r'[^>]*>).*?(</p>)',r'\1Q(t+1) = max{0, Q(t) + A(t) - C(t)}\2',h,flags=re.S)
h=h.replace('</head>','''<style>
@page {size:A4;margin:16mm 18mm;}
@media print {
body {padding:0 !important;background:white;}
.page-wrapper {margin:0 !important;width:auto !important;height:auto !important;break-after:page;}
.page {width:auto !important;min-height:0 !important;padding:0 !important;transform:none !important;overflow:visible !important;display:block !important;box-shadow:none;}
img {max-width:100% !important;height:auto !important;}
table {width:100% !important;table-layout:fixed;}
tr {break-inside:avoid;}
p {orphans:2;widows:2;}
h1,h2,h3,h4 {break-after:avoid;}
.heading-preview {break-after:avoid;}
.doc-title {border:none !important;}
}
</style></head>''')
(root/'browser-print-preview.html').write_text(h,encoding='utf-8')
print('Browser preview prepared')
