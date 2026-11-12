import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

export async function publishApprovedPlugins({approval,assetRoot,publishPlugin,store,publish=false,onReceipt=async()=>{}}) {
 assert(/^\d+\.\d+\.\d+$/.test(approval.version) && approval.tag===`plugins-${approval.version}`,'Invalid plugin release');
 assert(Array.isArray(approval.items)&&approval.items.length>0&&approval.items.length<=20,'Invalid plugin inventory');
 const seen=new Set(),prepared=[];
 // Verify every signed artifact before changing any feed. Cross-feed atomicity
 // is not implied: each generation uses its own immutable reservation and CAS.
 for(const item of approval.items){
  assert(/^(cli|agents|outlook-desktop)-(linux|darwin|win32)-(x64|arm64)\.json$/.test(item.asset)&&!seen.has(item.asset),'Invalid or duplicate plugin asset');seen.add(item.asset);
  const bytes=await fs.readFile(path.join(assetRoot,item.asset));
  const m=JSON.parse(JSON.parse(bytes).payload);
  assert(`${m.id}-${m.platform}-${m.arch}.json`===item.asset&&m.version===approval.version,'Plugin identity mismatch');
  const args={store,bytes,publicKey:approval.publicKey,keyId:approval.keyId,qualification:item.qualification,expectedGeneration:item.expectedGeneration};
  await publishPlugin({...args,publish:false});prepared.push(args);
 }
 const receipts=[];
 for(const args of prepared){receipts.push(await publishPlugin({...args,publish}));await onReceipt(receipts);}
 return receipts;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [version,assetRoot,mode]=process.argv.slice(2);
 assert(/^\d+\.\d+\.\d+$/.test(version||''),'Explicit plugin version required');assert(['dry-run','publish'].includes(mode),'Explicit mode required');
 const {publishPlugin}=await import('../../publisher/scripts/plugin-publisher.js');
 const {Store,credentials}=await import('../../publisher/scripts/store.js');
 const approval=JSON.parse(await fs.readFile(`plugin-approvals/${version}.json`,'utf8'));
 await fs.mkdir('receipts',{recursive:true});
 const receipts=await publishApprovedPlugins({approval,assetRoot,publishPlugin,store:new Store(credentials()),publish:mode==='publish',onReceipt:async completed=>fs.writeFile(`receipts/plugins-${version}.json`,JSON.stringify(completed,null,2)+'\n')});
 console.log(`${receipts.length} plugin feeds ${mode==='publish'?'published':'validated'}`);
}
