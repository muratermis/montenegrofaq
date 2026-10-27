export const TYPES = new Set(['suggestion','correction','feature','removal']);
export function validate(data) {
 if(!data||typeof data!=='object'||Array.isArray(data)) return false;
 if(typeof data.message!=='string'||data.message.trim().length<10||data.message.length>2500) return false;
 if(!TYPES.has(data.type)||!['en','tr'].includes(data.locale)||data.consent!=='yes') return false;
 if(data.email && (typeof data.email!=='string'||data.email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(data.email)||/[\r\n]/.test(data.email))) return false;
 if(data.page){if(typeof data.page!=='string'||data.page.length>500)return false;try{const u=new URL(data.page);if(!['https:','http:'].includes(u.protocol))return false;}catch{return false;}}
 return true;
}
const response=(status,ok)=>Response.json({ok},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function onRequest(context) {
 const {request,env}=context;
 if(request.method!=='POST')return response(405,false);
 const origin=request.headers.get('Origin');
 const allowed=new Set(['https://montenegrofaq.org','https://montefaq.org',new URL(request.url).origin]);
 if(!origin||!allowed.has(origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return response(403,false);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response(415,false);
 if(Number(request.headers.get('Content-Length')||0)>14000)return response(413,false);
 let data;try{const raw=await request.text();if(raw.length>14000)return response(413,false);data=JSON.parse(raw);}catch{return response(400,false);}
 if(data?.website)return response(200,true);
 if(!validate(data))return response(400,false);
 // Fail closed until the owner configures delivery and shared rate-limit storage.
 if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID||!env.FEEDBACK_LIMITS)return response(503,false);
 try{
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.TELEGRAM_BOT_TOKEN+':'+ip));
 const key='feedback:'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')+':'+Math.floor(Date.now()/60000);
 const count=Number(await env.FEEDBACK_LIMITS.get(key)||0);
 if(count>=3)return response(429,false);
 await env.FEEDBACK_LIMITS.put(key,String(count+1),{expirationTtl:120});
 const message=['Montenegro FAQ · '+data.type,'Language: '+data.locale,'Page: '+(data.page||'—'),'Reply: '+(data.email||'—'),'',data.message.trim()].join('\n');
 const result=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:message,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(10000)});
 const delivery=await result.json();
 return result.ok&&delivery.ok?response(200,true):response(502,false);
 }catch{return response(502,false);}
}
