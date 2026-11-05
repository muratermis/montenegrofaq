import {guides} from '../content/catalog.mjs';
import {checkLink} from './link-audit.mjs';
import {mkdir,writeFile,appendFile} from 'node:fs/promises';
const now=new Date(),stale=guides.filter(g=>(now-new Date(g.checked))/86400000>g.reviewDays);
const urls=[...new Set(guides.flatMap(g=>g.sources.map(s=>s.url)))];let cursor=0;const results=[];
async function worker(){while(cursor<urls.length){const result=await checkLink(urls[cursor++]);results.push(result);console.log(`${result.category.toUpperCase()} ${result.status||result.error||'unavailable'} ${result.url} (${result.attempts} attempt(s))`);}}
await Promise.all(Array.from({length:4},worker));results.sort((a,b)=>a.url.localeCompare(b.url));
const broken=results.filter(r=>r.category==='broken'),uncertain=results.filter(r=>!['ok','broken'].includes(r.category));
for(const g of stale)console.log(`REVIEW: ${g.slug} — sources last checked ${g.checked}; review interval ${g.reviewDays} days`);
const escape=value=>String(value).replace(/\|/g,'\\|').replace(/[\r\n]/g,' ');
const report=`# Source availability and content review\n\nChecked ${urls.length} unique source URLs. ${broken.length} confirmed link errors, ${uncertain.length} restricted/temporary/unverified responses, ${stale.length} content reviews due.\n\n404/410 and other non-transient client errors fail this job after retries. Bot restrictions, temporary server errors, certificate errors and network failures remain visible review warnings; they do not prove that a source was removed. TLS verification stays enabled.\n\n| Result | HTTP / error | URL | Attempts |\n|---|---|---|---|\n${results.filter(r=>r.category!=='ok').map(r=>`| ${r.category} | ${escape(r.status||r.error)} | ${escape(r.url)} | ${r.attempts} |`).join('\n')}\n\n## Content reviews due\n\n${stale.length?stale.map(g=>`- ${g.slug}: checked ${g.checked}, interval ${g.reviewDays} days`).join('\n'):'None.'}\n\nThis checks availability and review age, not factual accuracy. No content or verification dates are automatically changed.\n`;
await mkdir('output',{recursive:true});await writeFile('output/source-audit.md',report);await writeFile('output/source-audit.json',JSON.stringify({checkedAt:now.toISOString(),stale:stale.map(g=>g.slug),results},null,2));if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,report);
for(const r of uncertain)console.log(`::warning::Manual source check needed (${r.category}): ${r.url}`);
for(const r of broken)console.log(`::error::Confirmed link error ${r.status}: ${r.url}`);
console.log(`${broken.length} broken links; ${uncertain.length} availability warnings; ${stale.length} reviews due. Report: output/source-audit.md`);
if(broken.length||stale.length)process.exitCode=1;
