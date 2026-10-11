const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const https = require('https');
const http = require('http');
const { pathToFileURL } = require('url');

app.setName('OutFix Player');
app.setAppUserModelId('com.vexix.outfix');

let mm = null;
async function getMM() {
  if (!mm) mm = await import('music-metadata');
  return mm;
}

let mainWindow = null;
let tray = null;
let isQuitting = false;
let downloadQueue = [];
let activeDownload = null;
let queueIdCounter = 0;

const BIN_DIR = app.isPackaged
  ? path.join(app.getPath('userData'), 'bin')
  : path.join(__dirname, 'bin');

const YTDLP = path.join(BIN_DIR, 'yt-dlp.exe');
const FFMPEG_DIR = BIN_DIR;
const FFMPEG = path.join(BIN_DIR, 'ffmpeg.exe');

let DEFAULT_DIR;
try {
  DEFAULT_DIR = path.join(app.getPath('music'), 'OutFix Player');
} catch (e) {
  DEFAULT_DIR = path.join(app.getPath('userData'), 'Music', 'OutFix Player');
}

const LIB_PATH = path.join(app.getPath('userData'), 'outfix_library.json');
const CFG_PATH = path.join(app.getPath('userData'), 'outfix_config.json');
const QUEUE_PATH = path.join(app.getPath('userData'), 'outfix_download_queue.json');

function loadDownloadQueue() {
  try {
    const source = fs.existsSync(QUEUE_PATH) ? QUEUE_PATH : QUEUE_PATH + '.bak';
    const saved = JSON.parse(fs.readFileSync(source, 'utf8'));
    if (!Array.isArray(saved)) return;
    downloadQueue = saved.filter(item => item && Number.isSafeInteger(item.id) && typeof item.url === 'string')
      .map(item => ({ ...item, proc: undefined, status: item.status === 'downloading' ? 'pending' : item.status }))
      .filter(item => ['pending', 'done', 'error', 'cancelled'].includes(item.status));
    queueIdCounter = downloadQueue.reduce((max, item) => Math.max(max, item.id), 0);
  } catch (error) {
    if (error.code !== 'ENOENT') log('download queue restore error:', error.message);
  }
}

function saveDownloadQueue() {
  try {
    const snapshot = downloadQueue.map(item => ({
      id: item.id, url: item.url, title: item.title, status: item.status,
      progress: item.progress || 0, error: item.error ? String(item.error).slice(-4000) : null,
      format: item.format, quality: item.quality, speed: item.speed || '', eta: item.eta || '',
      saveDir: item.saveDir || '',
    }));
    const tempPath = QUEUE_PATH + '.tmp';
    const backupPath = QUEUE_PATH + '.bak';
    fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2), 'utf8');
    if (fs.existsSync(QUEUE_PATH)) {
      fs.rmSync(backupPath, { force: true });
      fs.renameSync(QUEUE_PATH, backupPath);
    }
    try {
      fs.renameSync(tempPath, QUEUE_PATH);
      fs.rmSync(backupPath, { force: true });
    } catch (error) {
      if (!fs.existsSync(QUEUE_PATH) && fs.existsSync(backupPath)) fs.renameSync(backupPath, QUEUE_PATH);
      throw error;
    }
  } catch (error) { log('download queue save error:', error.message); }
}

const YTDLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
const FFMPEG_URL = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
const DENO_URL = 'https://github.com/denoland/deno/releases/latest/download/deno-x86_64-pc-windows-msvc.zip';

const ICON_PATH = path.join(__dirname, 'logo.png');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'outfix',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: false,
    },
  },
]);

function log(...args) { console.log('[OutFix]', ...args); }

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1380,
    height: 850,
    minWidth: 720,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f',
    title: 'OutFix Player',
    icon: ICON_PATH,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      partition: 'persist:outfix',
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url);
      if (target.protocol === 'https:' && ['open.spotify.com', 'accounts.spotify.com'].includes(target.hostname)) {
        shell.openExternal(target.href).catch(() => {});
      }
    } catch (e) {}
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('=== OutFix Player started ===');
    log('UserData path:', app.getPath('userData'));
    log('Bin path:', BIN_DIR);
    log('Save dir:', loadConfig().saveDir);
    sendQueueUpdate();
    ensureBinFolder();
  });

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('close', (event) => {
    if (!isQuitting && tray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('app-command', (_event, command) => {
    const commands = { 'media-play-pause': 'toggle', 'media-next-track': 'next', 'media-previous-track': 'previous' };
    if (commands[command]) sendMediaCommand(commands[command]);
  });
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.show();
  mainWindow.focus();
}

function sendMediaCommand(command) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('media:command', command);
}

function createTray() {
  if (tray || !fs.existsSync(ICON_PATH)) return;
  try {
    tray = new Tray(ICON_PATH);
    tray.setToolTip('OutFix Player');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Show OutFix Player', click: showMainWindow },
      { type: 'separator' },
      { label: 'Play / Pause', click: () => sendMediaCommand('toggle') },
      { label: 'Previous Track', click: () => sendMediaCommand('previous') },
      { label: 'Next Track', click: () => sendMediaCommand('next') },
      { type: 'separator' },
      { label: 'Exit', click: () => { isQuitting = true; app.quit(); } },
    ]));
    tray.on('click', showMainWindow);
    tray.on('double-click', showMainWindow);
  } catch (e) { tray = null; log('system tray unavailable:', e.message); }
}

