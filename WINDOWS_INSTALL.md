# Windows download (no Node, no terminal)

HomeSignal can run as an unsigned Windows app for people who should not have to install Node.js.

## Download

Use the copy in this repository (also present if you **Download ZIP** from GitHub):

- Repository file: [HomeSignal-Setup.exe](./HomeSignal-Setup.exe)
- Direct link: https://github.com/Run-Disc/HomeSignal/raw/main/HomeSignal-Setup.exe

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

Re-download `HomeSignal-Setup.exe` from this repository. This package does not include a runtime AI key and will not call an external model.
