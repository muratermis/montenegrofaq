import {guides} from '../content/guides.mjs';
const now=new Date(),stale=guides.filter(g=>(now-new Date(g.checked))/86400000>g.reviewDays);let problems=0;
for(const g of stale){console.log(`REVIEW: ${g.slug} — sources last checked ${g.checked}; review interval ${g.reviewDays} days`);problems++;}
for(const url of new Set(guides.flatMap(g=>g.sources.map(s=>s.url)))){try{const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'MontenegroFAQ-LinkCheck/1.0'}});if(!r.ok){console.log(`CHECK LINK: ${r.status} ${url} (may be bot protection; not proof that the page was removed)`);problems++;}else console.log(`OK ${r.status} ${url}`);}catch{console.log(`CHECK LINK: unavailable ${url}`);problems++;}}
console.log('This audit detects availability and review age. It does not verify factual accuracy or reset dates.');
if(problems)process.exitCode=1;
