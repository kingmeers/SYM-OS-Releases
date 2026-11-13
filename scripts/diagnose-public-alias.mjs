import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const ORIGIN='https://downloads.sym.so', ALIAS='macos-x64.dmg';
const FROZEN={filename:'Sym-0.5.0-beta.39-macos-x64.dmg',size:312750821,sha256:'70cc2679132c0138013ad92df3203fc9af89be1315e96d92905ca61d819be518'};
const assertions=new Set(['Insecure TLS configuration rejected','Off-origin public URL','Public redirect rejected','Internal header leak','Wrong MIME','Wrong disposition','Missing range support','Unexpected encoding','Wrong cache policy','Public HEAD failed','Public GET failed','Public bytes mismatch','Public range failed','Range bytes mismatch','Resume failed','Resume bytes mismatch']);
const diagnosticCodes=new Set(['invalid_diagnostic_selection','channel_request_failed','frozen_channel_changed','frozen_asset_changed','diagnostic_request_blocked']);
const networkCodes=new Set(['UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','UND_ERR_SOCKET','ECONNRESET','ETIMEDOUT','ENOTFOUND']);
const hash=b=>createHash('sha256').update(b).digest('hex');
const fail=code=>{throw Object.assign(new Error(code),{diagnosticCode:code});};
export function failure(error){return diagnosticCodes.has(error?.diagnosticCode)?error.diagnosticCode:(error?.code==='SYM_VALIDATION' ? (assertions.has(error.message)?error.message:'unrecognized_validation') : networkCodes.has(error?.cause?.code||error?.code)?error.cause?.code||error.code:'network-storage-io');}
export async function diagnose({alias,expected,conflict='',fetcher=fetch,verify,log=()=>{}}){
 if(alias!==ALIAS||! /^[a-f0-9]{64}$/.test(expected||'')||conflict)fail('invalid_diagnostic_selection');
 const channelUrl=ORIGIN+'/channels/preview.json';
 const response=await fetcher(channelUrl,{method:'GET',headers:{'Accept-Encoding':'identity'},redirect:'manual'});
 if(response.status!==200||response.redirected||response.url!==channelUrl)fail('channel_request_failed');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>2*1024*1024||hash(bytes)!==expected)fail('frozen_channel_changed');
 const channel=JSON.parse(bytes),asset=channel.aliases?.[ALIAS];
 if(!asset||Object.entries(FROZEN).some(([k,v])=>asset[k]!==v)||asset.url!==ORIGIN+'/releases/0.5.0-beta.39/'+FROZEN.filename)fail('frozen_asset_changed');
 const url=ORIGIN+'/preview/'+ALIAS;let sequence=0;
 const observed=async(input,options={})=>{
  const method=options.method||'GET',range=new Headers(options.headers).get('Range');
  if(String(input)!==url||!['GET','HEAD'].includes(method)||options.body||options.redirect!=='manual'||new Headers(options.headers).has('Authorization')||new Headers(options.headers).has('Cookie')||range&&!/^bytes=\d+-\d+$/.test(range))fail('diagnostic_request_blocked');
  const index=++sequence,r=await fetcher(input,options),h=r.headers;
  const contentRange=h.get('content-range'),length=h.get('content-length'),etag=h.get('etag');
  log({phase:'response',index,method,range,status:r.status,length:/^\d{1,12}$/.test(length||'')?Number(length):null,contentRange:/^bytes \d+-\d+\/\d+$/.test(contentRange||'')?contentRange:null,etagSha256:/^"sha256-[a-f0-9]{64}"$/.test(etag||'')?etag.slice(8,-1):null,mimeMatches:h.get('content-type')==='application/x-apple-diskimage',dispositionMatches:h.get('content-disposition')===`attachment; filename="${FROZEN.filename}"`,cacheMatches:h.get('cache-control')==='no-cache, max-age=0, must-revalidate'});
  if(!r.body)return r;
  let size=0;const digest=createHash('sha256');
  const body=r.body.pipeThrough(new TransformStream({transform(chunk,controller){size+=chunk.byteLength;digest.update(chunk);controller.enqueue(chunk);},flush(){log({phase:'body',index,method,range,size,sha256:digest.digest('hex')});}}));
  const wrapped=new Response(body,{status:r.status,statusText:r.statusText,headers:r.headers});
  Object.defineProperties(wrapped,{url:{value:r.url},redirected:{value:r.redirected}});
  return wrapped;
 };
 log({phase:'selection',alias,channelSha256:expected,filename:FROZEN.filename,size:FROZEN.size,sha256:FROZEN.sha256});
 const result=await verify(asset,{url,immutable:false,fetcher:observed});
 return {passed:true,alias,channelSha256:expected,size:result.size,sha256:result.sha256,head:result.head,ranges:result.ranges};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const events=[];const log=e=>{events.push(e);console.log(JSON.stringify(e));};let result;
 try {const {publicVerify}=await import('../../publisher/scripts/network.js');result=await diagnose({alias:process.env.DIAGNOSTIC_ALIAS,expected:process.env.DIAGNOSTIC_EXPECTED,conflict:process.env.DIAGNOSTIC_CONFLICT,verify:publicVerify,log});}
 catch(error){result={passed:false,failure:failure(error)};process.exitCode=1;}
 await fs.mkdir('receipts',{recursive:true});await fs.writeFile('receipts/public-alias-diagnostic.json',JSON.stringify({result,events},null,2)+'\n',{mode:0o600});console.log(JSON.stringify(result));
}
