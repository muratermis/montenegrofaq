import {guides} from '../content/catalog.mjs';
const now=new Date(),stale=guides.filter(g=>(now-new Date(g.checked))/86400000>g.reviewDays);let problems=0;
for(const g of stale){console.log(`REVIEW: ${g.slug} — sources last checked ${g.checked}; review interval ${g.reviewDays} days`);problems++;}
const urls=[...new Set(guides.flatMap(g=>g.sources.map(s=>s.url)))];
let cursor=0;
async function worker(){while(cursor<urls.length){const url=urls[cursor++];try{const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'MontenegroFAQ-LinkCheck/1.0'}});await r.body?.cancel();if(!r.ok){console.log(`CHECK LINK: ${r.status} ${url} (may be bot protection; not proof that the page was removed)`);problems++;}else console.log(`OK ${r.status} ${url}`);}catch{console.log(`CHECK LINK: unavailable ${url}`);problems++;}}}
await Promise.all(Array.from({length:4},worker));
console.log('This audit detects availability and review age. It does not verify factual accuracy or reset dates.');
if(problems)process.exitCode=1;
