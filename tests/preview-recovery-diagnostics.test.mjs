import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recoverPreview,safeFailure} from '../scripts/recover-preview.mjs';
test('forwards frozen promotion parameters and preserves successful receipt',async()=>{
 const logs=[],writes=[];const aliases={a:'fixture'};const receipt={committed:true,verified:true};
 const store={immutable:async()=>42};
 const result=await recoverPreview({store,version:'0.5.0-beta.38',expected:'frozen',aliases,log:x=>logs.push(x),write:async(...args)=>writes.push(args),publicVerify:async()=>7,verifyPointer:async()=>{},promote:async args=>{
  assert.equal(args.expectedSha256,'frozen');assert.equal(args.aliases,aliases);assert.equal(args.channel,'preview');
  assert.equal(await args.verifyPublic({url:'https://downloads.sym.so/latest/test'}),7);await args.verifyPointer({});
  assert.equal(await args.store.immutable('control/verified-operations/preview/hash.json','bytes'),42);return receipt;
 }});assert.equal(result,receipt);assert.deepEqual(JSON.parse(writes[0][1]),receipt);assert.ok(logs.includes('Writing verified-operation receipt'));
});
test('failed public checks stay failed and never log raw exceptions',async()=>{
 const logs=[],writes=[];const error=Object.assign(new Error('SECRET_SIGNED_URL'),{cause:{code:'UND_ERR_BODY_TIMEOUT'}});
 await assert.rejects(recoverPreview({store:{},version:'v',expected:'hash',aliases:{},log:x=>logs.push(x),write:async(...args)=>writes.push(args),publicVerify:async()=>{throw error;},promote:async args=>{
  try {await args.verifyPublic({url:'https://downloads.sym.so/latest/test?secret=SECRET_QUERY'});}catch{const e=new Error('SECRET_WRAPPED');e.receipt={committed:true,verified:false};throw e;}
 }}),/inspect sanitized/);
 assert.ok(logs.some(x=>x.includes('UND_ERR_BODY_TIMEOUT')));assert.ok(!JSON.stringify(logs).includes('SECRET'));
 assert.deepEqual(JSON.parse(writes[0][1]).committedOperation,{committed:true,verified:false});assert.ok(!JSON.stringify(writes).includes('SECRET'));
});
test('unknown SDK details are reduced to fixed categories',()=>{
 assert.equal(safeFailure({code:'SECRET_CODE',message:'SECRET'}),'network-storage-io');assert.equal(safeFailure({code:'SYM_VALIDATION',message:'SECRET'}),'validation');
});
