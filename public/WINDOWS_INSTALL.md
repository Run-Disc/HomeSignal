# Windows download (no Node, no terminal)

HomeSignal can run as an unsigned Windows app for people who should not have to install Node.js.

## Download

1. Open the public repository: https://github.com/Run-Disc/HomeSignal
2. Open **Actions** → workflow **Windows desktop** → the latest successful run → **HomeSignal-Setup** artifact.
3. If a version tag such as `v0.1.0` was published, download **HomeSignal-Setup.exe** from that GitHub Release instead.

This file is built on GitHub’s Windows runners. It is **not** a Microsoft Store app and is **not** code-signed.

## Windows SmartScreen

Windows may show “Windows protected your PC” because this hackathon build is unsigned.

- Click **More info**, then **Run anyway**, only if you downloaded the file from this GitHub project.
- Do not bypass SmartScreen for a copy that arrived by email or chat from someone else.

## Install and launch

1. Double-click `HomeSignal-Setup.exe`.
2. If SmartScreen appears, follow the step above.
3. Start **HomeSignal** from the Desktop or Start menu shortcut.
4. The app starts a local server on this computer only (`127.0.0.1`) and opens a window. It does not need the internet or an API key.

Reviews stay in this Windows user profile’s app storage for the snapshot version. They are not sent to the City.

## Uninstall

Use Windows **Settings → Apps → Installed apps → HomeSignal → Uninstall**, or the shortcut’s uninstall entry if the installer created one.

## If the window does not open

Re-download `HomeSignal-Setup.exe` from the repository Actions artifact or Release. This package does not include a runtime AI key and will not call an external model.