app.whenReady().then(() => {
  loadDownloadQueue();
  // Custom protocol for local file access
  protocol.handle('outfix', (request) => {
    try {
      let raw = request.url.replace(/^outfix:\/\//, '');
      raw = decodeURIComponent(raw);
      if (process.platform === 'win32' && raw.startsWith('/')) raw = raw.slice(1);
      const fileUrl = pathToFileURL(raw).toString();
      return net.fetch(fileUrl);
    } catch (e) {
      log('protocol error:', e.message);
      return new Response('Not found', { status: 404 });
    }
  });

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: 'OutFix Player',
      applicationVersion: '1.0.1',
      copyright: '© 2026 vexix-07',
      authors: ['vexix-07'],
      website: 'https://github.com/vexis-07',
      iconPath: ICON_PATH,
    });
  }

  createTray();
  createWindow();
  const sendGlobalMediaCommand = command => {
    if (process.platform !== 'darwin' && mainWindow && mainWindow.isFocused()) return;
    sendMediaCommand(command);
  };
  globalShortcut.register('Media Play/Pause', () => sendGlobalMediaCommand('toggle'));
  globalShortcut.register('Media Next Track', () => sendGlobalMediaCommand('next'));
  globalShortcut.register('Media Previous Track', () => sendGlobalMediaCommand('previous'));
});

app.on('before-quit', () => { isQuitting = true; globalShortcut.unregisterAll(); });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else showMainWindow();
});

// =========================================================
// AUTO-DOWNLOAD BINARIES (yt-dlp + ffmpeg + deno)
// =========================================================

async function ensureBinFolder() {
  try {
    if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true });

    const ytdlpOk = fs.existsSync(YTDLP);
    const ffmpegOk = fs.existsSync(FFMPEG);
    const denoOk = fs.existsSync(path.join(BIN_DIR, 'deno.exe'));

    if (ytdlpOk && ffmpegOk && denoOk) {
      log('[bin] all tools already installed');
      sendBinStatus('ready', 'Tools ready');
      processNextInQueue();
      return;
    }

    log('[bin] missing tools, downloading...');
    sendBinStatus('downloading', 'Installing tools (first run)...');

    if (!ytdlpOk) {
      sendBinStatus('progress', 'Downloading yt-dlp...');
      await downloadFile(YTDLP_URL, YTDLP);
      log('[bin] yt-dlp downloaded');
    }

    if (!ffmpegOk) {
      sendBinStatus('progress', 'Downloading ffmpeg (~80 MB)...');
      const zipPath = path.join(BIN_DIR, 'ffmpeg.zip');
      await downloadFile(FFMPEG_URL, zipPath);

      sendBinStatus('progress', 'Extracting ffmpeg...');
      try {
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${BIN_DIR}' -Force"`, { stdio: 'ignore' });
      } catch (e) {
        throw new Error('Could not extract ffmpeg: ' + e.message);
      }

      const entries = fs.readdirSync(BIN_DIR);
      for (const entry of entries) {
        const full = path.join(BIN_DIR, entry);
        if (fs.statSync(full).isDirectory() && entry.startsWith('ffmpeg-')) {
          const subBin = path.join(full, 'bin');
          if (fs.existsSync(subBin)) {
            for (const f of fs.readdirSync(subBin)) {
              fs.copyFileSync(path.join(subBin, f), path.join(BIN_DIR, f));
            }
          }
          try { fs.rmSync(full, { recursive: true, force: true }); } catch (e) {}
        }
      }
      try { fs.unlinkSync(zipPath); } catch (e) {}
      if (!fs.existsSync(FFMPEG)) throw new Error('ffmpeg.exe was not found after extraction');
      log('[bin] ffmpeg extracted');
    }

    if (!denoOk) {
      sendBinStatus('progress', 'Downloading Deno (JS runtime)...');
      const denoZip = path.join(BIN_DIR, 'deno.zip');
      try {
        await downloadFile(DENO_URL, denoZip);
        execSync(`powershell -Command "Expand-Archive -Path '${denoZip}' -DestinationPath '${BIN_DIR}' -Force"`, { stdio: 'ignore' });
        try { fs.unlinkSync(denoZip); } catch (e) {}
        log('[bin] deno downloaded');
      } catch (e) {
        log('[bin] deno download failed (optional):', e.message);
      }
    }

    if (!fs.existsSync(YTDLP) || !fs.existsSync(FFMPEG)) {
      throw new Error('Required tools are missing. Restart the app to try installing them again.');
    }
    sendBinStatus('ready', 'Tools installed');
    processNextInQueue();
  } catch (e) {
    log('ensureBinFolder error:', e.message);
    sendBinStatus('error', 'Failed: ' + e.message);
  }
}

