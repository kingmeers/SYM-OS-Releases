// REVIEW DRAFT. No CLI or credential access. Caller must pin publisher bc105,
// frozen approval, original failed receipt and exact current channel SHA.
import assert from 'node:assert/strict';
export async function verifyCommittedPreview({store,approval,failedReceipt,expected,dependencies,saveReceipt,onProgress=()=>{}}) {
 const {canonical,digest,validate,loadRelease,verifyChannel,verifyPointer,publicVerify}=dependencies;
 assert.equal(expected,'008d8dcaf1683b7967889095e84f3692ffb25201c475dbc6dc8fdf6cd565cef5');
 assert.equal(approval.release.version,'0.5.0-beta.59');
 assert.equal(approval.release.assets.length,19);
 assert.equal(approval.finalized,true);assert.equal(approval.nativeAcceptance,true);
 validate('approval',approval);
 const priorFailure=failedReceipt.committedOperation;
 assert.equal(failedReceipt.failed,true);assert.equal(failedReceipt.complete,false);
 assert.equal(priorFailure.committed,true);assert.equal(priorFailure.verified,false);
 assert.equal(priorFailure.nextSha256,expected);assert.equal(priorFailure.revision,49);
 assert.equal(priorFailure.previousSha256,'53e8ff603f5cd8c0ad2fd8fdf828a6122f7cf5a024954e7a60416098625bcde3');
 const key='channels/preview.json',receiptKey=`control/verified-operations/preview/${expected}.json`;
 const current=await store.json(key);
 assert.equal(current?.sha256,expected);assert.equal(typeof current.etag,'string');assert(current.etag.length>0);assert.equal(current.value.revision,49);assert.equal(current.value.channel,'preview');
 assert.equal(digest(canonical(current.value)),expected);
 const original=await store.json(`control/operations/preview/${expected}.json`);
 for(const k of ['operation','channel','previousSha256','nextSha256','revision','committed'])assert.deepEqual(original?.value[k],priorFailure[k]);
 assert.equal(original.value.verified,false);assert.equal(original.value.channel,'preview');assert.equal(original.value.operation,'promotion');
 const existing=await store.json(receiptKey);
 if(existing){assert.equal(existing.value.committed,true);assert.equal(existing.value.verified,true);assert.equal(existing.value.nextSha256,expected);assert.equal(existing.value.revision,49);assert.equal(existing.value.channel,'preview');return {alreadyVerified:true,receipt:existing.value};}
 const {release,receipt:published}=await loadRelease(store,'0.5.0-beta.59');
 assert.equal(canonical(release),canonical(approval.release));
 assert.equal(published.approvalSha256,digest(canonical(approval)));
 assert.equal(published.manifestSha256,'e238a11ce627025e56b49e4daa1682254d6c122f6e7046364afcc8eed5cac2d0');
 for(const a of release.assets)assert(current.value.assets.some(x=>canonical(x)===canonical(a)));
 for(const a of release.assets.filter(x=>x.role==='installer'))assert.equal(canonical(current.value.aliases[a.target]),canonical(a));
 let completed=0,stage='stored_and_versioned_assets',path=null;
 const progress=(next,p=null)=>{stage=next;path=p;try{onProgress({stage,completed,...(path?{path}:{})});}catch{}};
 try {
  // Only read interfaces are supplied to the pinned verifier.
  await verifyChannel({verify:store.verify.bind(store)},current.value,publicVerify);
  progress('pointer','/channels/preview.json');await verifyPointer(current.value);completed++;
  for(const [name,a] of Object.entries(current.value.aliases)){
   const urls=[`https://downloads.sym.so/preview/${name}`,`https://downloads.sym.so/latest/${name}`];
   if(a.role==='feed'&&name===`${a.target}--${a.filename}`)urls.push(`https://downloads.sym.so/updates/preview/${a.target}/${a.filename}`);
   for(const url of urls){progress('alias',new URL(url).pathname);await publicVerify(a,{url,immutable:false});completed++;}
  }
  const unchanged=await store.json(key);assert.equal(unchanged?.sha256,expected);assert.equal(unchanged.etag,current.etag);
  assert.equal(canonical(unchanged.value),canonical(current.value));
  progress('verified_receipt');
  // The ONLY write. Never call put/promote/rollback or overwrite prior evidence.
  const receipt={...original.value,verified:true,progress:{stage,completed}};
  await store.immutable(receiptKey,canonical(receipt));
  const durable=await store.json(receiptKey);assert.equal(canonical(durable?.value),canonical(receipt));
  await saveReceipt({complete:true,verificationOnly:true,channelMutation:false,receipt});
  return receipt;
 }catch(error){
  await saveReceipt({complete:false,verificationOnly:true,channelMutation:false,expected,progress:{stage,completed,...(path?{path}:{})},...(error.publicVerification?{failure:error.publicVerification}:{failure:{category:'verification_or_storage'}})});
  throw new Error('Verification-only reconciliation failed; inspect receipt; channel was not mutated');
 }
}
