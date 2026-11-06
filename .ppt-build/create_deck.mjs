import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const runtimeRoot = 'C:/Users/kdivy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool';
const { Presentation, PresentationFile } = await import(pathToFileURL(path.join(runtimeRoot, 'dist/artifact_tool.mjs')).href);
const root = 'C:/Users/kdivy/OneDrive/Desktop/VS CODES 🔥/financial_analysis _fraud_detection 2.O';
const buildDir = path.join(root, '.ppt-build');
const outDir = path.join(root, 'output');
await fs.mkdir(outDir, { recursive: true });

const C = {
  navy: '#10232D', navy2: '#183640', ink: '#142A31', cream: '#F5F2EA', paper: '#FBFAF6',
  teal: '#2B8A7F', mint: '#A7D7C8', orange: '#D77A45', gold: '#E8B75A', pale: '#E6E0D4',
  muted: '#617077', white: '#FFFFFF', red: '#C65C50', sky: '#A8CAD1', lightTeal: '#D8EAE4',
};
const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function shape(slide, geometry, x, y, w, h, fill='none', lineFill='none', lineWidth=0, name) {
  return slide.shapes.add({ geometry, name, position: { left:x, top:y, width:w, height:h }, fill,
    line: { style:'solid', fill:lineFill, width:lineWidth } });
}
function text(slide, str, x, y, w, h, size=24, color=C.ink, bold=false, align='left', name) {
  const s=shape(slide,'textbox',x,y,w,h,'none','none',0,name);
  s.text=str;
  s.text.style={fontSize:size,typeface:'Arial',color,bold,alignment:align,verticalAlignment:'middle',wrap:true,autoFit:'shrinkText',insets:0};
  return s;
}
function rule(slide,x,y,w,color=C.pale,h=2){ shape(slide,'rect',x,y,w,h,color,'none',0); }
function dot(slide,x,y,r,color){ shape(slide,'ellipse',x-r,y-r,2*r,2*r,color,'none',0); }
function base(bg=C.paper){ const s=pres.slides.add(); s.background.fill=bg; return s; }
function heading(slide,kicker,title,n,dark=false){
  text(slide,kicker.toUpperCase(),76,46,500,24,15,dark?C.mint:C.teal,true);
  text(slide,title,76,82,1060,62,42,dark?C.white:C.ink,true);
  rule(slide,76,157,1128,dark?'#35515B':C.pale,1.5);
  text(slide,String(n).padStart(2,'0'),1150,48,54,26,15,dark?C.sky:C.muted,true,'right');
}
function footer(slide,dark=false){
  text(slide,'SENTINEL  /  FINANCIAL RISK & FRAUD INTELLIGENCE',76,677,740,18,12,dark?C.sky:C.muted,true);
  text(slide,'SYNTHETIC DEMO',1010,677,194,18,12,dark?C.sky:C.muted,true,'right');
}

// 1 — Cover
{
 const s=base(C.navy);
 shape(s,'rect',0,0,15,720,C.teal);
 text(s,'SENTINEL',78,70,360,30,17,C.mint,true);
 text(s,'Financial Risk\n& Fraud Intelligence',78,168,700,196,58,C.white,true);
 text(s,'An explainable transaction screening prototype',82,393,660,44,25,'#D5E0DD',false);
 rule(s,82,474,230,C.teal,5);
 text(s,'Rule-based signals  ·  Analyst-friendly decisions  ·  Synthetic demo data',82,506,740,64,19,C.sky,false);
 // restrained editable score motif, not an illustration
 text(s,'RISK SCORE',876,199,260,24,15,C.sky,true,'center');
 text(s,'70',876,246,260,118,96,C.white,true,'center');
 text(s,'HIGH RISK',876,378,260,30,18,C.mint,true,'center');
 rule(s,905,436,202,'#35515B',4); rule(s,905,436,141,C.teal,4); dot(s,1046,438,9,C.gold);
 text(s,'Explain the signal. Guide the next step.',876,484,260,64,18,'#D5E0DD',false,'center');
 text(s,'PROJECT OVERVIEW',82,672,260,18,12,C.sky,true);
}

// 2 — Why the risk picture needs context
{
 const s=base(); heading(s,'The challenge','Transaction risk needs context',2);
 text(s,'A single unusual payment can be hard to judge. Sentinel combines several clues so each alert carries a reason an analyst can inspect.',76,184,580,108,25,C.ink,false);
 const signals=[['01','Amount','Does the value stand out?'],['02','Velocity','Are transactions arriving unusually fast?'],['03','Merchant & location','Is the category monitored or the origin international?'],['04','Timing & declines','Is activity overnight or repeatedly declined?']];
 let y=333;
 for(const [num,label,desc] of signals){
   text(s,num,76,y,44,28,15,C.teal,true); text(s,label,140,y-3,250,32,22,C.ink,true); text(s,desc,420,y,760,32,18,C.muted,false); rule(s,140,y+43,1064,C.pale,1); y+=74;
 }
 footer(s);
}

