import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export async function publishOnly({version,conflict='',read=async p=>JSON.parse(await fs.readFile(p,'utf8')),publish}) {
 assert(!conflict,'Publish-only cannot be combined with other modes');
 assert(/^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(version||''),'Explicit valid publish-only version required');
 const catalog=await read('releases.json');
 assert(catalog.releases.some(r=>r.version===version&&r.published===true&&r.channel==='preview'),'Publish-only requires reviewed published preview catalog entry');
 const file=`release-approvals/${version}.json`,approval=await read(file);
 assert(approval.finalized===true&&approval.nativeAcceptance===true&&approval.releaseSignoff===true&&approval.release.version===version,'Publish-only requires finalized native acceptance and signoff');
 // Existing CLI verifies source identity, evidence and every public immutable byte.
 // No channel store, promote function or sync-approved invocation is available here.
 return publish(['publish','--approval',file,'--evidence','release-evidence','--download','--receipt',`receipts/${version}-publish-only.json`]);
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href){
 const {main}=await import('../../publisher/scripts/publish.js');
 await fs.mkdir('receipts',{recursive:true});
 await publishOnly({version:process.env.PUBLISH_ONLY_VERSION,conflict:process.env.PUBLISH_ONLY_CONFLICT,publish:main});
}
