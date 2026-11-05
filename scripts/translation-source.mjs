import {parse} from 'parse5';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export const translatedAttributes=new Set(['alt','title','aria-label','placeholder']);
export const schemaTextKeys=new Set(['name','description','headline','text']);
export const normal=s=>String(s).trim().replace(/The platform offers \d+ languages\./g,'The platform offers {{languageCount}} languages.');
export const meaningful=s=>/\p{L}/u.test(s)&&!/^https?:\/\//.test(s)&&!['Montenegro FAQ','BEMU','BEMU NFC','GitHub','404'].includes(s);
export function walk(node,fn){fn(node);for(const c of node.childNodes||[])walk(c,fn);}
export const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
export function schemaStrings(obj,out){if(Array.isArray(obj)){obj.forEach(o=>schemaStrings(o,out));return;}if(!obj||typeof obj!=='object')return;for(const[k,v]of Object.entries(obj)){if(schemaTextKeys.has(k)&&typeof v==='string')out.add(normal(v));else if(typeof v==='object')schemaStrings(v,out);}}
export async function englishFiles(dir='dist/en'){const out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=join(dir,f.name);if(f.isDirectory())out.push(...await englishFiles(p));else if(f.name==='index.html')out.push(p);}return out.sort();}
export async function collectSource(){const out=new Set(['guides','Language','Search languages…','Machine-assisted translation','Read the original English version']);const files=await englishFiles();for(const file of files){const doc=parse(await readFile(file,'utf8'));walk(doc,n=>{
 let parent=n,inLanguageMenu=false;while(parent){if((attr(parent,'class')||'').split(' ').includes('language'))inLanguageMenu=true;parent=parent.parentNode;}
 if(n.nodeName==='#text'&&!inLanguageMenu&&!['script','style'].includes(n.parentNode?.tagName))out.add(normal(n.value));
 for(const a of n.attrs||[]){if(translatedAttributes.has(a.name)&&!inLanguageMenu)out.add(normal(a.value));if(n.tagName==='meta'&&a.name==='content'&&['description','og:title','og:description','og:image:alt','twitter:title','twitter:description'].includes(attr(n,'name')||attr(n,'property')))out.add(normal(a.value));if(n.tagName==='form'&&a.name.startsWith('data-'))out.add(normal(a.value));}
 if(n.tagName==='script'&&attr(n,'id')==='ui-data'){for(const v of Object.values(JSON.parse(n.childNodes[0].value)))out.add(normal(v));}
 if(n.tagName==='script'&&attr(n,'type')==='application/ld+json')schemaStrings(JSON.parse(n.childNodes[0].value),out);
 });}
 // Include the original whole paragraphs so search indexes can be rebuilt without translating attributes as markup.
 const {guides}=await import('../content/catalog.mjs');for(const g of guides){for(const value of [g.en.title,g.en.description,g.en.intro,...g.en.sections.flat()])out.add(normal(value));}
 const strings=[...out].filter(meaningful).sort();return {strings,hash:createHash('sha256').update(JSON.stringify(strings)).digest('hex')};}
