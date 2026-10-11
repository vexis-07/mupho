# OutFix Player

A desktop music and video player for Windows, built with Electron. It includes playlist management and media downloading tools.

## Requirements

- Windows 10 or later
- Node.js (LTS)

## Run from source

```bash
npm install
npm start
```

## Build the Windows installer

```bash
npm install
npm run build
```

The installer is generated in `dist/` as `OutFix-Player-Setup-1.0.1.exe`. The build uses NSIS and maximum compression.

## Project files

- `main.js` — Electron main process
- `preload.js` — secure bridge between Electron and the UI
- `index.html` — application interface
- `renderer.js` — interface behavior
- `logo.ico`, `logo.png`, `logo.svg` — application icons

## License

MIT
