import {parse,serialize} from 'parse5';
export function sourceReferralUrl(value){const url=new URL(value);url.searchParams.set('utm_source','montenegrofaq.org');url.searchParams.set('utm_medium','referral');url.searchParams.set('utm_campaign','source_reference');return url.href;}

const internalHosts=new Set(['montenegrofaq.org','www.montenegrofaq.org','montefaq.org','www.montefaq.org']);
export function outboundReferralUrl(value){
 let url;try{url=new URL(value,'https://montenegrofaq.org');}catch{return value;}
 if(!['http:','https:'].includes(url.protocol)||internalHosts.has(url.hostname))return value;
 return sourceReferralUrl(url.href);
}
export function attributeOutboundLinks(html){
 const document=parse(html);
 function visit(node){
  if(node.tagName==='a'){const href=node.attrs?.find(a=>a.name==='href');if(href)href.value=outboundReferralUrl(href.value);}
  for(const child of node.childNodes||[])visit(child);
 }
 visit(document);return serialize(document);
}
