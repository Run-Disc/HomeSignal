# macOS download (unsigned)

HomeSignal can run as an unsigned Mac app so judges do not have to install Node.js.

There is **no Apple Developer signing or notarization** in this repository. Gatekeeper will warn. That is expected.

## Files

GitHub Actions (`Desktop packages` on `macos-latest`) builds:

- `HomeSignal-mac-arm64.dmg` / `HomeSignal-mac-arm64.zip` — Apple Silicon
- `HomeSignal-mac-x64.dmg` / `HomeSignal-mac-x64.zip` — Intel

Download them from the [latest GitHub Release](https://github.com/Run-Disc/HomeSignal/releases/latest). The same files also appear in the `main` workflow's **HomeSignal-macos-arm64** and **HomeSignal-macos-x64** artifacts. They are **not** committed to the repo root because they exceed GitHub file limits.

Pick arm64 on M1/M2/M3/M4 Macs. Pick x64 on Intel Macs.

## Gatekeeper

macOS may say Apple could not verify the developer.

1. Open the DMG (or unzip the ZIP) and drag **HomeSignal** to Applications, or run it from the disk image.
2. If macOS blocks it: Finder → right-click the app → **Open** → **Open**.
3. Or: System Settings → Privacy & Security → Open Anyway, only for a file from this GitHub project.
4. Advanced: `xattr -cr /Applications/HomeSignal.app` then open the app. Use only on a copy you downloaded from this project.

Do not bypass Gatekeeper for a copy that arrived by email or chat.

## What it does

The app starts a local Next.js server on `127.0.0.1` and opens a window. It does not need the internet or an API key. Reviews stay in this Mac user profile. They are not sent to the City.

A log is at `~/Library/Application Support/HomeSignal/homesignal-desktop.log`.

This package does not include a runtime AI key and will not call Cursor, Grok, or any other model.
