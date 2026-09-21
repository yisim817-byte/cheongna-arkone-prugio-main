"""Render public project data into existing static HTML; Python standard library only.
Run after editing data/project.json. No network, database, or deployment operations.
"""
import json
import re
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
D = json.loads((ROOT / 'data/project.json').read_text())
N = lambda k: f'{D[k]:,}'
NOTICE = '상기 내용은 사업계획 기준이며 관계기관 및 사업주체 사정에 따라 변경 또는 지연될 수 있습니다. 확정 사항은 입주자모집공고를 확인해 주세요.'

def spec(rows):
    return '<div class="spec">' + ''.join(f'<div class="spec__row"><div class="spec__k">{k}</div><div class="spec__v">{v}</div></div>' for k,v in rows) + '</div>'

def section(title, en, body, ident='', tone='paper'):
    return f'<section class="sec sec--{tone}"'+(f' id="{ident}"' if ident else '')+f'><div class="wrap"><div class="sec__head"><span class="sec__en">{en}</span><h2>{title}</h2></div>{body}</div></section>'

def note(text=NOTICE):
    return f'<p class="official-note">※ {text}</p>'

def schedule(short=False):
    dates=D['schedule'][:2] if short else D['schedule']
    content='<div class="official-schedule">'+''.join(f'<div><time datetime="2026-{date.replace(".", "-")}">{date}</time><span>{label}</span></div>' for date,label in dates)+'</div>'
    return section('2026 분양일정', 'SCHEDULE',content+note('일정은 모두 예정이며 사업주체 사정에 따라 변경될 수 있습니다.')+('<a class="textlink" href="/information#schedule">전체 일정 · 청약안내</a>' if short else ''),'schedule')

def overview():
    rows=[('대지위치',D['address']+'<br>'+D['block']),('대지면적',D['siteArea']),('건축면적',D['buildingArea']),('연면적',D['grossArea']),('건폐율',D['coverage']),('용적률',D['far']),('아파트',f'{D["aptBuildings"]} · {N("apt")}세대 · 전용 84㎡·103㎡<br>{D["aptFloors"]}'),('오피스텔',f'{D["otBuildings"]} · {N("ot")}실 · 전용 105㎡·121㎡·136㎡<br>{D["otFloors"]}'),('총 규모',f'{D["buildings"]}개동 · {N("total")}세대·실'),('주차',f'{N("parking")}대 (APT {N("aptParking")} · OT {N("otParking")} · 상업시설 {D["retailParking"]})'),('입주',D['moveIn']),('시행',D['developer']),('시공',D['builder']),('분양방식','분양가상한제 적용')]
    return section('사업 개요','PROJECT SUMMARY',spec(rows)+note(),'summary')

def stats():
    items=[('APT',N('apt'),'세대'),('OFFICETEL',N('ot'),'실'),('ARK-ONE',N('total'),'세대·실'),('PRUGIO BRAND TOWN',N('brandTown'),'가구'),('HIGHEST FLOOR','49','F'),('PARKING',N('parking'),'대')]
    return '<section class="sec sec--paper official-stats-section"><div class="wrap"><p class="sec__en">청라국제업무단지 M5BL</p><div class="official-stats">'+''.join(f'<div><span>{a}</span><strong>{b}<small>{c}</small></strong></div>' for a,b,c in items)+'</div>'+note('브랜드타운은 아크원과 피크원을 합산한 규모이며 단일 단지 규모가 아닙니다.')+'</div></section>'

def retail():
    body=spec([('M5 아크원',f'1층 {D["retailFirst"]}개 · 2층 {D["retailSecond"]}개 · 총 {D["retail"]}개 점포'),('B1 피크원',f'{D["peakRetail"]}개 점포'),('브랜드타운 전체',f'{D["totalRetail"]}개 점포'),('아크원 상업시설','전용률 43.3% · 1층 층고 6.0m · 2층 일부 테라스 · 전면도로 배치')])
    return section('생활을 연결하는 상업시설','RETAIL',body+note(),'retail','warm')

def types():
    parts=[]
    for key,title,en,unit,area in [('aptTypes','아파트','APT','세대','공급'),('otTypes','오피스텔','OFFICETEL','실','계약')]:
        cards=[]
        for t in D[key]:
            content=spec([('전용면적',f'{t["exclusive"]:.2f}㎡'),(area+'면적',f'{t["area"]:.2f}㎡ / {t["pyeong"]:.2f}평'),('라인',t['line']+'라인')]+([('실사용면적',f'약 {t["usable"]:.1f}평 (서비스면적 포함)')] if key=='otTypes' else []))
            cards.append(f'<details class="official-type"><summary><span>{t["type"]}</span><span>{t["count"]}{unit}<small>상세보기 +</small></span></summary><div class="official-type__body">{content}</div></details>')
        parts.append(section(title+' 타입 안내',en,'<div class="official-types">'+''.join(cards)+'</div>'+note('공식 평면도는 추후 안내 예정입니다. 타입별 수치와 구성은 최종 모집공고를 확인해 주세요.')+(note('오피스텔 실사용면적은 서비스면적을 포함한 참고 면적입니다. 계약면적과 다르므로 혼용하지 마세요.') if key=='otTypes' else ''),en.lower()))
    return '<nav class="official-type-nav wrap" aria-label="상품별 타입 이동"><a class="btn btn--line" href="#apt">APT · 아파트</a><a class="btn btn--line" href="#officetel">OFFICETEL · 오피스텔</a><a class="textlink" href="#layout">단지 동·라인 안내</a></nav>'+''.join(parts)

