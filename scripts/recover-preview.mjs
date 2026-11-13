import fs from 'node:fs/promises';
import {failure as diagnosticFailure} from './diagnose-public-alias.mjs';

// Log only approved public paths and fixed categories, never SDK error text.
export function safeFailure(error) {
  if (error?.code === 'SYM_VALIDATION') return diagnosticFailure(error);
  const code = error?.cause?.code || error?.code;
  return ['UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','UND_ERR_SOCKET','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(code) ? code : 'network-storage-io';
}
export async function recoverPreview({store,version,expected,aliases,promote,publicVerify,verifyPointer,write=fs.writeFile,log=console.log}) {
  let lastFailure = null;
  const verified = async (asset,options={}) => {
    const url=new URL(options.url || asset.url);
    const path=url.origin==='https://downloads.sym.so' ? url.pathname : '(unapproved origin)';
    log(`Public verification started: ${path}`);
    try { const result=await publicVerify(asset,options); log(`Public verification passed: ${path}`); return result; }
    catch(error) { lastFailure={phase:'public',path,reason:safeFailure(error)}; log(`Public verification failed: ${path} [${lastFailure.reason}]`); throw error; }
  };
  const pointer=async channel=>{
    log('Channel pointer verification started');
    try {await verifyPointer(channel); log('Channel pointer verification passed');}
    catch(error){lastFailure={phase:'pointer',path:'/channels/preview.json',reason:safeFailure(error)};log(`Channel pointer verification failed [${lastFailure.reason}]`);throw error;}
  };
  const observedStore=new Proxy(store,{get(target,key){
    const value=target[key];
    if(key!=='immutable') return typeof value==='function'?value.bind(target):value;
    return async (...args)=>{
      const isReceipt=String(args[0]).startsWith('control/verified-operations/preview/');
      if(isReceipt)log('Writing verified-operation receipt');
      try{return await value.apply(target,args);}
      catch(error){if(isReceipt){lastFailure={phase:'receipt',reason:safeFailure(error)};log(`Verified-operation receipt write failed [${lastFailure.reason}]`);}throw error;}
    };
  }});
  try {
    const receipt=await promote({store:observedStore,version,channel:'preview',expectedSha256:expected,aliases,verifyPublic:verified,verifyPointer:pointer});
    await write('receipts/explicit-preview-recovery.json',JSON.stringify(receipt,null,2)+'\n',{mode:0o600});
    return receipt;
  } catch(error) {
    await write('receipts/explicit-preview-recovery.json',JSON.stringify({complete:false,failed:true,reason:lastFailure?.reason||safeFailure(error),...(lastFailure?{failure:lastFailure}:{}),...(error.receipt?{committedOperation:error.receipt}:{})},null,2)+'\n',{mode:0o600});
    throw new Error('Preview recovery failed; inspect sanitized progress and receipt');
  }
}