// 3 — Workflow
{
 const s=base(C.navy); heading(s,'Screening flow','From transaction to action',3,true);
 text(s,'Each evaluation returns both a risk score and the rules that contributed to it.',76,184,1040,40,23,'#D5E0DD',false);
 const stages=[
  {x:76,w:250,n:'01',title:'Transaction',body:'Amount · merchant\nCountry · hour\nVelocity · recent declines',accent:C.sky},
  {x:368,w:250,n:'02',title:'Rule checks',body:'Evaluate six explicit\nconditions and record\neach triggered rule',accent:C.mint},
  {x:660,w:250,n:'03',title:'Weighted score',body:'Add rule weights\nCap the total at 100\nAssign a risk band',accent:C.gold},
  {x:952,w:252,n:'04',title:'Next step',body:'Approve · verify\nBlock and escalate\nShow the reasons',accent:'#EFA68B'},
 ];
 for(let i=0;i<stages.length;i++){
  const a=stages[i]; text(s,a.n,a.x,280,55,26,15,a.accent,true);
  rule(s,a.x,324,a.w,a.accent,4);
  text(s,a.title,a.x,350,a.w,48,29,C.white,true);
  text(s,a.body,a.x,412,a.w,104,20,'#C7D6D3',false);
  if(i<stages.length-1){ text(s,'→',a.x+a.w+8,322,34,38,28,C.sky,false,'center'); }
 }
 text(s,'The decision stays explainable: analysts can see which checks fired.',76,573,1070,38,21,C.mint,true);
 footer(s,true);
}

// 4 — Rule model
{
 const s=base(); heading(s,'Rule model','Six signals add up to a capped score',4);
 text(s,'A rule contributes its weight when its condition is met. The score is capped at 100.',76,180,1050,38,22,C.muted,false);
 const rules=[
  ['High value','Over $2,500',30,C.teal],['Rapid velocity','4+ in 10 minutes',25,C.orange],
  ['Monitored category','Crypto, gaming, wire transfer, luxury',20,C.gold],['International','Origin outside the US',15,C.sky],
  ['Repeated declines','3+ recent declines',25,C.red],['Overnight hour','01:00–04:00',10,C.teal],
 ];
 const cols=[76,666];
 for(let i=0;i<rules.length;i++){
  const col=i<3?0:1, row=i%3, x=cols[col], y=260+row*124;
  const [name,cond,weight,color]=rules[i];
  dot(s,x+10,y+13,6,color); text(s,name,x+30,y-2,490,35,23,C.ink,true);
  text(s,cond,x+30,y+39,490,31,17,C.muted,false);
  text(s,`+${weight}`,x+470,y-5,78,36,25,color,true,'right');
  rule(s,x+30,y+85,520,C.pale,1);
 }
 text(s,'Category set and thresholds are project rules; tune and validate them before real use.',76,638,1060,24,16,C.muted,false);
 footer(s);
}

// 5 — Thresholds & example
{
 const s=base(C.navy); heading(s,'Decision bands','Risk bands guide the response',5,true);
 text(s,'Scores reflect the sum of triggered rule weights, capped at 100.',76,184,1000,38,22,'#D5E0DD',false);
 const bx=110, by=298, bw=1060, bh=76;
 shape(s,'rect',bx,by,bw*.39,bh,C.teal); shape(s,'rect',bx+bw*.39,by,bw*.30,bh,C.gold); shape(s,'rect',bx+bw*.69,by,bw*.31,bh,C.red);
 text(s,'LOW',bx+8,by+14,bw*.39-16,24,17,C.white,true,'center');
 text(s,'MEDIUM',bx+bw*.39+8,by+14,bw*.30-16,24,17,C.ink,true,'center');
 text(s,'HIGH',bx+bw*.69+8,by+14,bw*.31-16,24,17,C.white,true,'center');
 text(s,'0–39  ·  approve',bx,392,bw*.39,32,18,'#D5E0DD',false,'center');
 text(s,'40–69  ·  request verification',bx+bw*.39,392,bw*.30,52,17,'#D5E0DD',false,'center');
 text(s,'70–100  ·  block / escalate',bx+bw*.69,392,bw*.31,52,17,'#D5E0DD',false,'center');
 rule(s,76,486,1128,'#35515B',1);
 text(s,'ILLUSTRATIVE EXAMPLE',76,523,280,24,15,C.mint,true);
 text(s,'$3,200',76,560,222,52,38,C.white,true);
 text(s,'+ 4 transactions / 10 min',340,560,320,52,23,C.white,true);
 text(s,'+ international origin',703,560,260,52,23,C.white,true);
 text(s,'30 + 25 + 15 = 70  →  high risk',76,621,780,34,22,C.gold,true);
 footer(s,true);
}

