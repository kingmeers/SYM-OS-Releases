# SYM-OS Releases

Public distribution repository for SYM's Windows, Linux and macOS desktop installers.

**This repository does not contain application source code.** Installer binaries belong in [GitHub Releases](https://github.com/kingmeers/SYM-OS-Releases/releases), not Git history or Git LFS. Version metadata, checksums and release notes may be tracked here.

## Platforms

- Windows x64
- Linux x64
- macOS Apple Silicon (arm64)
- macOS Intel (x64)

Each platform has its own tested and recommended version. A release for one platform must not imply availability or acceptance on the others.

## Release contents

Each published release should include:

- Versioned, architecture-labelled installers.
- `SHA256SUMS.txt` covering the exact uploaded files.
- Release notes describing changes, supported platforms and known limitations.
- Explicit preview/stable status and macOS signing/notarization status.

Keep published versions and asset bytes immutable. Publish corrections under a new version. Mark unverified or unsigned builds clearly; building an installer is not proof of on-device acceptance or Apple notarization.

## Download policy

Link directly to GitHub Release assets so installer traffic does not pass through an application server or a metered VPS. A website archive can list these releases without hosting the binaries itself.

Do not store credentials, signing keys, customer data, diagnostic reports or private source in this repository. Build automation and its billing are separate from release-download hosting.

## Current releases

**[v0.5.0-beta.11 — v17 browser bookmarks](https://github.com/kingmeers/SYM-OS-Releases/releases/tag/v0.5.0-beta.11)** is the current preview for Linux, both Mac architectures and Windows. This supplies the companion transport required by Chrome extension v0.1.17 and preserves the shipped embedded-networking fixes. No second networking installation/login is needed.

| Platform | Download |
| --- | --- |
| Windows x64 — unsigned preview | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/Sym-Setup-0.5.0-beta.11-windows-x64.exe) |
| macOS Intel — signed/notarized | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/Sym-0.5.0-beta.11-mac-x64.dmg) |
| macOS Apple Silicon — signed/notarized | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/Sym-0.5.0-beta.11-mac-arm64.dmg) |
| Linux x64 AppImage | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/Sym-0.5.0-beta.11-linux-x64.AppImage) |
| Linux x64 Debian package | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/Sym-0.5.0-beta.11-linux-x64.deb) |

Final native package checks passed, including installed/mounted bookmark checks across all four platform/architecture targets. Both Mac apps are Developer ID signed, notarized and stapled; their exact final DMGs passed architecture-matched native acceptance. Windows remains an unsigned preview: normal SmartScreen/OS prompts may occur. Linux acceptance was Ubuntu/X11, not every desktop/distribution.

All public installers and supporting assets were independently downloaded anonymously and SHA-256 verified. [Checksums](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/SHA256SUMS.txt) · [Verification report](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.11/RELEASE-VERIFICATION.md).

Fully quit the existing app, including its tray/menu-bar process, before installing the matching update over it. Keep the v17 Chrome extension and existing Passes; do not reset application data. Ordinary OS/Keychain consent may still be required. Publishing these downloads does not upgrade or qualify an existing recipient machine. Unfinished native Computer Pass Control and automatic-update feeds are not promoted.

See `releases.json` for machine-readable platform status and checksums. Older releases remain available for rollback.

This archive does not automatically change installed-client updater feeds or website download links. Those remain separate rollout contracts.