def layout():
    rows=[]
    for i in range(1,8):
        ap=[x['type'] for x in D['aptTypes'] if f'{i}호' in x['line']]
        ot=[x['type'] for x in D['otTypes'] if f'{i}호' in x['line']]
        rows.append(f'<tr><th scope="row">{i}호</th><td>{" / ".join(ap)}</td><td>{" / ".join(ot)}</td></tr>')
    table=f'<table class="official-table"><caption>아파트 {D["aptBuildings"]} / 오피스텔 {D["otBuildings"]}</caption><thead><tr><th scope="col">라인</th><th scope="col">APT</th><th scope="col">OFFICETEL</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'
    return section('단지 동·라인 안내','BUILDING & LINE',table+note('동·라인별 타입 정보입니다. 향·조망 또는 실제 배치도를 나타내지 않습니다. 공식 단지배치도는 추후 안내 예정입니다.'),'layout','warm')

def brand():
    return section(f'총 {N("brandTown")}가구<br>푸르지오 브랜드타운','BRAND TOWN',spec([('M5 아크원',f'아파트 {N("apt")}세대 + 오피스텔 {N("ot")}실 = {N("total")}세대·실'),('B1 피크원',f'오피스텔 {N("peakone")}실'),('아크원 입주',D['moveIn'])])+note('브랜드타운은 두 단지의 합산 규모입니다. 사업일정은 변경될 수 있습니다.'),'brandtown','warm')

def faq():
    return [('청라 아크원 푸르지오 위치는 어디인가요?',D['address']+' ('+D['block']+')입니다.'),('총 공급 규모는 어떻게 되나요?',f'아파트 {N("apt")}세대와 오피스텔 {N("ot")}실, 총 {N("total")}세대·실입니다.'),('아파트 평형은 어떻게 구성되나요?','전용 84㎡·103㎡이며 '+', '.join(t['type'] for t in D['aptTypes'])+'의 6개 세부 타입입니다.'),('오피스텔 타입은 어떻게 구성되나요?','전용 105㎡·121㎡·136㎡이며 '+', '.join(t['type'] for t in D['otTypes'])+'의 8개 세부 타입입니다.'),('분양 일정은 언제인가요?','2026년 10월 8일 APT 모집공고, 10월 16일 GRAND OPEN 예정입니다. 일정은 변경될 수 있습니다.'),('피크원 푸르지오와 어떤 관계인가요?',f'B1블록 피크원 {N("peakone")}실과 M5블록 아크원 {N("total")}세대·실을 합산한 {N("brandTown")}가구 브랜드타운입니다.'),('분양가상한제가 적용되나요?','분양가상한제가 적용되는 단지로, 분양가는 관련 법령과 분양가심사 기준에 따라 산정·공고됩니다.')]

def faq_html():
    return section('자주 묻는 질문','FAQ','<div class="official-faq">'+''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in faq())+'</div>','faq')

BLOCKS={'stats':stats(),'home-schedule':schedule(True),'schedule':schedule(),'overview':overview(),'retail':retail(),'types':types(),'layout':layout(),'brand':brand(),'faq':faq_html()}
for path in ROOT.glob('*.html'):
    if path.name == 'privacy.html':
        continue
    text=path.read_text()
    for key,val in BLOCKS.items():
        text=re.sub(r'<!-- SSoT:'+key+r' -->.*?<!-- /SSoT:'+key+r' -->',lambda _:f'<!-- SSoT:{key} -->\n{val}\n<!-- /SSoT:{key} -->',text,flags=re.S)
    for key in ['name','english','address','block','phone','phoneHref','moveIn']:
        text=re.sub(r'<!-- data:'+key+r' -->.*?<!-- /data -->',lambda _,k=key:'<!-- data:'+k+' -->'+escape(str(D[k]))+'<!-- /data -->',text,flags=re.S)
    def schema(match):
        obj=json.loads(match.group(1))
        if obj.get('@type')=='ApartmentComplex':
            obj['name']=D['name'];obj['numberOfAccommodationUnits']=D['total'];obj['telephone']=D['phone']
            obj['address'].update(addressLocality='서해구 청라동',streetAddress='청라동 86-1번지')
            obj['description']=f'{D["address"]} ({D["block"]}), 아파트 {N("apt")}세대·최고 44층, 오피스텔 {N("ot")}실·최고 49층, 총 {N("total")}세대·실.'
        if obj.get('@type')=='FAQPage':
            obj['mainEntity']=[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faq()]
        return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'</script>'
    text=re.sub(r'<script type="application/ld\+json">(.*?)</script>',schema,text,flags=re.S)
    path.write_text(text)
print('Rendered project data into existing static pages.')
