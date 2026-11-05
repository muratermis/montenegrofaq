import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {languages} from '../content/languages.mjs';
import {collectSource} from './translation-source.mjs';

const placeholders=value=>[...new Set(value.match(/\{\{[A-Za-z][A-Za-z0-9_]*\}\}/g)||[])].sort().join('|');
export function inspectDictionary(source,dictionary,language){
 const issues=[];
 const add=(kind,key)=>issues.push({language:language.code,kind,key});
 if(dictionary.sourceHash!==source.hash)add('stale-source','');
 for(const key of source.strings){
  const value=dictionary.entries?.[key];
  if(typeof value!=='string'||!value.trim()){add('missing-text',key);continue;}
  if(placeholders(key)!==placeholders(value))add('changed-placeholder',key);
  if(/[\[［]\s*\d{6,}\s*[\]］]/u.test(value)&&!/[\[［]\s*\d{6,}\s*[\]］]/u.test(key))add('translation-batch-marker',key);
  if(key.length>180&&value.trim()===key.trim())add('untranslated-paragraph',key);
  if(['sr','cnr'].includes(language.code)&&/[\u0400-\u04ff]/u.test(value))add('unexpected-cyrillic',key);
  for(const number of ['112','122','123','124','129']){
   const pattern=new RegExp('(?<!\\d)'+number+'(?!\\d)');
   if(pattern.test(key)&&!pattern.test(value.normalize('NFKC')))add('changed-emergency-number',key);
  }
 }
 return issues;
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const source=await collectSource(),targets=languages.filter(l=>!['en','tr'].includes(l.code)),issues=[];
 for(const language of targets){const dictionary=JSON.parse(await readFile(`content/translations/${language.code}.json`));issues.push(...inspectDictionary(source,dictionary,language));}
 await mkdir('output',{recursive:true});
 await writeFile('output/translation-quality.json',JSON.stringify({scope:'Structural checks of every required translation entry; semantic review is contextual.',dictionaries:targets.length,entriesChecked:source.strings.length*targets.length,issues},null,2)+'\n');
 if(issues.length){for(const issue of issues.slice(0,20))console.error(`${issue.language}: ${issue.kind}: ${issue.key.slice(0,100)}`);process.exitCode=1;}
 else console.log(`Validated ${source.strings.length*targets.length} translated source entries in ${targets.length} dictionaries: completeness, placeholders, emergency numbers, scripts and import artefacts.`);
}
