const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // CONFIG
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (cfg) => ipcRenderer.invoke('config:save', cfg),
  showWindow: () => ipcRenderer.invoke('window:show'),
  onMediaCommand: (cb) => ipcRenderer.on('media:command', (_, command) => cb(command)),

  // FOLDER
  pickSaveFolder: () => ipcRenderer.invoke('folder:pick-save'),
  pickDownloadFolder: () => ipcRenderer.invoke('folder:pick-download'),
  openSaveFolder: () => ipcRenderer.invoke('folder:open-save'),

  // LIBRARY
  loadLibrary: () => ipcRenderer.invoke('library:load'),
  saveLibrary: (data) => ipcRenderer.invoke('library:save', data),
  exportLibrary: () => ipcRenderer.invoke('library:export'),
  importLibrary: () => ipcRenderer.invoke('library:import'),
  checkMissingFiles: (tracks) => ipcRenderer.invoke('files:check-missing', tracks),
  pickReplacementFile: () => ipcRenderer.invoke('files:pick-replacement'),

  // FILES
  pickFiles: () => ipcRenderer.invoke('files:pick'),
  pickFolder: () => ipcRenderer.invoke('files:pick-folder'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),

  getPathForFile: (file) => {
    try { return webUtils.getPathForFile(file); }
    catch (e) { return null; }
  },

  // QUEUE DOWNLOAD
  queueAdd: (urls, format, quality, saveDir) => ipcRenderer.invoke('queue:add', { urls, format, quality, saveDir }),
  queueRemove: (id) => ipcRenderer.invoke('queue:remove', id),
  queueRetry: (id) => ipcRenderer.invoke('queue:retry', id),
  queueClear: () => ipcRenderer.invoke('queue:clear'),
  queueClearDone: () => ipcRenderer.invoke('queue:clear-done'),
  cancelDownload: () => ipcRenderer.invoke('download:cancel'),
  onQueueUpdate: (cb) => {
    ipcRenderer.removeAllListeners('queue:update');
    ipcRenderer.on('queue:update', (_, data) => cb(data));
  },
  onQueueTrackDone: (cb) => {
    ipcRenderer.removeAllListeners('queue:track-done');
    ipcRenderer.on('queue:track-done', (_, track) => cb(track));
  },

  // METADATA EDITING
  editTrackMetadata: (payload) => ipcRenderer.invoke('track:edit-metadata', payload),

  // LYRICS
  fetchLyrics: (artist, title) => ipcRenderer.invoke('lyrics:fetch', { artist, title }),

  // BIN STATUS
  onBinStatus: (cb) => {
    ipcRenderer.removeAllListeners('bin-status');
    ipcRenderer.on('bin-status', (_, d) => cb(d));
  },
});
