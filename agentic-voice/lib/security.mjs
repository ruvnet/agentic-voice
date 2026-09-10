import {timingSafeEqual} from 'node:crypto';
export class HttpError extends Error {constructor(status){super('Request rejected');this.status=status}}
export function authorize(req, env=process.env) {
 const key=env.VOICE_ACCESS_TOKEN, origin=env.VOICE_ORIGIN;
 if(!key || key.length<32 || !origin) throw new HttpError(503);
 const header=req.headers.get('authorization')||'';
 if(!header.startsWith('Bearer '))throw new HttpError(401);
 const supplied=header.slice(7);
 if(Buffer.byteLength(supplied)!==Buffer.byteLength(key) || !timingSafeEqual(Buffer.from(supplied),Buffer.from(key))) throw new HttpError(401);
 if(req.headers.get('origin')!==origin) throw new HttpError(403);
}
export async function boundedBytes(body, limit=32768, timeout=5000){
 if(!body) throw new HttpError(400);
 const reader=body.getReader();let bytes=0,frames=0;const chunks=[];
 let timer;const expired=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new HttpError(408)),timeout)});
 try{while(true){const {done,value}=await Promise.race([reader.read(),expired]);if(done)break;if(++frames>4096 || (bytes+=value.byteLength)>limit) throw new HttpError(413);chunks.push(value)}return Buffer.concat(chunks,bytes)}finally{clearTimeout(timer);void reader.cancel().catch(()=>{})}
}
export async function readJSON(req){if(!req.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415);try{return JSON.parse((await boundedBytes(req.body)).toString('utf8'))}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400)}}
export function messages(value){if(!Array.isArray(value)||value.length<1||value.length>32)throw new HttpError(400);return value.map(m=>{if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>4096)throw new HttpError(400);return {role:m.role,content:m.content}})}
export function text(value){if(typeof value!=='string'||!value.trim()||value.length>4096)throw new HttpError(400);return value}
let active=0;
export function lease(){if(active>=4)throw new HttpError(429);active++;let released=false;return ()=>{if(!released){released=true;active--}}}
export function failure(e){return Response.json({error:'Request unavailable'},{status:e instanceof HttpError?e.status:502,headers:{'Cache-Control':'no-store'}})}
