# Windows beta45 distribution review

Published GitHub prerelease452616856 (`v0.5.0-beta.45`) resolves to release-repository commit0c396eb79a6d75186005a8cc5332e9234fe620e4. Its11 uploaded asset IDs, SHA256 digests and sizes match local reviewed files. Finalized approval records those actual identities.

Runtime source45e6ed77d300d6e512c6e3d7b3a61610d9dc0843; final reviewed source4d5278666d7e35e232785686f64a7920ba34446a differs only in tests/workflow. Parent independently reports merged bridge653c2574d9010a51cc6923ff6483bb68d787a656 tree-equivalent to final reviewed source. Native-preview acceptance/signoff is authorized by the release operator for45 Windows tests, native boundary fixtures, compilation, package inspection and final CI. It does not claim OS installer execution, real sends or customer acceptance; evidence explicitly keeps installed acceptance false.

Catalog changes only latest.windows_preview44→45 and adds the Windows45 release. latest.preview remains39 and stable remains null. Every existing release entry remains unchanged. Scoped installer target windows-x64.exe; no Mac/Linux artifacts are replaced.

Exact Windows notices originally totaled20,966,095 bytes, above the pinned publisher16MiB text limit. A small index plus two verbatim ordered parts preserves the original aggregate SHA256222706e49b487db4014646cac7ea3f1988dae3443cfc09d2168ffaca49d6fc97. Index/provenance explain continued license sections and exact hashes/ranges. Generic third-party-notices.txt alias remains unchanged for retained platforms; windows-third-party-notices.txt identifies the new Windows collection. No publisher guard changed.

Pinned publisher c007b3a924c2650b0895a62bf772fa1317b74144 isolated candidate qualification passed20 source/evidence/publisher tests plus exact local bytes, checksum inventory, native evidence hashes, first-party feed URLs/SHA512, release schema, metadata limits and simulated Windows-only promotion preserving all Mac/Linux aliases. Receipt /tmp/sym-beta45-distribution-candidate-2/receipt.json. Final actual-GitHub-inventory approval qualification receipt: /tmp/sym-beta45-distribution-final-3/receipt.json (inspect status before merging).

Merge/promotion is separate and held for backend cutover by parent. Existing publish-downloads.yml runs the pinned protected publisher; wait for committed AND verified promotion receipt before claiming first-party distribution. Verify public Windows feed/installer and retained platform aliases. A committed-but-unverified operation requires explicit frozen-SHA recovery review, never blind retry.
