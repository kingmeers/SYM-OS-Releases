const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const workflow=fs.readFileSync('.github/workflows/publish-downloads.yml','utf8');
const guard=workflow.split('\n').find(line=>line.includes("'Recovery must match a reviewed current preview selection'"));
function check(preview,windows,version) {
  assert.ok(guard,'Recovery selection guard exists');
  vm.runInNewContext(guard,{assert,catalog:{latest:{preview,windows_preview:windows}},version});
}
test('ARM-only release can recover while retaining Windows',()=>check('0.5.0-beta.38','0.5.0-beta.37','0.5.0-beta.38'));
test('Selected Windows release can recover independently',()=>check('0.5.0-beta.38','0.5.0-beta.37','0.5.0-beta.37'));
test('Unified preview still recovers',()=>check('0.5.0-beta.37','0.5.0-beta.37','0.5.0-beta.37'));
test('Unselected version is rejected',()=>assert.throws(()=>check('0.5.0-beta.38','0.5.0-beta.37','0.5.0-beta.36')));
