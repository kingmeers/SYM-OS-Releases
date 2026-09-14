# SYM-OS Releases

Public distribution repository for SYM's Linux and macOS desktop installers.

**This repository does not contain application source code.** Installer binaries belong in [GitHub Releases](https://github.com/kingmeers/SYM-OS-Releases/releases), not Git history or Git LFS. Version metadata, checksums and release notes may be tracked here.

## Platforms

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

## Current release

**[v0.5.0-beta.5 — private networking included](https://github.com/kingmeers/SYM-OS-Releases/releases/tag/v0.5.0-beta.5)** is the current Linux/Mac preview. Tailscale is bundled: no separate Tailscale installation or login.

| Platform | Download |
| --- | --- |
| macOS Intel | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.5/Symposium-Bridge-0.5.0-beta.5-mac-x64.dmg) |
| macOS Apple Silicon | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.5/Symposium-Bridge-0.5.0-beta.5-mac-arm64.dmg) |
| Linux x64 AppImage | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.5/Symposium-Bridge-0.5.0-beta.5-linux-x64.AppImage) |
| Linux x64 Debian package | [Download](https://github.com/kingmeers/SYM-OS-Releases/releases/download/v0.5.0-beta.5/Symposium-Bridge-0.5.0-beta.5-linux-x64.deb) |

Both Mac packages are signed and notarized. Final packages passed native acceptance checks; public downloads were independently SHA-256 verified. Fully quit the old Bridge before installing. Normal macOS Open/Keychain prompts can still occur. Windows is unchanged.

See `releases.json` for machine-readable platform status and checksums. Older releases remain available for rollback.

This archive does not automatically change installed-client updater feeds or website download links. Those remain separate rollout contracts.
