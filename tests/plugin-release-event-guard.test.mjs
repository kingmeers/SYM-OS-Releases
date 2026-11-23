import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../.github/workflows/publish-downloads.yml',import.meta.url),'utf8');
const job=source.slice(source.indexOf('  publish:\n'));
const expression=/^    if: \$\{\{ (.+) \}\}$/m.exec(job)?.[1];
test('actual publisher job expression skips only plugin release events',()=>{
 assert.ok(expression);
 for(const [event,tag,expected] of [['release','plugins-1.1.0',false],['release','plugins-1.0.0',false],['release','PLUGINS-1.2.0',false],['release','v0.5.0-beta.56',true],['release','v0.5.0-beta.56-notices.1',true],['schedule',undefined,true],['workflow_dispatch',undefined,true],['push',undefined,true]]){
  const github={event_name:event,event:tag?{release:{tag_name:tag}}:{},inputs:{plugin_version:event==='workflow_dispatch'?'1.1.0':''}};
  assert.equal(vm.runInNewContext(expression,{github,startsWith:(value,prefix)=>String(value??'').toLowerCase().startsWith(prefix.toLowerCase())},{timeout:100}),expected,`${event}:${tag}`);
 }
});
test('environment, concurrency and explicit plugin dispatch remain unchanged',()=>{
 assert.match(job,/^    environment: sym-publisher-preview$/m);
 assert.match(source,/group: sym-downloads-preview\n  cancel-in-progress: false/);
 assert.match(source,/plugin_version:\n\s+description:.*committed plugin approval/);
 assert.match(source,/PLUGIN_VERSION: \$\{\{ inputs\.plugin_version \}\}/);
 assert.equal((job.match(/^    if:/gm)||[]).length,1);
});