function sendBinStatus(status, message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('bin-status', { status, message });
  }
}

function downloadFile(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));

    const transfer = url.startsWith('https') ? https : http;
    const tempPath = `${dest}.part-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let settled = false;
    let response = null;
    let output = null;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      if (output && !output.destroyed) {
        output.once('close', () => { try { fs.rmSync(tempPath, { force: true }); } catch (cleanupError) {} });
        output.destroy();
      } else {
        try { fs.rmSync(tempPath, { force: true }); } catch (cleanupError) {}
      }
      if (response && !response.destroyed) response.destroy();
      reject(error);
    };

    const request = transfer.get(url, { headers: { 'User-Agent': 'OutFixPlayer/1.0' } }, (res) => {
      response = res;
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return downloadFile(res.headers.location, dest, redirects + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return fail(new Error(`HTTP ${res.statusCode}`));
      }

      const file = output = fs.createWriteStream(tempPath, { flags: 'wx' });
      res.on('error', fail);
      file.on('error', fail);
      file.on('finish', () => {
        if (settled) return;
        file.close((closeError) => {
          if (closeError) return fail(closeError);
          try {
            fs.rmSync(dest, { force: true });
            fs.renameSync(tempPath, dest);
            settled = true;
            resolve(dest);
          } catch (error) { fail(error); }
        });
      });
      res.pipe(file);
    });
    request.setTimeout(30000, () => request.destroy(new Error('download timed out')));
    request.on('error', fail);
  });
}

// =========================================================
// METADATA EXTRACTION
// =========================================================

async function extractMetadata(filePath) {
  const result = { title: null, artist: null, album: null, duration: 0, cover: '' };
  try {
    const mmModule = await getMM();
    const metadata = await mmModule.parseFile(filePath, { duration: true });
    if (metadata.common.title) result.title = metadata.common.title;
    if (metadata.common.artist) result.artist = metadata.common.artist;
    if (metadata.common.album) result.album = metadata.common.album;
    if (metadata.format.duration) result.duration = metadata.format.duration;

    const pictures = metadata.common.picture || [];
    const pic = pictures.reduce((best, candidate) => candidate && candidate.data && (!best || candidate.data.length > best.data.length) ? candidate : best, null);
    if (pic) {
      const b64 = pic.data.toString('base64');
      result.cover = `data:${pic.format};base64,${b64}`;
    }
  } catch (e) {
    log('[cover] metadata error:', e.message);
  }
  return result;
}

// =========================================================
// CONFIG
// =========================================================

function loadConfig() {
  try {
    if (fs.existsSync(CFG_PATH)) {
      const data = fs.readFileSync(CFG_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    log('config load error:', e.message);
  }
  return { saveDir: DEFAULT_DIR };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2));
  } catch (e) {
    log('config save error:', e.message);
  }
}

ipcMain.handle('config:load', () => loadConfig());
ipcMain.handle('config:save', (_, cfg) => { saveConfig(cfg); return true; });

ipcMain.handle('window:show', () => { showMainWindow(); return true; });

ipcMain.handle('folder:pick-save', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const cfg = loadConfig();
  cfg.saveDir = result.filePaths[0];
  saveConfig(cfg);
  return cfg.saveDir;
});

ipcMain.handle('folder:pick-download', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  return result.canceled ? null : result.filePaths[0] || null;
});

ipcMain.handle('folder:open-save', () => {
  const cfg = loadConfig();
  if (fs.existsSync(cfg.saveDir)) shell.openPath(cfg.saveDir);
});

// =========================================================
// LIBRARY
// =========================================================

ipcMain.handle('library:load', () => {
  const candidates = [LIB_PATH, LIB_PATH + '.backup.json'];
  try {
    for (const name of fs.readdirSync(path.dirname(LIB_PATH))) {
      if (name.startsWith(path.basename(LIB_PATH) + '.restore.')) candidates.push(path.join(path.dirname(LIB_PATH), name));
    }
  } catch (e) {}
  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate)) continue;
      const data = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
      if (data && Array.isArray(data.tracks) && Array.isArray(data.playlists)) {
        if (candidate !== LIB_PATH) log('Recovered library from backup:', candidate);
        return data;
      }
    } catch (e) { log('library load error:', e.message); }
  }
  return { tracks: [], playlists: [] };
});

ipcMain.handle('library:save', (_, data) => {
  try {
    if (!data || !Array.isArray(data.tracks) || !Array.isArray(data.playlists)) return false;
    const serialized = JSON.stringify(data, null, 2);
    const tempPath = LIB_PATH + '.tmp';
    const restorePath = LIB_PATH + `.restore.${process.pid}`;
    fs.writeFileSync(tempPath, serialized, 'utf8');
    if (fs.existsSync(LIB_PATH)) {
      let previousLibraryIsValid = false;
      try {
        const previous = JSON.parse(fs.readFileSync(LIB_PATH, 'utf8'));
        previousLibraryIsValid = Array.isArray(previous.tracks) && Array.isArray(previous.playlists);
      } catch (e) {}
      if (previousLibraryIsValid) {
        const backupPath = LIB_PATH + '.backup.json';
        try {
          const backupIsRecent = fs.existsSync(backupPath) && Date.now() - fs.statSync(backupPath).mtimeMs < 24 * 60 * 60 * 1000;
          if (!backupIsRecent) fs.copyFileSync(LIB_PATH, backupPath);
        } catch (e) { log('library backup warning:', e.message); }
      }
      fs.renameSync(LIB_PATH, restorePath);
    }
    try {
      fs.renameSync(tempPath, LIB_PATH);
      try { if (fs.existsSync(restorePath)) fs.unlinkSync(restorePath); } catch (e) {}
    } catch (e) {
      if (!fs.existsSync(LIB_PATH) && fs.existsSync(restorePath)) fs.renameSync(restorePath, LIB_PATH);
      throw e;
    }
    return true;
  } catch (e) {
    log('library save error:', e.message);
    return false;
  }
});

ipcMain.handle('library:export', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export OutFix Library',
    defaultPath: path.join(app.getPath('documents'), 'outfix-library-backup.json'),
    filters: [{ name: 'JSON backup', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return false;
  try {
    const data = fs.existsSync(LIB_PATH) ? fs.readFileSync(LIB_PATH, 'utf8') : JSON.stringify({ tracks: [], playlists: [] }, null, 2);
    fs.writeFileSync(result.filePath, data, 'utf8');
    return true;
  } catch (e) { return { error: e.message }; }
});

ipcMain.handle('library:import', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import OutFix Library Backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON backup', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  try {
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
    if (!data || !Array.isArray(data.tracks) || !Array.isArray(data.playlists)) throw new Error('This file is not an OutFix library backup.');
    return data;
  } catch (e) { return { error: e.message }; }
});

// =========================================================
// FILE PICKER
// =========================================================

ipcMain.handle('files:pick', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio', extensions: ['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac'] },
      { name: 'Video', extensions: ['mp4', 'webm', 'mkv', 'mov', 'avi'] },
      { name: 'All', extensions: ['*'] },
    ],
  });
  if (result.canceled) return [];

  const tracks = [];
  for (const f of result.filePaths) {
    const baseName = path.basename(f);
    const ext = path.extname(f).slice(1).toLowerCase();
    const audioExts = ['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac'];
    const videoExts = ['mp4', 'webm', 'mkv', 'mov', 'avi'];
    if (!audioExts.includes(ext) && !videoExts.includes(ext)) continue;
    let title = baseName.replace(/\.[^.]+$/, '');
    let artist = 'Local file';
    let album = 'Local';
    let duration = 0;
    let cover = '';
    let size = '';

    try {
      const meta = await extractMetadata(f);
      if (meta.title) title = meta.title;
      if (meta.artist) artist = meta.artist;
      if (meta.album) album = meta.album;
      if (meta.duration) duration = meta.duration;
      if (meta.cover) cover = meta.cover;
    } catch (e) {}

    const isVideo = videoExts.includes(ext);
    try { size = (fs.statSync(f).size / 1024 / 1024).toFixed(1) + ' MB'; } catch (e) {}
    tracks.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title, artist, album, cover, duration,
      localPath: pathToFileURL(f).href,
      path: f, ext: ext.toUpperCase(),
      type: isVideo ? 'video' : 'audio',
      size,
      isLiked: false,
    });
  }
  return tracks;
});

ipcMain.handle('files:pick-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths[0]) return { tracks: [], truncated: false };
  const root = result.filePaths[0];
  const supported = new Set(['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac', 'mp4', 'webm', 'mkv', 'mov', 'avi']);
  const files = [];
  const maxFiles = 2500;
  const walk = (dir, depth) => {
    if (depth > 8 || files.length >= maxFiles) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const entry of entries) {
      if (files.length >= maxFiles) break;
      if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath, depth + 1);
      else if (entry.isFile() && supported.has(path.extname(entry.name).slice(1).toLowerCase())) files.push(fullPath);
    }
  };
  walk(root, 0);
  const tracks = [];
  for (const filePath of files) {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
    let title = path.basename(filePath, path.extname(filePath));
    let artist = 'Local file'; let album = path.basename(path.dirname(filePath));
    let duration = 0; let cover = '';
    let size = '';
    try {
      const meta = await extractMetadata(filePath);
      if (meta.title) title = meta.title;
      if (meta.artist) artist = meta.artist;
      if (meta.album) album = meta.album;
      if (meta.duration) duration = meta.duration;
      if (meta.cover) cover = meta.cover;
    } catch (e) {}
    try { size = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1) + ' MB'; } catch (e) {}
    tracks.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7), title, artist, album, cover, duration,
      localPath: pathToFileURL(filePath).href, path: filePath, ext: ext.toUpperCase(),
      type: isVideo ? 'video' : 'audio', size, isLiked: false,
    });
  }
  return { tracks, truncated: files.length >= maxFiles };
});

ipcMain.handle('files:check-missing', (_, items) => {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 20000).filter(item => item && item.id && item.path && !fs.existsSync(item.path)).map(item => String(item.id));
});

ipcMain.handle('files:pick-replacement', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio and video', extensions: ['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac', 'mp4', 'webm', 'mkv', 'mov', 'avi'] }],
  });
  return result.canceled ? null : result.filePaths[0] || null;
});

// =========================================================
// DOWNLOAD QUEUE SYSTEM
// =========================================================

function sendQueueUpdate() {
  saveDownloadQueue();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('queue:update', downloadQueue.map(q => ({
      id: q.id,
      url: q.url,
      title: q.title || q.url,
      status: q.status,
      progress: q.progress || 0,
      error: q.error || null,
      format: q.format,
      quality: q.quality,
      speed: q.speed || '',
      eta: q.eta || '',
      saveDir: q.saveDir || '',
    })));
  }
}

function buildArgs(url, format, quality, SAVE_DIR) {
  const outTemplate = path.join(SAVE_DIR, '%(title)s.%(ext)s');
  const printArgs = ['--print', 'after_move:filepath'];
  const denoExe = path.join(BIN_DIR, 'deno.exe');
  const jsRuntimeArgs = fs.existsSync(denoExe) ? ['--js-runtimes', 'deno'] : [];

  const base = [
    ...jsRuntimeArgs, ...printArgs,
    '-o', outTemplate, '--ffmpeg-location', FFMPEG_DIR,
    '--newline',
    // Note: no --no-playlist â†’ YouTube playlists are supported
  ];

  if (format === 'mp3') {
    return ['-x', '--audio-format', 'mp3', '--audio-quality', quality + 'K',
      '--embed-thumbnail', '--add-metadata', ...base, url];
  } else if (format === 'm4a') {
    return ['-x', '--audio-format', 'm4a', '--audio-quality', quality + 'K',
      '--embed-thumbnail', '--add-metadata', ...base, url];
  } else if (format === 'flac') {
    return ['-x', '--audio-format', 'flac', '--embed-thumbnail', '--add-metadata', ...base, url];
  } else if (format === 'mp4') {
    const h = quality === '1080' ? 1080 : quality === '720' ? 720 : 480;
    return ['-f', `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${h}][ext=mp4]/best`,
      '--merge-output-format', 'mp4', '--embed-thumbnail', '--add-metadata', ...base, url];
  } else if (format === 'webm') {
    const h = quality === '1080' ? 1080 : 720;
    return ['-f', `bestvideo[height<=${h}][ext=webm]+bestaudio[ext=webm]/best[height<=${h}][ext=webm]/best`, ...base, url];
  }
  return ['-f', 'best', ...base, url];
}

function updateDownloadTransferInfo(item, text) {
  const match = text.match(/\bat\s+([\d.]+\s*(?:[KMGT]i?B\/s|B\/s))\s+ETA\s+([\w:]+)/i);
  if (!match) return false;
  item.speed = match[1].replace(/\s+/g, '');
  item.eta = match[2];
  return true;
}

async function processNextInQueue() {
  if (activeDownload) return;
  const next = downloadQueue.find(q => q.status === 'pending');
  if (!next) {
    sendQueueUpdate();
    return;
  }

  activeDownload = next;
  next.status = 'downloading';
  next.progress = 0;
  next.speed = '';
  next.eta = '';
  sendQueueUpdate();

  const cfg = loadConfig();
  const SAVE_DIR = next.saveDir || cfg.saveDir || DEFAULT_DIR;
  try {
    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });
  } catch (e) {
    next.status = 'error'; next.error = 'Cannot create save folder: ' + e.message;
    activeDownload = null; sendQueueUpdate(); return processNextInQueue();
  }

  if (!fs.existsSync(YTDLP)) {
    next.status = 'error';
    next.error = 'yt-dlp.exe not found. Please restart the app.';
    activeDownload = null;
    sendQueueUpdate();
    return processNextInQueue();
  }

  const args = buildArgs(next.url, next.format, next.quality, SAVE_DIR);

  const spawnEnv = { ...process.env };
  const denoExe = path.join(BIN_DIR, 'deno.exe');
  if (fs.existsSync(denoExe)) {
    spawnEnv.PATH = BIN_DIR + path.delimiter + (spawnEnv.PATH || '');
  }

  const proc = spawn(YTDLP, args, { windowsHide: true, env: spawnEnv });
  next.proc = proc;

  let lastFile = '';
  const downloadedFiles = [];
  const downloadStartedAt = Date.now();
  let stderr = '';

  proc.stdout.on('data', (data) => {
    const str = data.toString();
    const lines = str.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect filename from destination
      const titleMatch = trimmed.match(/\[download\] Destination: (.+)/);
      if (titleMatch) {
        lastFile = titleMatch[1].trim();
        const baseName = path.basename(lastFile).replace(/\.[^.]+$/, '');
        if (!next.title || next.title === next.url) next.title = baseName;
      }

      const extract = line.match(/\[ExtractAudio\] Destination: (.+)/);
      if (extract) lastFile = extract[1].trim();

      const merge = line.match(/\[Merger\] Merging formats into "(.+)"/);
      if (merge) lastFile = merge[1].trim();

      const extMatch = trimmed.match(/\.(mp3|m4a|flac|mp4|webm|mkv|opus|wav|ogg|aac|mov|avi)$/i);
      if (extMatch && (trimmed.includes(':\\') || trimmed.startsWith('/'))) {
        lastFile = trimmed;
        if (fs.existsSync(trimmed) && !downloadedFiles.includes(trimmed)) downloadedFiles.push(trimmed);
        next.title = path.basename(trimmed).replace(/\.[^.]+$/, '');
      }

      const pct = line.match(/\[download\]\s+([\d.]+)%/);
      if (pct) {
        next.progress = parseFloat(pct[1]);
        sendQueueUpdate();
      }
      if (updateDownloadTransferInfo(next, line)) sendQueueUpdate();

      // Playlist progress
      const itemMatch = trimmed.match(/Downloading item (\d+) of (\d+)/);
      if (itemMatch) {
        next.title = `${next.url} [${itemMatch[1]}/${itemMatch[2]}]`;
        sendQueueUpdate();
      }
    }
  });

proc.stderr.on('data', (d) => {
    const chunk = d.toString();
    stderr = (stderr + chunk).slice(-65536);
    const pct = /\[download\]\s+([\d.]+)%/g;
    let match;
    let changed = false;
    while ((match = pct.exec(chunk)) !== null) {
      next.progress = Math.min(100, Math.max(0, parseFloat(match[1])));
      changed = true;
    }
    const item = chunk.match(/Downloading item (\d+) of (\d+)/);
    if (item) { next.title = `${next.url} [${item[1]}/${item[2]}]`; changed = true; }
    if (updateDownloadTransferInfo(next, chunk)) changed = true;
    if (changed) sendQueueUpdate();
  });

  proc.on('close', async (code) => {
    if (activeDownload !== next) return;
    next.proc = null;
    if (!downloadQueue.includes(next)) { activeDownload = null; sendQueueUpdate(); processNextInQueue(); return; }
    if (next.status === 'cancelled') { activeDownload = null; sendQueueUpdate(); processNextInQueue(); return; }

    if (code === 0) {
      const filesToImport = [...new Set(downloadedFiles.filter(file => fs.existsSync(file)))];
      if (filesToImport.length === 0 && lastFile && fs.existsSync(lastFile)) filesToImport.push(lastFile);
      if (filesToImport.length === 0) {
        try {
          const recent = fs.readdirSync(SAVE_DIR)
            .map(name => ({ path: path.join(SAVE_DIR, name), time: fs.statSync(path.join(SAVE_DIR, name)).mtimeMs }))
            .filter(file => file.time >= downloadStartedAt - 1000 && /\.(mp3|m4a|flac|mp4|webm|mkv|opus|wav|ogg|aac|mov|avi)$/i.test(file.path))
            .sort((a, b) => b.time - a.time);
          if (recent.length > 0) filesToImport.push(recent[0].path);
        } catch (e) {}
      }

      const importedTracks = [];
      for (const filePath of filesToImport) {
        if (!fs.existsSync(filePath)) continue;
        const baseName = path.basename(filePath);
        const ext = path.extname(filePath).slice(1).toLowerCase();
        let title = baseName.replace(/\.[^.]+$/, '');
        const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
        const sizeMB = (fs.statSync(filePath).size / 1024 / 1024).toFixed(1);
        let artist = 'YouTube';
        let album = 'OutFix Library';
        let duration = 0;
        let cover = '';

        try {
          const meta = await extractMetadata(filePath);
          if (meta.title) title = meta.title;
          if (meta.artist) artist = meta.artist;
          if (meta.album) album = meta.album;
          if (meta.duration) duration = meta.duration;
          if (meta.cover) cover = meta.cover;
        } catch (e) {}

        const track = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          title, artist, album,
          cover: cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1200&q=90',
          duration,
          localPath: pathToFileURL(filePath).href,
          path: filePath,
          ext: ext.toUpperCase(),
          type: isVideo ? 'video' : 'audio',
          size: sizeMB + ' MB',
          isLiked: false,
        };
        importedTracks.push(track);
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('queue:track-done', track);
      }

      if (importedTracks.length > 0) {
        next.status = 'done';
        next.progress = 100;
        next.track = importedTracks[importedTracks.length - 1];
        next.tracks = importedTracks;
        if (importedTracks.length > 1) next.title = `${importedTracks.length} tracks downloaded`;
        else next.title = importedTracks[0].title;
      } else {
        next.status = 'error';
        next.error = 'Downloaded file not found after download';
      }
    } else {
      next.status = 'error';
      next.error = stderr || `exit ${code}`;
    }

    activeDownload = null;
    sendQueueUpdate();
    processNextInQueue();
  });

  proc.on('error', (e) => {
    if (activeDownload !== next) return;
    next.proc = null;
    next.status = 'error';
    next.error = e.message;
    activeDownload = null;
    sendQueueUpdate();
    processNextInQueue();
  });
}

// Queue: add URL(s)
ipcMain.handle('queue:add', (_, payload = {}) => {
  const { urls, format, quality, saveDir } = payload && typeof payload === 'object' ? payload : {};
  const list = Array.isArray(urls) ? urls : [urls];
  const safeFormat = ['mp3', 'm4a', 'flac', 'mp4', 'webm'].includes(format) ? format : 'mp3';
  const safeQuality = safeFormat === 'mp4' || safeFormat === 'webm'
    ? (quality === '1080' ? '1080' : '720')
    : (['128', '192', '320'].includes(String(quality)) ? String(quality) : '192');
  const added = [];
  for (const url of list) {
    const trimmed = (typeof url === 'string' ? url : '').trim();
    if (!/^https?:\/\//i.test(trimmed) || trimmed.length > 4096) continue;
    const item = {
      id: ++queueIdCounter,
      url: trimmed,
      format: safeFormat,
      quality: safeQuality,
      saveDir: typeof saveDir === 'string' && path.isAbsolute(saveDir) ? path.normalize(saveDir) : '',
      status: 'pending',
      progress: 0,
      title: trimmed,
    };
    downloadQueue.push(item);
    added.push(item);
  }
  sendQueueUpdate();
  processNextInQueue();
  return { added: added.length };
});

ipcMain.handle('queue:remove', (_, id) => {
  const idx = downloadQueue.findIndex(q => q.id === id);
  if (idx < 0) return false;
  const item = downloadQueue[idx];
  downloadQueue.splice(idx, 1);
  if (item.status === 'downloading' && item.proc) {
    try { item.proc.kill('SIGKILL'); } catch (e) {}
    // Keep the active slot occupied until the child process emits close.
  }
  sendQueueUpdate();
  return true;
});
ipcMain.handle('queue:retry', (_, id) => {
  const item = downloadQueue.find(q => q.id === id);
  if (!item || !['error', 'cancelled'].includes(item.status) || (item === activeDownload && item.proc)) return false;
  item.status = 'pending'; item.progress = 0; item.error = null; item.speed = ''; item.eta = '';
  sendQueueUpdate(); processNextInQueue();
  return true;
});
ipcMain.handle('queue:clear', () => {
  downloadQueue = downloadQueue.filter(q => q.status === 'downloading');
  sendQueueUpdate();
  return true;
});

ipcMain.handle('queue:clear-done', () => {
  downloadQueue = downloadQueue.filter(q => q.status !== 'done' && q.status !== 'error' && q.status !== 'cancelled');
  sendQueueUpdate();
  return true;
});

ipcMain.handle('download:cancel', () => {
  if (activeDownload && activeDownload.proc) {
    activeDownload.status = 'cancelled';
    try { activeDownload.proc.kill('SIGKILL'); } catch (e) {}
    sendQueueUpdate();
    // Start another item after this process has fully closed.
    return true;
  }
  return false;
});
// =========================================================
// METADATA EDITING (via ffmpeg)
// =========================================================

ipcMain.handle('track:edit-metadata', async (_, { path: filePath, title, artist, album }) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      return resolve({ success: false, error: 'File does not exist' });
    }

    const ext = path.extname(filePath).slice(1).toLowerCase();
    if (!['mp3', 'm4a', 'flac', 'ogg', 'opus'].includes(ext)) {
      return resolve({ success: false, error: 'Format not supported' });
    }

    const tmpFile = filePath + '.outfix_tmp.' + ext;
    const metaArgs = [];

    if (title) metaArgs.push('-metadata', `title=${title}`);
    if (artist) metaArgs.push('-metadata', `artist=${artist}`);
    if (album) metaArgs.push('-metadata', `album=${album}`);

    if (metaArgs.length === 0) {
      return resolve({ success: false, error: 'No metadata fields to update' });
    }

    const args = [
      '-i', filePath,
      ...metaArgs,
      '-codec', 'copy',
      '-y',
      tmpFile,
    ];

    const proc = spawn(FFMPEG, args, { windowsHide: true });
    let stderr = '';

    proc.stderr.on('data', (d) => {
      stderr = (stderr + d.toString()).slice(-65536);
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(tmpFile)) {
        const backupFile = filePath + `.outfix_backup.${process.pid}.${Date.now()}.${ext}`;
        try {
          fs.renameSync(filePath, backupFile);
          fs.renameSync(tmpFile, filePath);
          try { fs.unlinkSync(backupFile); } catch (e) { log('metadata backup cleanup:', e.message); }
          resolve({ success: true });
        } catch (e) {
          try {
            if (!fs.existsSync(filePath) && fs.existsSync(backupFile)) fs.renameSync(backupFile, filePath);
          } catch (restoreError) { log('metadata restore error:', restoreError.message); }
          try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (cleanupError) {}
          resolve({ success: false, error: e.message });
        }
      } else {
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
        resolve({ success: false, error: stderr || `ffmpeg exit ${code}` });
      }
    });

    proc.on('error', (e) => {
      try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (cleanupError) {}
      resolve({ success: false, error: e.message });
    });
  });
});

// =========================================================
// READ FILE
// =========================================================

ipcMain.handle('file:read', (_, filePath) => {
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath);
    const b64 = data.toString('base64');
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = {
      mp3: 'audio/mpeg', m4a: 'audio/mp4', opus: 'audio/opus',
      wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', aac: 'audio/aac',
      mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
      mov: 'video/quicktime', avi: 'video/x-msvideo',
    }[ext] || 'application/octet-stream';
    return 'data:' + mime + ';base64,' + b64;
  } catch (e) { return null; }
});

// =========================================================
// LYRICS
// =========================================================

function requestLyricsJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'OutFixPlayer/1.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`Lyrics service returned HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => {
        data += chunk;
        if (data.length > 2 * 1024 * 1024) req.destroy(new Error('Lyrics response too large'));
      });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid lyrics response')); }
      });
    });
    req.setTimeout(12000, () => req.destroy(new Error('Lyrics request timed out')));
    req.on('error', reject);
  });
}

ipcMain.handle('lyrics:fetch', async (_, payload = {}) => {
  const artist = typeof payload.artist === 'string' ? payload.artist : '';
  const title = typeof payload.title === 'string' ? payload.title : '';
  const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
  const cleanArtist = artist.replace(/\(.*?\)|\[.*?\]/g, '').trim();
  const urlExact = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
  try {
    const exact = await requestLyricsJson(urlExact);
    if (exact && (exact.syncedLyrics || exact.plainLyrics)) return { success: true, data: exact };
  } catch (e) { log('exact lyrics lookup:', e.message); }

  try {
    const results = await requestLyricsJson(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + cleanArtist)}`);
    if (Array.isArray(results) && results.length) {
      const best = results.find(x => x.syncedLyrics || x.plainLyrics);
      if (best) return { success: true, data: best };
    }
    return { success: false, error: 'no lyrics found' };
  } catch (e) {
    return { success: false, error: e.message || 'network error' };
  }
});
