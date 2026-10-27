import {execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {guides} from '../content/catalog.mjs';
const base=process.env.BASE_SHA;
if(!/^[a-f0-9]{40}$/.test(base||''))throw Error('Expected verified base SHA');
const paths=execFileSync('git',['ls-tree','-r','--name-only',base,'content'],{encoding:'utf8'}).trim().split('\n').filter(p=>/^content\/[\w./-]+\.(mjs|json)$/.test(p));
const directory=await mkdtemp(join(tmpdir(),'mfq-content-base-'));
try{
 for(const path of paths){const target=join(directory,path);await mkdir(dirname(target),{recursive:true});await writeFile(target,execFileSync('git',['show',`${base}:${path}`]));}
 const module=paths.includes('content/catalog.mjs')?'catalog.mjs':'guides.mjs';
 const {guides:previous}=await import(pathToFileURL(join(directory,'content',module)).href);
 for(const g of guides){const old=previous.find(p=>p.slug===g.slug);if(!old)continue;for(const lang of ['en','tr']){if(JSON.stringify(g[lang])!==JSON.stringify(old[lang])&&(g.updated<old.updated||g.revision<=old.revision))throw Error(`${g.slug}: update revision/date after editing ${lang}`);if(g.translations[lang]!==g.revision)throw Error(`${g.slug}: ${lang} translation requires review`);}}
 console.log('Content revisions and translation versions are consistent.');
}finally{await rm(directory,{recursive:true,force:true});}
