// Review draft: intended archive/scripts entry from a dedicated manual workflow.
import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {verifyCommittedPreview} from './verify-beta58-committed-preview.mjs';
export async function prepareVerification({archiveDirectory=process.cwd(),publisherDirectory=resolve('../publisher'),env=process.env}={}) {
const expected='53e8ff603f5cd8c0ad2fd8fdf828a6122f7cf5a024954e7a60416098625bcde3';
assert.equal(env.VERIFY_EXPECTED_SHA256,expected);
assert.equal(env.GITHUB_REPOSITORY,'kingmeers/SYM-OS-Releases');
const publisher=resolve(publisherDirectory);assert.equal(execFileSync('git',['-C',publisher,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),'bc10518f45e714a83b0079b14efc864b0769491e');
const imp=p=>import(pathToFileURL(resolve(publisher,p)).href);
const {Store,digest}=await imp('scripts/store.js');const {canonical,validate}=await imp('lib/contracts.js');const {loadRelease,verifyChannel,defaultVerifyPointer}=await imp('scripts/publisher.js');const {publicVerify}=await imp('scripts/network.js');const {S3Client}=await imp('node_modules/@aws-sdk/client-s3/dist-cjs/index.js');
const approvalBytes=await fs.readFile(resolve(archiveDirectory,'release-approvals/0.5.0-beta.58.json'));assert.equal(digest(approvalBytes),'a5de0e5f340546b5754b81ade5dbae819236e2a8230934a043fee228e137c486');
const failedBytes=await fs.readFile(resolve(archiveDirectory,'incident-evidence/beta58-original-promotion.json'));assert.equal(digest(failedBytes),'ec798cb3167cd296e146619b5c8e255f4bc9fa23dc24614c4f65f6a34c011583');
const provenanceBytes=await fs.readFile(resolve(archiveDirectory,'incident-evidence/beta58-publication-provenance.json'));assert.equal(digest(provenanceBytes),'dc253e69f35ebbabc0a32ae253f8774b34dbfb186c0d54accae79e459f431b1f');const provenance=JSON.parse(provenanceBytes);assert.equal(provenance.publisherRun,45185084225);assert.equal(provenance.source,'549ab0629a2c0db6a373d49cfe193f9f86c126ea');assert.equal(provenance.event,'push');
const catalog=JSON.parse(await fs.readFile(resolve(archiveDirectory,'releases.json'),'utf8'));assert.equal(catalog.latest.preview,'0.5.0-beta.58');assert.equal(catalog.latest.windows_preview,'0.5.0-beta.58');
for(const name of ['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_R2_ACCESS_KEY_ID','CLOUDFLARE_R2_SECRET_ACCESS_KEY'])assert(env[name],`Missing ${name}`);
assert(/^[a-f0-9]{32}$/.test(env.CLOUDFLARE_ACCOUNT_ID));
// Same pinned Store credentials/endpoint/checksum policy, explicit SDK maxAttempts1.
// No automatic retry of an uncertain immutable control write. Public GET/HEAD
// retain the existing bounded transient-response retry policy.
const client=new S3Client({region:'auto',endpoint:`https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,credentials:{accessKeyId:env.CLOUDFLARE_R2_ACCESS_KEY_ID,secretAccessKey:env.CLOUDFLARE_R2_SECRET_ACCESS_KEY},requestChecksumCalculation:'WHEN_REQUIRED',responseChecksumValidation:'WHEN_REQUIRED',maxAttempts:1});
assert.equal(await client.config.maxAttempts(),1);
const raw=new Store(client),receiptKey=`control/verified-operations/preview/${expected}.json`;
const store={json:raw.json.bind(raw),verify:raw.verify.bind(raw),immutable:async(key,bytes)=>{assert.equal(key,receiptKey);return raw.immutable(key,bytes);}};
return {expected,client,store,approvalBytes,failedBytes,dependencies:{canonical,digest,validate,loadRelease,verifyChannel,verifyPointer:defaultVerifyPointer,publicVerify}};
}
export async function main(){
const {expected,client,store,approvalBytes,failedBytes,dependencies}=await prepareVerification();
await fs.mkdir('receipts',{recursive:true});
const localPath='receipts/beta58-verification-only.json';
try{
 const result=await verifyCommittedPreview({store,approval:JSON.parse(approvalBytes),failedReceipt:JSON.parse(failedBytes),expected,dependencies,onProgress:p=>console.log(JSON.stringify({verificationOnly:p})),saveReceipt:r=>fs.writeFile(localPath,JSON.stringify(r,null,2)+'\n',{flag:'wx',mode:0o600})});
 if(result.alreadyVerified)await fs.writeFile(localPath,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log('Existing committed revision48 fully verified; channel was not rewritten');
}catch{console.error('Verification-only failed; preserve original and new receipts. No automatic write retry or channel recovery.');process.exitCode=1;}finally{client.destroy();}

}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await main();
