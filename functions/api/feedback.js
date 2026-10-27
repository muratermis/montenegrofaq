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
const hosts=new Set(['montenegrofaq.org','www.montenegrofaq.org','montefaq.org','www.montefaq.org']);
const configured=env=>Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID&&env.FEEDBACK_LIMITS&&env.TURNSTILE_SECRET_KEY);
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
export async function onRequest(context) {
 const {request,env}=context;
 if(request.method==='GET')return Response.json({available:configured(env)},{headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return response(405,false);
 const origin=request.headers.get('Origin');
 const allowed=new Set([...hosts].map(host=>'https://'+host));
 if(!origin||!allowed.has(origin)||request.headers.get('Sec-Fetch-Site')==='cross-site')return response(403,false);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response(415,false);
 if(Number(request.headers.get('Content-Length')||0)>14000)return response(413,false);
 let data;try{const reader=request.body?.getReader();if(!reader)return response(400,false);const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>14000){await reader.cancel();return response(413,false);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}data=JSON.parse(new TextDecoder().decode(bytes));}catch{return response(400,false);}
 if(data?.website)return response(200,true);
 if(!validate(data))return response(400,false);
 // Fail closed until the owner configures delivery and shared rate-limit storage.
 if(!configured(env))return response(503,false);
 const token=data['cf-turnstile-response'];
 if(typeof token!=='string'||!token||token.length>2048)return response(403,false);
 try{
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';
 const identity=await digest(env.TELEGRAM_BOT_TOKEN+':'+ip);
 // KV counters are best-effort across Cloudflare regions. Turnstile's single-use
 // server validation is the primary bot/replay defence; counters add throttling.
 const windows=[{period:60000,max:3,ttl:120},{period:3600000,max:10,ttl:7200}];
 for(const window of windows){const key=`feedback:${identity}:${window.period}:${Math.floor(Date.now()/window.period)}`;const count=Number(await env.FEEDBACK_LIMITS.get(key)||0);if(count>=window.max)return response(429,false);await env.FEEDBACK_LIMITS.put(key,String(count+1),{expirationTtl:window.ttl});}
 const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token}),signal:AbortSignal.timeout(10000)});
 const challenge=await verification.json();
 if(!verification.ok||!challenge.success||!hosts.has(challenge.hostname)||challenge.action!=='feedback')return response(403,false);
 const duplicateKey='delivered:'+await digest(identity+':'+JSON.stringify([data.type,data.locale,data.page||'',data.email||'',data.message.trim()]));
 if(await env.FEEDBACK_LIMITS.get(duplicateKey))return response(200,true);
 const labels={suggestion:'Öneri',correction:'Bilgi düzeltmesi',feature:'Özellik isteği',removal:'İçerik kaldırma'};
 const message=['Montenegro FAQ · '+labels[data.type],'Kayıt: '+crypto.randomUUID(),'Tarih (UTC): '+new Date().toISOString(),'Dil: '+data.locale,'Sayfa: '+(data.page||'—'),'Yanıt e-postası: '+(data.email||'—'),'',data.message.trim()].join('\n');
 const result=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:message,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(10000)});
 const delivery=await result.json();
 if(!result.ok||!delivery.ok)return response(502,false);
 // Delivery has succeeded even if caching its duplicate marker fails.
 try{await env.FEEDBACK_LIMITS.put(duplicateKey,'1',{expirationTtl:600});}catch{}
 return response(200,true);
 }catch{return response(502,false);}
}