// 6 — Analyst workspace
{
 const s=base(); heading(s,'Analyst workspace','Portfolio view and transaction detail',6);
 text(s,'Sentinel pairs a quick portfolio scan with a transaction explorer for follow-up.',76,182,1040,38,22,C.muted,false);
 // one large, open layout: navigation rail and working area described as editable text
 rule(s,76,262,230,C.navy,4);
 const nav=[['OVERVIEW','Portfolio totals, risk mix, and trends'],['TRANSACTIONS','Search, filter, sort, and inspect records'],['RULE ENGINE','Review rules and their thresholds'],['ALERTS','Open high-risk items for attention']];
 let y=293;
 for(const [label,desc] of nav){text(s,label,76,y,222,24,15,C.teal,true);text(s,desc,76,y+28,228,58,18,C.ink,false);y+=93;}
 rule(s,360,262,1,C.pale,346);
 text(s,'WHAT THE ANALYST CAN SEE',404,270,660,26,15,C.teal,true);
 const checks=[
  ['Trend','Transaction volume and flagged activity across recent days'],
  ['Distribution','Low, medium, and high risk counts'],
  ['Alert context','Amount, merchant, risk score, and triggered rules'],
  ['Investigation','Search by transaction, merchant, customer, or category'],
 ];
 y=323;
 for(const [a,b] of checks){
   text(s,a,404,y,160,34,22,C.ink,true); text(s,b,580,y,600,50,19,C.muted,false); rule(s,404,y+62,776,C.pale,1); y+=78;
 }
 text(s,'The dashboard values come from deterministic synthetic transactions.',404,643,780,24,16,C.orange,true);
 footer(s);
}

// 7 — Architecture and API
{
 const s=base(C.cream); heading(s,'Project build','A small full-stack prototype',7);
 text(s,'No frontend build step is required. FastAPI serves the dashboard and JSON endpoints.',76,180,1080,38,22,C.muted,false);
 const layers=[
  {x:76,w:300,title:'Browser interface',sub:'HTML · CSS · JavaScript',detail:'Overview · transactions\nrule engine · alerts',accent:C.teal},
  {x:490,w:300,title:'FastAPI service',sub:'Python · Pydantic',detail:'Dashboard aggregation\ntransaction screening',accent:C.orange},
  {x:904,w:300,title:'Rule engine',sub:'Six weighted checks',detail:'Risk band + decision\ntriggered-rule explanations',accent:C.navy2},
 ];
 for(let i=0;i<layers.length;i++){
  const a=layers[i]; rule(s,a.x,278,a.w,a.accent,5); text(s,a.title,a.x,305,a.w,44,27,C.ink,true);
  text(s,a.sub,a.x,357,a.w,28,17,a.accent,true); text(s,a.detail,a.x,405,a.w,74,19,C.muted,false);
  if(i<2)text(s,'→',a.x+a.w+40,322,34,38,30,C.teal,true,'center');
 }
 rule(s,76,516,1128,C.pale,1);
 text(s,'CORE ROUTES',76,548,190,22,15,C.teal,true);
 text(s,'/api/dashboard',76,587,232,28,18,C.ink,true); text(s,'/api/transactions',343,587,250,28,18,C.ink,true);
 text(s,'/api/analyze',637,587,220,28,18,C.ink,true); text(s,'/api/rules',887,587,220,28,18,C.ink,true);
 text(s,'Health and transaction detail routes are also available.',76,632,1000,25,16,C.muted,false);
 footer(s);
}

// 8 — Prototype limits and next steps
{
 const s=base(C.navy); heading(s,'Responsible next steps','A clear prototype — not a production strategy',8,true);
 text(s,'Sentinel demonstrates transparent rule-based screening, with important limits to resolve before any real deployment.',76,183,1060,58,22,'#D5E0DD',false);
 const x1=76,x2=650;
 text(s,'WHAT IT SHOWS',x1,292,450,28,16,C.mint,true);
 text(s,'• Explainable weighted rules\n• Searchable transaction review\n• API for screening a new transaction',x1,342,495,152,23,C.white,false);
 text(s,'WHAT IT DOES NOT PROVE',x2,292,520,28,16,'#EFA68B',true);
 text(s,'• Demo records and labels are synthetic\n• No measured detection performance\n• No model, compliance, or security validation',x2,342,540,152,23,C.white,false);
 rule(s,76,527,1128,'#35515B',1);
 text(s,'NEXT',76,562,120,24,15,C.gold,true);
 text(s,'Validate on representative, governed data  →  measure false positives and misses  →  review privacy, security, and compliance.',76,599,1100,58,21,C.white,true);
 footer(s,true);
}

for (let i=0;i<pres.slides.items.length;i++) {
  const slide=pres.slides.items[i];
  const png=await pres.export({slide,format:'png',scale:1});
  await fs.writeFile(path.join(buildDir,`slide-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await png.arrayBuffer()));
}
const montage=await pres.export({format:'webp',montage:true});
await fs.writeFile(path.join(buildDir,'montage.webp'),new Uint8Array(await montage.arrayBuffer()));
const pptx=await PresentationFile.exportPptx(pres);
await pptx.save(path.join(buildDir,'candidate.pptx'));
console.log(JSON.stringify({slideCount:pres.slides.items.length,candidate:path.join(buildDir,'candidate.pptx')}));
