import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../public/assets/app.js',import.meta.url),'utf8');
async function openForm(width){
 const button={disabled:true,textContent:'Send'},status={textContent:''},requests=[];
 let options;
 const challenge={clientWidth:width,dataset:{sitekey:'public-test-placeholder'}};
 const form={dataset:{unavailable:'Unavailable',checking:'Checking',securityError:'Security error'},querySelector:()=>button,addEventListener(){}};
 const document={
  body:{dataset:{locale:'en'}},documentElement:{dataset:{}},
  querySelector(selector){return ({'#feedback-form':form,'#feedback-status':status,'#feedback-challenge':challenge})[selector]||null;},
  querySelectorAll:()=>[],addEventListener(){},createElement:()=>({}),
  head:{append(script){script.onload();}}
 };
 const turnstile={render(element,config){assert.equal(element,challenge);options=config;return 'test-widget';}};
 const context=vm.createContext({document,window:{turnstile},matchMedia:()=>({matches:false,addEventListener(){}}),localStorage:{getItem:()=>null,setItem(){}},location:{hash:'',pathname:'/en/feedback/',search:'',origin:'http://localhost'},URL,URLSearchParams,fetch:async(url)=>{requests.push(url);return{ok:true,json:async()=>({available:true})};}});
 new vm.Script(source).runInContext(context);
 await new Promise(resolve=>setImmediate(resolve));
 return{button,status,options,requests};
}

test('feedback selects a fitting widget and requires a live challenge token',async()=>{
 for(const [width,size]of [[284,'compact'],[354,'normal']]){
  const page=await openForm(width);
  assert.equal(page.options.size,size);
  assert.equal(page.options.action,'feedback');
  assert.equal(page.button.disabled,true);
  page.options.callback('test-token');
  assert.equal(page.button.disabled,false);
  page.options['expired-callback']();
  assert.equal(page.button.disabled,true);
  assert.equal(page.status.textContent,'Security error');
  assert.deepEqual(page.requests,['/api/feedback']);
 }
});
