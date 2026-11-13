import test from 'node:test';
import assert from 'node:assert/strict';
import {publishOnly} from '../scripts/publish-only.mjs';
const version='0.5.0-beta.42';
const catalog={releases:[{version,published:true,channel:'preview'}]};
const approval={finalized:true,nativeAcceptance:true,releaseSignoff:true,release:{version}};
function input(patch={}){const calls=[];return {calls,args:{version,read:async p=>structuredClone(p==='releases.json'?catalog:approval),publish:async a=>calls.push(a),...patch}};}
test('only immutable CLI receives exact reviewed approval and evidence; no promote/sync arguments',async()=>{const x=input();await publishOnly(x.args);assert.deepEqual(x.calls,[['publish','--approval',`release-approvals/${version}.json`,'--evidence','release-evidence','--download','--receipt',`receipts/${version}-publish-only.json`]]);});
for(const conflict of ['recovery','plugin','diagnostic'])test(`reject ${conflict} before reading or publishing`,async()=>{const x=input({conflict,read:()=>{throw Error('must not read');}});await assert.rejects(publishOnly(x.args),/cannot be combined/);assert.equal(x.calls.length,0);});
for(const bad of ['../42','', '42'])test(`reject invalid version ${bad}`,async()=>{const x=input({version:bad});await assert.rejects(publishOnly(x.args),/valid publish-only/);assert.equal(x.calls.length,0);});
for(const field of ['finalized','nativeAcceptance','releaseSignoff'])test(`reject missing ${field}`,async()=>{const x=input({read:async p=>p==='releases.json'?catalog:{...approval,[field]:false}});await assert.rejects(publishOnly(x.args),/finalized native/);assert.equal(x.calls.length,0);});
test('reject unreviewed catalog and mismatched approval version',async()=>{for(const mode of ['catalog','approval']){const x=input({read:async p=>p==='releases.json'?(mode==='catalog'?{releases:[]}:catalog):{...approval,release:{version:'other'}}});await assert.rejects(publishOnly(x.args));assert.equal(x.calls.length,0);}});
