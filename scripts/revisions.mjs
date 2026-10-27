import {execFileSync} from 'node:child_process';import {guides} from '../content/guides.mjs';
const base=process.env.BASE_SHA;if(!/^[a-f0-9]{40}$/.test(base||''))throw Error('Expected verified base SHA');
const source=execFileSync('git',['show',`${base}:content/guides.mjs`],{encoding:'utf8'});
const previous=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).guides;
for(const g of guides){const old=previous.find(p=>p.slug===g.slug);if(!old)continue;for(const lang of ['en','tr']){if(JSON.stringify(g[lang])!==JSON.stringify(old[lang])&&(g.updated<old.updated||g.revision<=old.revision))throw Error(`${g.slug}: update the content revision and keep an accurate date after editing ${lang}`);if(g.translations[lang]!==g.revision)throw Error(`${g.slug}: ${lang} translation requires review`);}}
console.log('Content revisions and translation versions are consistent.');
