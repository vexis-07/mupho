// =========================================================
// OutFix Player v1.1 — Frontend (English)
// =========================================================

const $ = (id) => document.getElementById(id);

const urlInput = $('url-input');
const fetchBtn = $('fetch-btn');
const trackRowsContainer = $('track-rows');
const trackDetailPage = $('track-detail-page');
const trackDetailMain = trackDetailPage?.querySelector('.track-detail-main');
const openTrackDetailBtn = $('open-track-detail-btn');
const trackDetailScrollIndicator = $('track-detail-scroll-indicator');
const trackDetailScrollThumb = trackDetailScrollIndicator?.querySelector('.track-detail-scroll-thumb');
let trackDetailScrollTimer = null;
if (trackDetailMain && trackDetailScrollIndicator && trackDetailScrollThumb) trackDetailMain.addEventListener('scroll', () => {
  const viewportHeight = trackDetailMain.clientHeight;
  const contentHeight = trackDetailMain.scrollHeight;
  if (contentHeight <= viewportHeight) return;
  const trackHeight = trackDetailScrollIndicator.clientHeight;
  const thumbHeight = Math.max(34, trackHeight * viewportHeight / contentHeight);
  const scrollRange = contentHeight - viewportHeight;
  const thumbRange = trackHeight - thumbHeight;
  const thumbTop = scrollRange > 0 ? (trackDetailMain.scrollTop / scrollRange) * thumbRange : 0;
  trackDetailScrollThumb.style.height = `${thumbHeight}px`;
  trackDetailScrollThumb.style.top = `${thumbTop}px`;
  trackDetailScrollIndicator.classList.add('visible');
  clearTimeout(trackDetailScrollTimer);
  trackDetailScrollTimer = setTimeout(() => trackDetailScrollIndicator.classList.remove('visible'), 900);
}, { passive: true });
let trackDetailCloseTimer = null;
const closeTrackDetailBtn = $('close-track-detail');
const trackDetailCover = $('track-detail-cover');
const trackDetailBackdrop = $('track-detail-backdrop');
const trackDetailTitle = $('track-detail-title');
const trackDetailArtist = $('track-detail-artist');
const trackDetailAlbum = $('track-detail-album');
const trackDetailAbout = $('track-detail-about');
const trackDetailLikeBtn = $('track-detail-like');
const trackDetailLyricsBtn = $('track-detail-lyrics');
const trackDetailFactArtist = $('track-detail-fact-artist');
const trackDetailFactAlbum = $('track-detail-fact-album');
const trackDetailFactFormat = $('track-detail-fact-format');
const trackDetailFactLength = $('track-detail-fact-length');
const formatSelect = $('format-select');
const qualitySelect = $('quality-select');
const downloadFolderBtn = $('download-folder-btn');
const searchInput = $('search-input');
const sortSelect = $('sort-select');
const importFilesBtn = $('import-files-btn');
const importFolderBtn = $('import-folder-btn');
const mediaFilter = $('media-filter');
const exportLibraryBtn = $('export-library-btn');
const importLibraryBtn = $('import-library-btn');
const subtitleBtn = $('subtitle-btn');
const fullscreenBtn = $('fullscreen-btn');
const subtitleFileInput = $('subtitle-file-input');

const playBtn = $('play-btn');
const heroPlayBtn = $('hero-play-btn');
const prevBtn = $('prev-btn');
const nextBtn = $('next-btn');
const shuffleBtn = $('shuffle-btn');
const repeatBtn = $('repeat-btn');
const speedBtn = $('speed-btn');

const mainHeartBtn = $('main-heart-btn');
const themeSelector = $('theme-selector');
const crossfadeSelect = $('crossfade-select');
const speedSelect = $('speed-select');

const navAll = $('nav-all');
const navFav = $('nav-fav');
const navSettings = $('nav-settings');
const navQueue = $('nav-queue');
const queueCount = $('queue-count');

const viewLibrary = $('view-library');
const viewSettings = $('view-settings');

const pickFolderBtn = $('pick-folder-btn');
const openFolderBtn = $('open-folder-btn');
const saveFolderPath = $('save-folder-path');

const playlistModal = $('playlist-modal');
const playlistModalTitle = $('playlist-modal-title');
const btnCreatePlaylist = $('btn-create-playlist');
const closePlaylistModal = $('close-playlist-modal');
const savePlaylistBtn = $('save-playlist-btn');
const playlistNameInput = $('playlist-name-input');
const playlistListContainer = $('playlist-list-container');
const playlistDetail = $('playlist-detail');
const importSpotifyBtn = $('btn-import-spotify');
const spotifyImportModal = $('spotify-import-modal');
const spotifyPlaylistName = $('spotify-playlist-name');
const spotifyPlaylistUrl = $('spotify-playlist-url');

const lyricsBtn = $('lyrics-btn');
const lyricsSidebar = $('lyrics-sidebar');
const closeLyricsPanel = $('close-lyrics-panel');
const lyricsScrollContainer = $('lyrics-scroll-container');

const sliderBg = $('slider-bg');
const sliderFill = $('slider-fill');
const currTime = $('curr-time');
const durTime = $('dur-time');

const volumeBg = $('volume-bg');
const volumeFill = $('volume-fill');
const volumeIcon = $('volume-icon');

const videoModal = $('video-modal');
const videoPlayer = $('video-player');
const closeVideoBtn = $('close-video');

const featTitle = $('feat-title');
const featSubtitle = $('feat-subtitle');
const featImg = $('feat-img');

const toastContainer = $('toast-container');
const confirmModal = $('confirm-modal');
const dropOverlay = $('drop-overlay');
const trackContextMenu = $('track-context-menu');

// Queue
const queuePanel = $('queue-panel');
const queueList = $('queue-list');
const closeQueuePanel = $('close-queue-panel');
const queueClearDone = $('queue-clear-done');
// Reveal themed scrollbars only while a scrollable panel is moving.
const themedScrollAreas = '.sidebar, .playlist-detail, .table-container, .settings-view, .lyrics-scroll-container, .queue-list';
const scrollEndTimers = new WeakMap();
document.addEventListener('scroll', (event) => {
  const area = event.target;
  if (!(area instanceof Element) || !area.matches(themedScrollAreas)) return;
  area.classList.add('is-scrolling');
  clearTimeout(scrollEndTimers.get(area));
  scrollEndTimers.set(area, setTimeout(() => area.classList.remove('is-scrolling'), 850));
}, true);

// Edit modal
const editModal = $('edit-modal');
const closeEditModal = $('close-edit-modal');
const cancelEditBtn = $('cancel-edit-btn');
const saveEditBtn = $('save-edit-btn');
const editTitle = $('edit-title');
const editArtist = $('edit-artist');
const editAlbum = $('edit-album');
const editCoverPreview = $('edit-cover-preview');

let audio = new Audio();
let standbyAudio = new Audio();
const audioDecks = [audio, standbyAudio];
let crossfadeToken = 0;
let crossfadeOutgoing = null;
let pendingIncomingAudio = null;
let autoCrossfadeStartedFor = null;
let tracks = [];
let playlists = [];
let activeIndex = -1;
let currentView = 'all';
let currentTab = 'library';
let playbackTrackIds = null;
let pendingTrackClickTimer = null;
let selectedDownloadDir = '';

let isShuffle = false;
let isRepeat = false;
let playbackSpeed = 1.0;
let crossfadeDuration = 2;
let isCrossfading = false;
let playbackRequestId = 0;
let lyricsRequestId = 0;
const fadeTokens = new WeakMap();

let parsedLyrics = [];
let activeLyricIndex = -1;
let editingPlaylistIndex = -1;
let contextMenuTrackIndex = -1;
let editingTrackIndex = -1;

let activeMedia = audio;
let activeVideoMode = false;
let subtitleObjectUrl = null;
let subtitleTrackForId = null;
let pendingVideoSeek = 0;
let lastPlaybackSaveAt = 0;
let isRestoringPlayback = false;
let missingTrackIds = new Set();
const PLAYBACK_STATE_KEY = 'outfix_playback_state';

const PLACEHOLDER_COVER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#222"/><text x="50" y="55" text-anchor="middle" fill="#666" font-size="30" font-family="sans-serif">♪</text></svg>`
);

// =========================================================
// UI HELPERS
// =========================================================

function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { info: 'fa-circle-info', success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  const icon = document.createElement('i');
  icon.className = 'fa-solid ' + (icons[type] || icons.info);
  const text = document.createElement('span');
  text.textContent = String(message ?? '');
  toast.append(icon, text);
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showConfirm(message, onConfirm) {
  if (!confirmModal) { if (confirm(message)) onConfirm(); return; }
  const msgEl = confirmModal.querySelector('#confirm-message');
  const okBtn = confirmModal.querySelector('#confirm-ok');
  const cancelBtn = confirmModal.querySelector('#confirm-cancel');
  if (msgEl) msgEl.textContent = message;
  confirmModal.style.display = 'flex';
  const cleanup = () => { confirmModal.style.display = 'none'; okBtn.onclick = null; cancelBtn.onclick = null; };
  okBtn.onclick = () => { cleanup(); onConfirm(); };
  cancelBtn.onclick = cleanup;
}

// =========================================================
// CONFIG
// =========================================================

const LOCAL_CFG_KEY = 'outfix_ui';

function loadUICfg() {
  try { return JSON.parse(localStorage.getItem(LOCAL_CFG_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveUICfg(cfg) {
  try { localStorage.setItem(LOCAL_CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function applyUICfg() {
  const cfg = loadUICfg();
  if (cfg.theme && themeSelector && Array.from(themeSelector.options).some(option => option.value === cfg.theme)) {
    document.documentElement.setAttribute('data-theme', cfg.theme);
    themeSelector.value = cfg.theme;
  }
  if (cfg.search && searchInput) searchInput.value = cfg.search;
  if (cfg.sort && sortSelect) sortSelect.value = cfg.sort;
  if (cfg.mediaFilter && mediaFilter) mediaFilter.value = cfg.mediaFilter;

  if (cfg.volume !== undefined) {
    const volume = Math.max(0, Math.min(1, Number(cfg.volume) || 0));
    audio.volume = volume;
    standbyAudio.volume = volume;
    videoPlayer.volume = volume;
    if (volumeFill) volumeFill.style.width = `${volume * 100}%`;
    updateVolumeIcon(volume);
  }
  if (cfg.speed !== undefined) {
    const speed = [0.5, 0.75, 1, 1.25, 1.5, 2].includes(Number(cfg.speed)) ? Number(cfg.speed) : 1;
    playbackSpeed = speed;
    audio.playbackRate = speed;
    videoPlayer.playbackRate = speed;
    if (speedSelect) speedSelect.value = speed;
    if (speedBtn) speedBtn.textContent = `${speed}x`;
  }
  if (cfg.crossfade !== undefined) {
    const fade = [0, 1, 2, 3, 5].includes(Number(cfg.crossfade)) ? Number(cfg.crossfade) : 2;
    crossfadeDuration = fade;
    if (crossfadeSelect) crossfadeSelect.value = fade;
  }
  isShuffle = Boolean(cfg.shuffle);
  isRepeat = Boolean(cfg.repeat);
  if (shuffleBtn) shuffleBtn.classList.toggle('active-toggle', isShuffle);
  shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
  if (repeatBtn) repeatBtn.classList.toggle('active-toggle', isRepeat);
  repeatBtn.setAttribute('aria-pressed', String(isRepeat));
}

applyUICfg();

// =========================================================
// INIT
// =========================================================

async function init() {
  try {
    const data = await window.api.loadLibrary();
    if (data) {
      tracks = Array.isArray(data.tracks) ? data.tracks.filter(t => t && typeof t === 'object' && t.id && t.localPath) : [];
      playlists = Array.isArray(data.playlists) ? data.playlists.filter(p => p && typeof p.name === 'string').map(p => ({ ...p, tracks: Array.isArray(p.tracks) ? p.tracks.filter(t => t && t.id) : [] })) : [];
    }
    missingTrackIds = new Set(await window.api.checkMissingFiles(tracks.map(t => ({ id: t.id, path: t.path }))));
    const cfg = await window.api.loadConfig();
    if (cfg && cfg.saveDir && saveFolderPath) {
      saveFolderPath.textContent = cfg.saveDir;
      if (!selectedDownloadDir) selectedDownloadDir = cfg.saveDir;
      if (downloadFolderBtn) downloadFolderBtn.title = `Save this batch to: ${selectedDownloadDir}`;
    }
  } catch (e) { console.error(e); }
  renderTracks();
  renderPlaylists();
  if (tracks.length > 0) updateFeaturedCard(tracks[tracks.length - 1]);
  restorePlaybackState();
}

async function saveLibrary() {
  try {
    const saved = await window.api.saveLibrary({ tracks, playlists });
    if (!saved) {
      showToast('Library could not be saved. Check available disk space and folder permissions.', 'error', 5000);
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    showToast('Library could not be saved: ' + e.message, 'error', 5000);
    return false;
  }
}

// =========================================================
// TAB NAVIGATION
// =========================================================

function switchTab(tab) {
  currentTab = tab;
  viewLibrary.classList.toggle('active', tab === 'library');
  viewSettings.classList.toggle('active', tab === 'settings');
  resetNavActive();
  if (tab === 'settings') navSettings.classList.add('active');
  else if (currentView === 'fav') navFav.classList.add('active');
  else if (currentView === 'all') navAll.classList.add('active');
  else {
    const activePlaylist = Array.from(playlistListContainer.children).find(item => item.dataset.playlistName === currentView);
    if (activePlaylist) activePlaylist.classList.add('active');
    else if (!playlists.some(pl => pl.name === currentView)) navAll.classList.add('active');
  }
}

navSettings.addEventListener('click', () => switchTab('settings'));

function setQueueOpen(open) {
  if (!queuePanel) return;
  queuePanel.classList.toggle('open', Boolean(open));
  document.body.classList.toggle('queue-open', Boolean(open));
}

if (downloadFolderBtn) downloadFolderBtn.addEventListener('click', async () => {
  const folder = await window.api.pickDownloadFolder();
  if (!folder) return;
  selectedDownloadDir = folder;
  downloadFolderBtn.title = `Save this batch to: ${folder}`;
  showToast('Download folder selected for the next batch.', 'success');
});

// =========================================================
// THEME
// =========================================================

if (themeSelector) {
  themeSelector.addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    const cfg = loadUICfg();
    cfg.theme = e.target.value;
    saveUICfg(cfg);
  });
}

// =========================================================
// SEARCH + SORT
// =========================================================

searchInput.addEventListener('input', () => {
  renderTracks();
  const cfg = loadUICfg();
  cfg.search = searchInput.value;
  saveUICfg(cfg);
});

sortSelect.addEventListener('change', () => {
  renderTracks();
  const cfg = loadUICfg();
  cfg.sort = sortSelect.value;
  saveUICfg(cfg);
});
if (mediaFilter) mediaFilter.addEventListener('change', () => {
  const cfg = loadUICfg(); cfg.mediaFilter = mediaFilter.value; saveUICfg(cfg); renderTracks();
});

function addLibraryTracks(incoming) {
  let added = 0;
  const knownIds = new Set(tracks.map(t => String(t.id)));
  const knownPaths = new Set(tracks.map(t => (t.path || '').toLowerCase()).filter(Boolean));
  for (const track of incoming || []) {
    if (!track || !track.localPath) continue;
    const filePath = (track.path || '').toLowerCase();
    if ((filePath && knownPaths.has(filePath)) || knownIds.has(String(track.id))) continue;
    tracks.push({ ...track, isLiked: Boolean(track.isLiked) });
    knownIds.add(String(track.id));
    if (filePath) knownPaths.add(filePath);
    added++;
  }
  return added;
}

if (importFilesBtn) {
  importFilesBtn.addEventListener('click', async () => {
    try {
      const imported = await window.api.pickFiles();
      const added = addLibraryTracks(imported);
      if (added) {
        if (!(await saveLibrary())) return;
        renderTracks();
        showToast(`${added} file(s) added to your library`, 'success');
      } else if (imported && imported.length) {
        showToast('Those files are already in your library.', 'info');
      }
    } catch (err) {
      showToast(`Could not import files: ${err.message}`, 'error');
    }
  });
}

if (importFolderBtn) {
  importFolderBtn.addEventListener('click', async () => {
    const originalLabel = '<i class="fa-solid fa-folder-plus"></i> Import Folder';
    importFolderBtn.disabled = true;
    importFolderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning…';
    try {
      const result = await window.api.pickFolder();
      const added = addLibraryTracks(result.tracks);
      if (added) {
        if (!(await saveLibrary())) return;
        await refreshMissingFiles();
        renderTracks();
        showToast(`${added} media file(s) imported from folder`, 'success');
      } else if (result.truncated) showToast('The folder scan reached its 2,500-file safety limit.', 'warning', 5000);
      else if (result.tracks.length === 0) showToast('No supported audio or video files found.', 'info');
      if (result.truncated && added) showToast('Folder scan stopped at 2,500 files.', 'warning', 5000);
    } catch (err) { showToast('Could not import folder: ' + err.message, 'error'); }
    finally { importFolderBtn.disabled = false; importFolderBtn.innerHTML = originalLabel; }
  });
}

async function refreshMissingFiles() {
  missingTrackIds = new Set(await window.api.checkMissingFiles(tracks.map(t => ({ id: t.id, path: t.path }))));
}

if (exportLibraryBtn) exportLibraryBtn.addEventListener('click', async () => {
  const result = await window.api.exportLibrary();
  if (result === true) showToast('Library backup exported.', 'success');
  else if (result && result.error) showToast('Could not export backup: ' + result.error, 'error');
});

if (importLibraryBtn) importLibraryBtn.addEventListener('click', async () => {
  const backup = await window.api.importLibrary();
  if (!backup) return;
  if (backup.error) { showToast('Could not restore backup: ' + backup.error, 'error'); return; }
  showConfirm(`Restore ${backup.tracks.length} tracks and ${backup.playlists.length} playlists? This replaces the current library.`, async () => {
    audio.pause(); audio.src = '';
    videoPlayer.pause(); videoPlayer.src = ''; videoModal.style.display = 'none';
    activeVideoMode = false; activeMedia = audio; activeIndex = -1;
    lyricsRequestId++; parsedLyrics = [];
    localStorage.removeItem(PLAYBACK_STATE_KEY);
    updatePlayUI(false);
    tracks = backup.tracks.filter(t => t && t.id && t.localPath);
    playlists = backup.playlists.filter(p => p && typeof p.name === 'string').map(p => ({ ...p, tracks: Array.isArray(p.tracks) ? p.tracks : [] }));
    if (!(await saveLibrary())) return;
    await refreshMissingFiles();
    renderTracks(); renderPlaylists();
    showToast('Library backup restored.', 'success');
  });
});

function getFilteredAndSorted() {
  let list = [...tracks];
  if (currentView === 'fav') list = list.filter(t => t.isLiked);
  else if (currentView !== 'all') {
    const pl = playlists.find(p => p.name === currentView);
    list = pl ? pl.tracks.map(saved => tracks.find(track => track.id === saved.id)).filter(Boolean) : [];
  }
  if (mediaFilter && mediaFilter.value !== 'all') list = list.filter(t => (t.type || 'audio') === mediaFilter.value);
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    list = list.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.album || '').toLowerCase().includes(q)
    );
  }
  const s = sortSelect.value;
  if (s === 'title-asc') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  else if (s === 'title-desc') list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  else if (s === 'artist-asc') list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
  else if (s === 'date-desc') list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  else if (s === 'date-asc') list.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  else if (s === 'duration-asc') list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
  else if (s === 'duration-desc') list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  else if (s === 'size-desc') list.sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
  return list;
}

function currentPlaylist() {
  return currentView !== 'all' && currentView !== 'fav' ? playlists.find(p => p.name === currentView) || null : null;
}

function formatPlaylistDuration(seconds) {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} hr ${minutes} min` : `${minutes} min`;
}

function renderPlaylistDetail(displayTracks) {
  if (!playlistDetail) return;
  const pl = currentPlaylist();
  const isPlaylist = Boolean(pl);
  const isSpotifyPlaylist = Boolean(pl && pl.spotifyId);
  const wasSpotifyPlaylist = document.body.classList.contains('spotify-embed-active');
  document.body.classList.toggle('spotify-embed-active', isSpotifyPlaylist);
  if (isSpotifyPlaylist && !wasSpotifyPlaylist) {
    audio.pause();
    videoPlayer.pause();
    if (activeVideoMode) {
      videoPlayer.src = '';
      videoModal.style.display = 'none';
      activeVideoMode = false;
      activeMedia = audio;
    }
    updatePlayUI(false);
  }
  viewLibrary.classList.toggle('playlist-mode', isPlaylist);
  viewLibrary.classList.toggle('spotify-playlist', isSpotifyPlaylist);
  if (!pl) { playlistDetail.innerHTML = ''; playlistDetail.dataset.signature = ''; return; }

  const signature = `${pl.name}|${pl.spotifyId || ''}|${displayTracks.map(t => t.id).join(',')}`;
  if (playlistDetail.dataset.signature === signature) return;
  playlistDetail.dataset.signature = signature;
  const totalDuration = displayTracks.reduce((sum, track) => sum + (Number(track.duration) || 0), 0);
  const cover = displayTracks.find(t => t.cover)?.cover || PLACEHOLDER_COVER;
  const safeName = escapeHtml(pl.name);
  if (pl.spotifyId) {
    const spotifyUrl = `https://open.spotify.com/playlist/${encodeURIComponent(pl.spotifyId)}`;
    playlistDetail.innerHTML = `
      <div class="playlist-hero">
        <div class="playlist-cover spotify-playlist-cover" role="img" aria-label="Spotify playlist"><i class="fa-brands fa-spotify"></i><span>Spotify</span></div>
        <div class="playlist-copy">
          <div class="playlist-eyebrow"><i class="fa-brands fa-spotify" style="color:#1ed760;margin-right:6px;"></i>Spotify playlist</div>
          <h1 class="playlist-title">${safeName}</h1>
          <p class="playlist-description">Listen in Spotify's official player below. Its playback controls are separate from OutFix; signing in may be required.</p>
          <div class="playlist-actions"><a class="playlist-open-link" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-spotify" style="color:#1ed760;margin-right:6px;"></i>Open in Spotify</a></div>
        </div>
      </div>
      <div class="spotify-embed-wrap"><iframe title="${safeName} on Spotify" src="https://open.spotify.com/embed/playlist/${encodeURIComponent(pl.spotifyId)}?theme=0" loading="lazy" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    return;
  }

  playlistDetail.innerHTML = `
    <div class="playlist-hero">
      <img class="playlist-cover" src="${escapeHtml(cover)}" alt="">
      <div class="playlist-copy">
        <div class="playlist-eyebrow">OutFix playlist</div>
        <h1 class="playlist-title">${safeName}</h1>
        <p class="playlist-description">A collection from your local music library. Drag tracks to reorder them.</p>
        <div class="playlist-meta"><strong style="color:var(--text);">OutFix Player</strong><span>·</span>${displayTracks.length} ${displayTracks.length === 1 ? 'track' : 'tracks'}<span>·</span>${formatPlaylistDuration(totalDuration)}</div>
      </div>
    </div>
    <div class="playlist-actions"><button class="playlist-action-play" id="playlist-hero-play" title="Play playlist"><i class="fa-solid fa-play"></i></button><span style="font-size:12px;color:var(--text-muted);">Play playlist</span></div>`;
  const playListButton = $('playlist-hero-play');
  if (playListButton) playListButton.addEventListener('click', () => {
    const list = getFilteredAndSorted();
    if (!list.length) { showToast('This playlist has no playable tracks yet.', 'info'); return; }
    playbackTrackIds = list.map(t => String(t.id));
    const currentIsInPlaylist = activeIndex >= 0 && playbackTrackIds.includes(String(tracks[activeIndex].id));
    if (currentIsInPlaylist) togglePlayPause();
    else playTrack(tracks.findIndex(t => String(t.id) === String(list[0].id)));
  });
}

function playTrackFromList(index, list) {
  playbackTrackIds = Array.isArray(list) ? list.map(track => String(track.id)) : null;
  playTrack(index);
}

function getPlaybackOrder() {
  const ids = playbackTrackIds && playbackTrackIds.length ? playbackTrackIds : tracks.map(track => String(track.id));
  return ids.map(id => tracks.findIndex(track => String(track.id) === String(id))).filter(index => index >= 0);
}

// =========================================================
// NAV
// =========================================================

navAll.addEventListener('click', () => { currentView = 'all'; switchTab('library'); renderTracks(); });
navFav.addEventListener('click', () => { currentView = 'fav'; switchTab('library'); renderTracks(); });
navQueue.addEventListener('click', () => setQueueOpen(true));

function resetNavActive() {
  navAll.classList.remove('active');
  navFav.classList.remove('active');
  navSettings.classList.remove('active');
  document.querySelectorAll('#playlist-list-container .nav-item').forEach(el => el.classList.remove('active'));
}

// =========================================================
// SAVE FOLDER
// =========================================================

pickFolderBtn.addEventListener('click', async () => {
  const dir = await window.api.pickSaveFolder();
  if (dir) {
    if (saveFolderPath) saveFolderPath.textContent = dir;
    selectedDownloadDir = dir;
    if (downloadFolderBtn) downloadFolderBtn.title = `Save this batch to: ${dir}`;
    showToast('Save folder changed', 'success');
  }
});

openFolderBtn.addEventListener('click', () => { window.api.openSaveFolder(); });

// =========================================================
// PLAYBACK SETTINGS
// =========================================================

if (crossfadeSelect) {
  crossfadeSelect.addEventListener('change', () => {
    crossfadeDuration = parseFloat(crossfadeSelect.value) || 0;
    const cfg = loadUICfg();
    cfg.crossfade = crossfadeDuration;
    saveUICfg(cfg);
    showToast(`Crossfade: ${crossfadeDuration}s`, 'info', 1500);
  });
}

if (speedSelect) {
  speedSelect.addEventListener('change', () => {
    playbackSpeed = parseFloat(speedSelect.value) || 1;
    audio.playbackRate = playbackSpeed;
    videoPlayer.playbackRate = playbackSpeed;
    if (speedBtn) speedBtn.textContent = `${playbackSpeed}x`;
    const cfg = loadUICfg();
    cfg.speed = playbackSpeed;
    saveUICfg(cfg);
  });
}

if (speedBtn) {
  speedBtn.addEventListener('click', () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    playbackSpeed = next;
    audio.playbackRate = next;
    videoPlayer.playbackRate = next;
    speedBtn.textContent = `${next}x`;
    if (speedSelect) speedSelect.value = next;
    const cfg = loadUICfg();
    cfg.speed = next;
    saveUICfg(cfg);
    showToast(`Speed: ${next}x`, 'info', 1000);
  });
}

// =========================================================
function syncQualityOptions() {
  const isVideo = ['mp4', 'webm'].includes(formatSelect.value);
  const options = isVideo ? [['720', '720p'], ['1080', '1080p']] : [['128', '128 kbps'], ['192', '192 kbps'], ['320', '320 kbps']];
  const previous = qualitySelect.value;
  qualitySelect.replaceChildren(...options.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
  qualitySelect.value = options.some(([value]) => value === previous) ? previous : (isVideo ? '720' : '192');
}
formatSelect.addEventListener('change', syncQualityOptions);
syncQualityOptions();
// DOWNLOAD QUEUE
// =========================================================

fetchBtn.addEventListener('click', async () => {
  const raw = urlInput.value.trim();
  if (!raw) { showToast('Please paste a URL first!', 'warning'); return; }

  const urls = raw.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
  if (urls.length === 0) { showToast('No valid URL found', 'warning'); return; }

  try {
    const res = await window.api.queueAdd(urls, formatSelect.value, qualitySelect.value, selectedDownloadDir);
    if (res && res.added > 0) {
      urlInput.value = '';
      showToast(`${res.added} URL(s) added to queue`, 'success');
      setQueueOpen(true);
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
});

function renderQueue(queue) {
  if (!queue) return;

  const active = queue.filter(q => q.status === 'pending' || q.status === 'downloading').length;
  if (queueCount) {
    if (active > 0) {
      queueCount.textContent = active;
      queueCount.style.display = 'inline-block';
    } else {
      queueCount.style.display = 'none';
    }
  }

  queueList.innerHTML = '';
  if (queue.length === 0) {
    queueList.innerHTML = '<div style="color:var(--text-muted); font-size:12px; text-align:center; margin-top:40px;">Queue is empty. Add URLs above.</div>';
    return;
  }

  queue.forEach(item => {
    const el = document.createElement('div');
    el.className = `queue-item ${item.status}`;
    const statusLabels = {
      pending: 'Pending',
      downloading: 'Downloading',
      done: 'Done',
      error: 'Error',
      cancelled: 'Cancelled',
    };
    el.innerHTML = `
      <div class="queue-item-title">${escapeHtml(item.title || item.url)}</div>
      <div class="queue-item-url">${escapeHtml(item.url)}</div>
      ${item.saveDir ? `<div class="queue-item-url" title="${escapeHtml(item.saveDir)}">Save folder: ${escapeHtml(item.saveDir)}</div>` : ''}
      <div class="queue-progress-track">
        <div class="queue-progress-fill" style="width: ${item.progress || 0}%"></div>
      </div>
      <div class="queue-transfer-info">${escapeHtml([item.speed, item.eta ? `ETA ${item.eta}` : ''].filter(Boolean).join(' · '))}</div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="queue-item-status ${item.status}">${statusLabels[item.status] || item.status}</span>
        <span style="font-size:10px; color:var(--text-muted);">${item.format.toUpperCase()}  ·  ${item.quality}</span>
      </div>
      <button type="button" class="fa-solid fa-xmark queue-item-remove" data-id="${item.id}" title="Remove from queue" aria-label="Remove ${escapeHtml(item.title || item.url)} from queue"></button>
    `;
    if (item.error) {
      const errorDetails = document.createElement('details');
      errorDetails.className = 'queue-error-details';
      const summary = document.createElement('summary');
      summary.textContent = 'View error details';
      const message = document.createElement('pre');
      message.textContent = String(item.error).slice(-1600);
      errorDetails.append(summary, message);
      el.appendChild(errorDetails);
    }
    el.querySelector('.queue-item-remove').addEventListener('click', async (e) => {
      e.stopPropagation();
      await window.api.queueRemove(item.id);
    });
    if (item.status === 'error' || item.status === 'cancelled') {
      const retry = document.createElement('button');
      retry.className = 'queue-retry-btn';
      retry.textContent = 'Retry';
      retry.addEventListener('click', () => window.api.queueRetry(item.id));
      el.appendChild(retry);
    }
    queueList.appendChild(el);
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

window.api.onQueueUpdate((q) => renderQueue(q));

window.api.onQueueTrackDone((track) => {
  const added = addLibraryTracks([track]);
  if (!added) return;
  saveLibrary();
  renderTracks();
  updateFeaturedCard(track);
  showToast('Downloaded: ' + track.title, 'success');
});

if (closeQueuePanel) closeQueuePanel.addEventListener('click', () => setQueueOpen(false));
if (queueClearDone) queueClearDone.addEventListener('click', async () => {
  await window.api.queueClearDone();
});

// =========================================================
// FEATURED CARD
// =========================================================

function updateFeaturedCard(track) {
  if (!track) return;
  if (featTitle) featTitle.textContent = track.title || 'Unknown';
  if (featSubtitle) featSubtitle.textContent = `${track.artist || 'Unknown'}  ·  ${track.ext || 'AUDIO'}`;
  if (featImg) { featImg.src = track.cover || PLACEHOLDER_COVER; featImg.dataset.trackId = String(track.id); }
}

function updateTrackDetail(track) {
  if (!track || !trackDetailPage) return;
  const cover = track.cover || PLACEHOLDER_COVER;
  const artist = track.artist || 'Unknown artist';
  const album = track.album || 'Unknown album';
  const format = (track.ext || track.type || 'Audio').toString().replace(/^\./, '').toUpperCase();
  trackDetailCover.src = cover;
  trackDetailBackdrop.src = cover;
  trackDetailTitle.textContent = track.title || 'Unknown track';
  trackDetailArtist.textContent = artist;
  trackDetailAlbum.textContent = `${album}${track.ext ? ` · ${track.ext}` : ''}`;
  if (trackDetailAbout) trackDetailAbout.textContent = `${artist} is listed as the artist for “${track.title || 'this track'}” in your OutFix library${album && album !== 'Unknown album' ? `, from ${album}` : ''}.`;
  if (trackDetailFactArtist) trackDetailFactArtist.textContent = artist;
  if (trackDetailFactAlbum) trackDetailFactAlbum.textContent = album;
  if (trackDetailFactFormat) trackDetailFactFormat.textContent = format;
  if (trackDetailFactLength) trackDetailFactLength.textContent = Number(track.duration) > 0 ? formatTime(track.duration) : 'Not available';
  const liked = Boolean(track.isLiked);
  if (trackDetailLikeBtn) {
    trackDetailLikeBtn.classList.toggle('liked', liked);
    trackDetailLikeBtn.innerHTML = `<i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i><span>${liked ? 'In Favorites' : 'Save to Favorites'}</span>`;
  }
}

function openTrackDetail(index, list) {
  if (index < 0 || index >= tracks.length || !trackDetailPage) return;
  if (trackDetailCloseTimer) { clearTimeout(trackDetailCloseTimer); trackDetailCloseTimer = null; }
  trackDetailPage.classList.remove('closing');
  if (Array.isArray(list)) playbackTrackIds = list.map(track => String(track.id));
  document.body.classList.add('track-detail-open');
  trackDetailPage.classList.add('open');
  trackDetailPage.classList.toggle('is-playing', !activeMedia.paused);
  trackDetailPage.setAttribute('aria-hidden', 'false');
  updateTrackDetail(tracks[index]);
  if (activeIndex !== index) playTrack(index);
}

function closeTrackDetail() {
  if (!trackDetailPage) return;
  if (!trackDetailPage.classList.contains('open') || trackDetailPage.classList.contains('closing')) return;
  trackDetailPage.classList.add('closing');
  trackDetailPage.setAttribute('aria-hidden', 'true');
  trackDetailCloseTimer = setTimeout(() => {
    trackDetailPage.classList.remove('open', 'closing');
    document.body.classList.remove('track-detail-open');
    trackDetailCloseTimer = null;
  }, 380);
}

if (openTrackDetailBtn) openTrackDetailBtn.addEventListener('click', () => {
  if (trackDetailPage?.classList.contains('open')) {
    closeTrackDetail();
    return;
  }
  if (activeIndex >= 0) openTrackDetail(activeIndex, getPlaybackOrder().map(index => tracks[index]));
});
if (closeTrackDetailBtn) closeTrackDetailBtn.addEventListener('click', closeTrackDetail);
if (trackDetailLikeBtn) trackDetailLikeBtn.addEventListener('click', () => {
  if (activeIndex < 0 || activeIndex >= tracks.length) return;
  tracks[activeIndex].isLiked = !tracks[activeIndex].isLiked;
  saveLibrary(); updateMainHeart(); renderTracks(); updateTrackDetail(tracks[activeIndex]);
});
if (trackDetailLyricsBtn) trackDetailLyricsBtn.addEventListener('click', () => {
  closeTrackDetail();
  if (lyricsSidebar && lyricsSidebar.style.display !== 'flex' && lyricsBtn) lyricsBtn.click();
});
if (trackDetailCover) trackDetailCover.addEventListener('error', () => { trackDetailCover.src = PLACEHOLDER_COVER; });
if (featImg) featImg.addEventListener('dblclick', () => {
  const index = tracks.findIndex(track => String(track.id) === featImg.dataset.trackId);
  if (index >= 0) openTrackDetail(index, getFilteredAndSorted());
});
const nowPlayingCover = $('np-cover');
if (nowPlayingCover) nowPlayingCover.addEventListener('dblclick', () => { if (activeIndex >= 0) openTrackDetail(activeIndex, getPlaybackOrder().map(index => tracks[index])); });

function savePlaybackState(force = false) {
  if (isRestoringPlayback) return;
  if (activeIndex < 0 || !tracks[activeIndex]) return;
  const now = Date.now();
  if (!force && now - lastPlaybackSaveAt < 4000) return;
  lastPlaybackSaveAt = now;
  const media = activeVideoMode ? videoPlayer : audio;
  try {
    localStorage.setItem(PLAYBACK_STATE_KEY, JSON.stringify({
      trackId: String(tracks[activeIndex].id),
      queueTrackIds: playbackTrackIds,
      time: Number.isFinite(media.currentTime) ? media.currentTime : 0,
      wasPlaying: !media.paused,
      savedAt: now,
    }));
  } catch (e) {}
}

function restorePlaybackState() {
  let state;
  try { state = JSON.parse(localStorage.getItem(PLAYBACK_STATE_KEY) || 'null'); } catch (e) { return; }
  if (!state || typeof state.trackId !== 'string' || !Number.isFinite(state.time)) return;
  playbackTrackIds = Array.isArray(state.queueTrackIds)
    ? state.queueTrackIds.map(String).filter(id => tracks.some(track => String(track.id) === id))
    : null;
  const index = tracks.findIndex(track => String(track.id) === state.trackId);
  if (index < 0) return;
  activeIndex = index;
  const track = tracks[index];
  updateFeaturedCard(track);
  document.getElementById('np-title').textContent = track.title || 'Unknown';
  document.getElementById('np-artist').textContent = track.artist || 'Unknown';
  document.getElementById('np-cover').src = track.cover || PLACEHOLDER_COVER;
  updateMainHeart();
  renderTracks();
  if (track.type === 'video') {
    pendingVideoSeek = Math.max(0, state.time);
    activeMedia = videoPlayer;
    activeVideoMode = true;
    isRestoringPlayback = true;
    if (state.wasPlaying) openVideoModal(track);
    return;
  }
  const resumeRequestId = ++playbackRequestId;
  activeMedia = audio;
  audio.src = track.localPath;
  audio.volume = getConfiguredVolume();
  audio.playbackRate = playbackSpeed;
  isRestoringPlayback = true;
  const restorePosition = () => {
    if (resumeRequestId !== playbackRequestId || activeIndex !== index) return;
    if (Number.isFinite(audio.duration)) audio.currentTime = Math.min(Math.max(0, state.time), Math.max(0, audio.duration - 0.25));
    isRestoringPlayback = false;
    savePlaybackState(true);
  };
  audio.addEventListener('loadedmetadata', restorePosition, { once: true });
  if (state.wasPlaying) audio.play().then(() => updatePlayUI(true)).catch(() => updatePlayUI(false));
  fetchLyrics(track.artist, track.title);
}

audioDecks.forEach(deck => deck.addEventListener('timeupdate', () => { if (deck === audio) savePlaybackState(); }));
videoPlayer.addEventListener('timeupdate', () => savePlaybackState());
audioDecks.forEach(deck => deck.addEventListener('play', () => { if (deck === audio) savePlaybackState(true); }));
videoPlayer.addEventListener('play', () => savePlaybackState(true));
audioDecks.forEach(deck => deck.addEventListener('pause', () => { if (deck === audio) savePlaybackState(true); }));
videoPlayer.addEventListener('pause', () => savePlaybackState(true));
window.addEventListener('beforeunload', () => savePlaybackState(true));

// =========================================================
// RENDER TRACKS — with Add to Playlist button
// =========================================================

function renderTracks() {
  trackRowsContainer.innerHTML = '';
  const displayTracks = getFilteredAndSorted();
  renderPlaylistDetail(displayTracks);

  if (displayTracks.length === 0) {
    const msg = searchInput.value.trim() ? 'No tracks match your search.' : 'No tracks found in this view.';
    trackRowsContainer.innerHTML = `<div style="text-align:center; padding: 40px; color:var(--text-muted); font-size:13px;">${msg}</div>`;
    return;
  }

  displayTracks.forEach((track) => {
    const realIndex = tracks.findIndex(t => t.id === track.id);
    if (realIndex < 0) return;

    const coverSrc = track.cover || PLACEHOLDER_COVER;

    const row = document.createElement('div');
    row.className = `track-row ${realIndex === activeIndex ? 'active' : ''}`;
    if (missingTrackIds.has(String(track.id))) {
      row.classList.add('missing');
      row.title = 'File is missing. Right-click and choose Locate File to repair this track.';
    } else row.title = 'Double-click to open the full track view.';
    const canReorder = currentView !== 'all' && currentView !== 'fav' && sortSelect.value === 'default' && !searchInput.value.trim();
    row.draggable = true;
    row.addEventListener('dragstart', e => {
      e.dataTransfer.setData('application/x-outfix-track', String(track.id));
      e.dataTransfer.effectAllowed = 'move';
      row.classList.add('dragging-track');
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging-track'));
    if (canReorder) {
      row.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/x-outfix-track')) e.preventDefault(); });
      row.addEventListener('drop', e => {
        const draggedId = e.dataTransfer.getData('application/x-outfix-track');
        if (!draggedId || draggedId === String(track.id)) return;
        e.preventDefault(); e.stopPropagation();
        const playlist = playlists.find(p => p.name === currentView);
        if (!playlist) return;
        const from = playlist.tracks.findIndex(t => String(t.id) === draggedId);
        const to = playlist.tracks.findIndex(t => String(t.id) === String(track.id));
        if (from < 0 || to < 0) return;
        const [moved] = playlist.tracks.splice(from, 1);
        playlist.tracks.splice(to, 0, moved);
        saveLibrary(); renderTracks();
      });
    }
    row.innerHTML = `
      <div style="font-size:12px; color:var(--text-muted);">${realIndex + 1}</div>
      <button type="button" class="heart-btn ${track.isLiked ? 'liked' : ''}" aria-label="${track.isLiked ? 'Remove from' : 'Add to'} favorites: ${escapeHtml(track.title)}" title="${track.isLiked ? 'Remove from' : 'Add to'} favorites"><i class="${track.isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i></button>
      <div class="track-meta" role="button" tabindex="0" aria-label="Play ${escapeHtml(track.title)} by ${escapeHtml(track.artist)}">
        <img src="${escapeHtml(coverSrc)}" alt="">
        <div>
          <div style="font-size:13px; font-weight:700; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(track.title)}</div>
          <div style="font-size:11px; color:var(--text-muted);">${escapeHtml(track.artist)}</div>
        </div>
      </div>
      <div style="font-size:12px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(track.album)}</div>
      <div style="font-size:11px; color:var(--accent); font-weight:700;">${track.ext}</div>
      <button type="button" class="action-btn add-pl-btn" title="Add to Playlist" aria-label="Add ${escapeHtml(track.title)} to playlist"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
      <button type="button" class="action-btn edit-btn" title="Edit Metadata" aria-label="Edit ${escapeHtml(track.title)} metadata"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
      <button type="button" class="action-btn delete-btn" title="Delete" aria-label="Remove ${escapeHtml(track.title)} from library"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
      <div class="playlist-dropdown"></div>
    `;

    // âœ… Heart
    row.querySelector('.track-meta').addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      playTrackFromList(realIndex, displayTracks);
    });
    row.querySelector('.heart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      tracks[realIndex].isLiked = !tracks[realIndex].isLiked;
      saveLibrary(); renderTracks(); updateMainHeart();
    });

    // âœ… Delete
    row.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirm(`Remove from library: "${track.title}"?`, () => removeTrack(realIndex));
    });

    // âœ… Edit
    row.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(realIndex);
    });

    // âœ… ADD TO PLAYLIST — the main fix
    const addPlBtn = row.querySelector('.add-pl-btn');
    const dropdown = row.querySelector('.playlist-dropdown');

    addPlBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      // Hide other dropdowns
      document.querySelectorAll('.playlist-dropdown').forEach(d => d.style.display = 'none');

      if (playlists.length === 0) {
        showToast('Create a playlist first!', 'warning');
        return;
      }

      dropdown.innerHTML = '';

      const header = document.createElement('div');
      header.style.cssText = 'font-size:10px; font-weight:800; color:var(--text-muted); padding:6px 12px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); margin-bottom:4px;';
      header.textContent = 'Add to Playlist';
      dropdown.appendChild(header);

      playlists.forEach(pl => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'dropdown-item';

        const alreadyIn = pl.tracks.find(t => t.id === track.id);
        item.innerHTML = alreadyIn
          ? `<i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> ${escapeHtml(pl.name)}`
          : `<i class="fa-solid fa-plus" style="margin-right:6px; opacity:0.5;"></i> ${escapeHtml(pl.name)}`;

        item.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (alreadyIn) {
            pl.tracks = pl.tracks.filter(t => t.id !== track.id);
            showToast(`Removed from "${pl.name}"`, 'info');
          } else {
            pl.tracks.push(track);
            showToast(`Added to "${pl.name}"`, 'success');
          }
          saveLibrary();
          dropdown.style.display = 'none';
        });

        dropdown.appendChild(item);
      });

      // Position dropdown
      const rect = addPlBtn.getBoundingClientRect();
      dropdown.style.display = 'flex';
      dropdown.style.left = (rect.left - 150) + 'px';
      dropdown.style.top = (rect.bottom + 4) + 'px';

      // Keep on screen
      const dropRect = dropdown.getBoundingClientRect();
      if (dropRect.right > window.innerWidth) {
        dropdown.style.left = (window.innerWidth - dropRect.width - 10) + 'px';
      }
      if (dropRect.bottom > window.innerHeight) {
        dropdown.style.top = (rect.top - dropRect.height - 4) + 'px';
      }
    });

    // âœ… Right-click context menu
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      contextMenuTrackIndex = realIndex;
      if (trackContextMenu) {
        trackContextMenu.style.left = e.clientX + 'px';
        trackContextMenu.style.top = e.clientY + 'px';
        trackContextMenu.style.display = 'flex';
        const rect = trackContextMenu.getBoundingClientRect();
        trackContextMenu.style.left = Math.max(8, Math.min(e.clientX, window.innerWidth - rect.width - 8)) + 'px';
        trackContextMenu.style.top = Math.max(8, Math.min(e.clientY, window.innerHeight - rect.height - 8)) + 'px';
      }
    });

    // âœ… Click to play
    row.addEventListener('click', event => {
      if (event.detail > 1) return;
      if (pendingTrackClickTimer) clearTimeout(pendingTrackClickTimer);
      pendingTrackClickTimer = setTimeout(() => {
        pendingTrackClickTimer = null;
        playTrackFromList(realIndex, displayTracks);
      }, 220);
    });
    row.addEventListener('dblclick', event => {
      if (event.target.closest('.action-btn, .heart-btn')) return;
      if (pendingTrackClickTimer) clearTimeout(pendingTrackClickTimer);
      pendingTrackClickTimer = null;
      openTrackDetail(realIndex, displayTracks);
    });
    trackRowsContainer.appendChild(row);
  });
}

document.addEventListener('click', () => {
  document.querySelectorAll('.playlist-dropdown').forEach(d => d.style.display = 'none');
  if (trackContextMenu) trackContextMenu.style.display = 'none';
});

function removeTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  const removed = tracks[index];
  playlists.forEach(pl => { pl.tracks = pl.tracks.filter(t => t.id !== removed.id); });

  if (index === activeIndex) {
    audio.pause(); audio.src = '';
    videoPlayer.pause(); videoPlayer.src = ''; videoModal.style.display = 'none';
    activeVideoMode = false; activeMedia = audio; activeIndex = -1; updatePlayUI(false);
    document.getElementById('np-title').textContent = 'No track';
    document.getElementById('np-artist').textContent = '—';
    document.getElementById('np-cover').src = PLACEHOLDER_COVER;
  } else if (index < activeIndex) activeIndex--;

  tracks.splice(index, 1);
  saveLibrary(); renderTracks();
  showToast('Track removed', 'info');
}

async function relinkTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  const replacementPath = await window.api.pickReplacementFile();
  if (!replacementPath) return;
  const track = tracks[index];
  const ext = (replacementPath.split('.').pop() || '').toLowerCase();
  const videoExts = ['mp4', 'webm', 'mkv', 'mov', 'avi'];
  track.path = replacementPath;
  track.localPath = 'outfix://' + encodeURIComponent(replacementPath);
  track.ext = ext.toUpperCase();
  track.type = videoExts.includes(ext) ? 'video' : 'audio';
  missingTrackIds.delete(String(track.id));
  if (!(await saveLibrary())) return;
  renderTracks();
  if (activeIndex === index) playTrack(index);
  showToast('File location repaired.', 'success');
}

// =========================================================
// TRACK CONTEXT MENU
// =========================================================

if (trackContextMenu) {
  trackContextMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      if (contextMenuTrackIndex < 0) return;
      const track = tracks[contextMenuTrackIndex];
      if (!track) return;
      if (action === 'play') playTrack(contextMenuTrackIndex);
      else if (action === 'locate') relinkTrack(contextMenuTrackIndex);
      else if (action === 'like') {
        tracks[contextMenuTrackIndex].isLiked = !tracks[contextMenuTrackIndex].isLiked;
        saveLibrary(); renderTracks(); updateMainHeart();
      } else if (action === 'add') {
        showAddToPlaylistMenu(track);
      } else if (action === 'edit') {
        openEditModal(contextMenuTrackIndex);
      } else if (action === 'delete') {
        showConfirm(`Remove from library: "${track.title}"?`, () => removeTrack(contextMenuTrackIndex));
      }
      trackContextMenu.style.display = 'none';
    });
  });
}

// Helper: show Add to Playlist menu (used by context menu)
function showAddToPlaylistMenu(track) {
  if (playlists.length === 0) {
    showToast('Create a playlist first!', 'warning');
    return;
  }
  // Just add to first playlist as quick action, or show a mini menu
  const menu = document.createElement('div');
  menu.className = 'playlist-dropdown';
  menu.style.display = 'flex';
  menu.style.left = (window.innerWidth / 2 - 80) + 'px';
  menu.style.top = '200px';

  const header = document.createElement('div');
  header.style.cssText = 'font-size:10px; font-weight:800; color:var(--text-muted); padding:6px 12px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); margin-bottom:4px;';
  header.textContent = 'Add to Playlist';
  menu.appendChild(header);

  playlists.forEach(pl => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'dropdown-item';
    const alreadyIn = pl.tracks.find(t => t.id === track.id);
    item.innerHTML = alreadyIn
      ? `<i class="fa-solid fa-check" style="color:#10b981; margin-right:6px;"></i> ${escapeHtml(pl.name)}`
      : `<i class="fa-solid fa-plus" style="margin-right:6px; opacity:0.5;"></i> ${escapeHtml(pl.name)}`;
    item.addEventListener('click', () => {
      if (alreadyIn) {
        pl.tracks = pl.tracks.filter(t => t.id !== track.id);
        showToast(`Removed from "${pl.name}"`, 'info');
      } else {
        pl.tracks.push(track);
        showToast(`Added to "${pl.name}"`, 'success');
      }
      saveLibrary();
      menu.remove();
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  setTimeout(() => { document.addEventListener('click', () => menu.remove(), { once: true }); }, 0);
}

// =========================================================
// EDIT METADATA
// =========================================================

function openEditModal(index) {
  if (index < 0 || index >= tracks.length) return;
  editingTrackIndex = index;
  const t = tracks[index];
  editTitle.value = t.title || '';
  editArtist.value = t.artist || '';
  editAlbum.value = t.album || '';
  editCoverPreview.src = t.cover || PLACEHOLDER_COVER;
  editModal.style.display = 'flex';
  editTitle.focus();
}

function closeEditModalFn() {
  editModal.style.display = 'none';
  editingTrackIndex = -1;
}

if (closeEditModal) closeEditModal.addEventListener('click', closeEditModalFn);
if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModalFn);

if (saveEditBtn) {
  saveEditBtn.addEventListener('click', async () => {
    if (editingTrackIndex < 0) return;
    const t = tracks[editingTrackIndex];
    const newTitle = editTitle.value.trim();
    const newArtist = editArtist.value.trim();
    const newAlbum = editAlbum.value.trim();

    if (!newTitle) { showToast('Title cannot be empty!', 'warning'); return; }

    t.title = newTitle;
    t.artist = newArtist || 'Unknown';
    t.album = newAlbum || 'Unknown';

    if (t.path && window.api.editTrackMetadata) {
      showToast('Saving metadata...', 'info', 1500);
      try {
        const res = await window.api.editTrackMetadata({
          path: t.path,
          title: newTitle,
          artist: t.artist,
          album: t.album,
        });
        if (!res.success) {
          showToast('Could not update file metadata: ' + res.error, 'warning');
        } else {
          showToast('Metadata saved', 'success');
        }
      } catch (e) {
        showToast('Error: ' + e.message, 'error');
      }
    }

    await saveLibrary();
    renderTracks();
    updateFeaturedCard(t);
    if (editingTrackIndex === activeIndex) {
      document.getElementById('np-title').textContent = t.title;
      document.getElementById('np-artist').textContent = t.artist;
      document.getElementById('np-cover').src = t.cover || PLACEHOLDER_COVER;
    }
    closeEditModalFn();
  });
}

// =========================================================
// PLAY TRACK + CROSSFADE
// =========================================================

async function playTrack(i) {
  if (i < 0 || i >= tracks.length) return;
  isRestoringPlayback = false;
  pendingVideoSeek = 0;
  const requestId = ++playbackRequestId;
  crossfadeToken++;
  if (pendingIncomingAudio) {
    pendingIncomingAudio.pause();
    pendingIncomingAudio.src = '';
    pendingIncomingAudio.load();
    pendingIncomingAudio = null;
  }
  if (crossfadeOutgoing && crossfadeOutgoing !== audio) {
    crossfadeOutgoing.pause();
    crossfadeOutgoing.src = '';
    crossfadeOutgoing.load();
  }
  crossfadeOutgoing = null;
  const track = tracks[i];

  if (crossfadeDuration > 0 && !audio.paused && activeIndex !== i && !activeVideoMode && track.type !== 'video') {
    const outgoing = audio;
    const incoming = standbyAudio;
    const remaining = Number.isFinite(outgoing.duration) ? Math.max(0, outgoing.duration - outgoing.currentTime) : crossfadeDuration;
    const fadeSeconds = Math.min(crossfadeDuration, remaining);
    incoming.pause();
    incoming.src = track.localPath;
    incoming.playbackRate = playbackSpeed;
    incoming.volume = 0;
    incoming.muted = outgoing.muted;
    incoming.load();
    pendingIncomingAudio = incoming;
    try {
      await incoming.play();
      if (requestId !== playbackRequestId || pendingIncomingAudio !== incoming) { incoming.pause(); incoming.src = ''; return; }
      pendingIncomingAudio = null;
      audio = incoming;
      standbyAudio = outgoing;
      activeMedia = audio;
      activeIndex = i;
      autoCrossfadeStartedFor = null;
      updateFeaturedCard(track);
      if (trackDetailPage.classList.contains('open')) updateTrackDetail(track);
      document.getElementById('np-cover').src = track.cover || PLACEHOLDER_COVER;
      document.getElementById('np-title').textContent = track.title;
      document.getElementById('np-artist').textContent = track.artist;
      updateMainHeart(); renderTracks();
      updatePlayUI(true);
      fetchLyrics(track.artist, track.title);
      await crossfadeDecks(outgoing, incoming, fadeSeconds * 1000, requestId);
    } catch (error) {
      if (pendingIncomingAudio === incoming) pendingIncomingAudio = null;
      if (requestId === playbackRequestId) {
        incoming.pause();
        incoming.src = '';
        outgoing.volume = getConfiguredVolume();
        autoCrossfadeStartedFor = null;
        updatePlayUI(!outgoing.paused);
        showToast('Could not play this track. Check that the file is available.', 'error');
      }
    }
    return;
  }

  if (crossfadeDuration > 0 && !audio.paused && activeIndex !== i && !activeVideoMode) {
    // Keep a long configured fade from delaying the next track past the current track's end.
    const remaining = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - audio.currentTime) : crossfadeDuration;
    const fadeSeconds = Math.min(crossfadeDuration, remaining * 0.45);
    await fadeOut(audio, fadeSeconds * 1000);
  }
  if (requestId !== playbackRequestId) return;

  if (activeVideoMode) {
    videoPlayer.pause(); videoPlayer.src = ''; videoModal.style.display = 'none';
    activeVideoMode = false;
  }
  activeIndex = i;
  autoCrossfadeStartedFor = null;
  updateFeaturedCard(track);
  if (trackDetailPage.classList.contains('open')) updateTrackDetail(track);

  if (track.type === 'video') {
    lyricsRequestId++;
    parsedLyrics = [];
    lyricsScrollContainer.textContent = 'Lyrics are available for audio tracks.';
    document.getElementById('np-cover').src = track.cover || PLACEHOLDER_COVER;
    document.getElementById('np-title').textContent = track.title;
    document.getElementById('np-artist').textContent = track.artist;
    updateMainHeart(); renderTracks(); openVideoModal(track);
    return;
  }

  activeMedia = audio;
  activeVideoMode = false;

  audio.src = track.localPath;
  audio.playbackRate = playbackSpeed;
    videoPlayer.playbackRate = playbackSpeed;
  audio.volume = 0;
  audio.load();
  try {
    await audio.play();
    if (requestId !== playbackRequestId) return;
    updatePlayUI(true);
    await fadeIn(audio, crossfadeDuration * 1000);
  } catch (e) {
    if (requestId === playbackRequestId) {
      audio.volume = getConfiguredVolume();
      updatePlayUI(false);
      showToast('Could not play this track. Check that the file is available.', 'error');
    }
  }
  if (requestId !== playbackRequestId) return;

  document.getElementById('np-cover').src = track.cover || PLACEHOLDER_COVER;
  document.getElementById('np-title').textContent = track.title;
  document.getElementById('np-artist').textContent = track.artist;

  updateMainHeart(); renderTracks();
  fetchLyrics(track.artist, track.title);
}

function crossfadeDecks(outgoing, incoming, durationMs, requestId) {
  const token = ++crossfadeToken;
  crossfadeOutgoing = outgoing;
  return new Promise(resolve => {
    const target = getConfiguredVolume();
    const startVolume = outgoing.volume;
    const start = performance.now();
    const finish = () => {
      if (requestId !== playbackRequestId || token !== crossfadeToken) return resolve();
      incoming.volume = target;
      outgoing.pause();
      outgoing.src = '';
      outgoing.load();
      if (crossfadeOutgoing === outgoing) crossfadeOutgoing = null;
      resolve();
    };
    if (document.hidden || durationMs <= 0) {
      outgoing.volume = 0;
      return finish();
    }
    const step = () => {
      if (requestId !== playbackRequestId || token !== crossfadeToken) return resolve();
      const progress = Math.min(1, (performance.now() - start) / durationMs);
      outgoing.volume = startVolume * (1 - progress);
      incoming.volume = target * progress;
      if (progress < 1) requestAnimationFrame(step);
      else finish();
    };
    step();
  });
}

function fadeIn(el, durationMs) {
  const token = (fadeTokens.get(el) || 0) + 1;
  fadeTokens.set(el, token);
  return new Promise((resolve) => {
    // Chromium pauses requestAnimationFrame while a window is minimized/hidden.
    // A hidden fade would leave the next track playing silently until restore.
    if (document.hidden || !durationMs || durationMs <= 0) {
      el.volume = getConfiguredVolume();
      return resolve();
    }
    const targetVol = getConfiguredVolume();
    const start = performance.now();
    const step = () => {
      if (fadeTokens.get(el) !== token) return resolve();
      const t = Math.min(1, (performance.now() - start) / durationMs);
      el.volume = targetVol * t;
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    step();
  });
}

function fadeOut(el, durationMs) {
  const token = (fadeTokens.get(el) || 0) + 1;
  fadeTokens.set(el, token);
  return new Promise((resolve) => {
    if (document.hidden) {
      el.volume = 0;
      el.pause();
      return resolve();
    }
    if (!durationMs || durationMs <= 0) return resolve();
    const startVol = el.volume;
    const start = performance.now();
    const step = () => {
      if (fadeTokens.get(el) !== token) return resolve();
      const t = Math.min(1, (performance.now() - start) / durationMs);
      el.volume = startVol * (1 - t);
      if (t < 1) requestAnimationFrame(step);
      else { el.pause(); resolve(); }
    };
    step();
  });
}
function getConfiguredVolume() {
  const cfg = loadUICfg();
  return cfg.volume !== undefined ? cfg.volume : 0.8;
}

function openVideoModal(track) {
  if (subtitleTrackForId && subtitleTrackForId !== track.id) {
    videoPlayer.querySelectorAll('track').forEach(item => item.remove());
    if (subtitleObjectUrl) URL.revokeObjectURL(subtitleObjectUrl);
    subtitleObjectUrl = null;
  }
  subtitleTrackForId = track.id;
  activeMedia = videoPlayer;
  activeVideoMode = true;
  const seekTo = pendingVideoSeek;
  pendingVideoSeek = 0;
  videoPlayer.onloadedmetadata = () => {
    if (seekTo > 0 && Number.isFinite(videoPlayer.duration)) videoPlayer.currentTime = Math.min(seekTo, Math.max(0, videoPlayer.duration - 0.25));
    if (durTime) durTime.textContent = formatTime(videoPlayer.duration);
    if (isRestoringPlayback) { isRestoringPlayback = false; savePlaybackState(true); }
  };

  videoPlayer.src = track.localPath;
  videoPlayer.volume = getConfiguredVolume();
  videoPlayer.playbackRate = playbackSpeed;
  videoModal.style.display = 'flex';
  videoPlayer.play().catch(() => showToast('Could not play this video file.', 'error'));

}

closeVideoBtn.addEventListener('click', () => {
  videoPlayer.pause(); videoPlayer.src = '';
  videoModal.style.display = 'none';
  activeMedia = audio;
  activeVideoMode = false;
  updatePlayUI(false);
});

if (subtitleBtn && subtitleFileInput) {
  subtitleBtn.addEventListener('click', () => subtitleFileInput.click());
  subtitleFileInput.addEventListener('change', async () => {
    const file = subtitleFileInput.files && subtitleFileInput.files[0];
    subtitleFileInput.value = '';
    if (!file) return;
    try {
      let text = await file.text();
      text = text.replace(/^\uFEFF/, '');
      if (/\.srt$/i.test(file.name)) {
        text = 'WEBVTT\n\n' + text.replace(/\r/g, '').replace(/(\d{1,2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
      }
      if (!/^WEBVTT(?:\s|$)/.test(text.trimStart())) text = 'WEBVTT\n\n' + text;
      if (subtitleObjectUrl) URL.revokeObjectURL(subtitleObjectUrl);
      subtitleObjectUrl = URL.createObjectURL(new Blob([text], { type: 'text/vtt' }));
      videoPlayer.querySelectorAll('track').forEach(track => track.remove());
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = file.name;
      track.srclang = 'en';
      track.src = subtitleObjectUrl;
      track.default = true;
      videoPlayer.appendChild(track);
      track.track.mode = 'showing';
      subtitleTrackForId = tracks[activeIndex] && tracks[activeIndex].id;
      showToast(`Subtitles loaded: ${file.name}`, 'success');
    } catch (err) {
      showToast('Could not load this subtitle file.', 'error');
    }
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await videoPlayer.requestFullscreen();
    } catch (e) { showToast('Fullscreen is not available.', 'warning'); }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.innerHTML = document.fullscreenElement
      ? '<i class="fa-solid fa-compress"></i> Exit Fullscreen'
      : '<i class="fa-solid fa-expand"></i> Fullscreen';
  });
}



videoPlayer.addEventListener('play', () => updatePlayUI(true));
videoPlayer.addEventListener('pause', () => updatePlayUI(false));

function updatePlayUI(isPlaying) {
  if (trackDetailPage) trackDetailPage.classList.toggle('is-playing', Boolean(isPlaying));
  if (isPlaying) {
    playBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
    playBtn.setAttribute('aria-label', 'Pause');
    playBtn.title = 'Pause';
    heroPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
  } else {
    playBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
    playBtn.setAttribute('aria-label', 'Play');
    playBtn.title = 'Play';
    heroPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play Song';
  }
}

function togglePlayPause() {
  if (tracks.length === 0) return;
  if (activeIndex === -1) {
    const order = getPlaybackOrder();
    if (order.length) playTrack(order[0]);
    return;
  }
  const track = tracks[activeIndex];
  if (track.type === 'video') {
    if (videoModal.style.display === 'flex') {
      if (videoPlayer.paused) { videoPlayer.play(); updatePlayUI(true); }
      else { videoPlayer.pause(); updatePlayUI(false); }
    } else openVideoModal(track);
    return;
  }
  if (audio.paused) {
    audio.play().then(() => updatePlayUI(true)).catch(() => {
      updatePlayUI(false);
      showToast('Could not play this track. Check that the file is available.', 'error');
    });
  }
  else {
    if (pendingIncomingAudio) {
      playbackRequestId++;
      crossfadeToken++;
      pendingIncomingAudio.pause();
      pendingIncomingAudio.src = '';
      pendingIncomingAudio.load();
      pendingIncomingAudio = null;
    }
    if (crossfadeOutgoing) {
      crossfadeToken++;
      crossfadeOutgoing.pause();
      crossfadeOutgoing.src = '';
      crossfadeOutgoing.load();
      crossfadeOutgoing = null;
      audio.volume = getConfiguredVolume();
    }
    audio.pause(); updatePlayUI(false);
  }
}

playBtn.addEventListener('click', togglePlayPause);
heroPlayBtn.addEventListener('click', togglePlayPause);

function handleNextTrack() {
  const order = getPlaybackOrder();
  if (order.length === 0) return;
  const position = order.indexOf(activeIndex);
  if (isShuffle && order.length > 1) {
    let r;
    do { r = order[Math.floor(Math.random() * order.length)]; } while (r === activeIndex);
    playTrack(r);
  } else {
    playTrack(order[(position + 1 + order.length) % order.length]);
  }
}

function handlePrevTrack() {
  const order = getPlaybackOrder();
  if (order.length === 0) return;
  const media = activeVideoMode ? videoPlayer : audio;
  if (media.currentTime > 3) media.currentTime = 0;
  else {
    const position = order.indexOf(activeIndex);
    playTrack(order[position < 0 ? order.length - 1 : (position - 1 + order.length) % order.length]);
  }
}

nextBtn.addEventListener('click', handleNextTrack);
prevBtn.addEventListener('click', handlePrevTrack);

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active-toggle', isShuffle);
  shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
  const cfg = loadUICfg(); cfg.shuffle = isShuffle; saveUICfg(cfg);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active-toggle', isRepeat);
  repeatBtn.setAttribute('aria-pressed', String(isRepeat));
  const cfg = loadUICfg(); cfg.repeat = isRepeat; saveUICfg(cfg);
});

audioDecks.forEach(deck => deck.addEventListener('error', () => {
  if (deck !== audio) return;
  isRestoringPlayback = false;
  if (!deck.src) return;
  updatePlayUI(false);
  showToast('This audio file could not be played. It may be missing or use an unsupported format.', 'error');
}));

videoPlayer.addEventListener('error', () => {
  isRestoringPlayback = false;
  if (!videoPlayer.src) return;
  updatePlayUI(false);
  showToast('This video could not be played. It may be missing or use an unsupported format.', 'error');
});

audioDecks.forEach(deck => deck.addEventListener('ended', () => {
  if (deck !== audio) return;
  if (autoCrossfadeStartedFor === String(tracks[activeIndex]?.id)) return;
  if (isRepeat) { deck.currentTime = 0; deck.play().catch(() => showToast('Could not restart this track.', 'error')); }
  else handleNextTrack();
}));

videoPlayer.addEventListener('ended', () => {
  if (isRepeat) { videoPlayer.currentTime = 0; videoPlayer.play().catch(() => showToast('Could not restart this video.', 'error')); }
  else handleNextTrack();
});

window.api.onMediaCommand(command => {
  if (command === 'toggle') togglePlayPause();
  else if (command === 'next') handleNextTrack();
  else if (command === 'previous') handlePrevTrack();
});

// =========================================================
// KEYBOARD SHORTCUTS
// =========================================================

document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (e.code === 'Escape') e.target.blur();
    return;
  }
  if (e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
  else if (e.code === 'ArrowRight') { e.preventDefault(); handleNextTrack(); }
  else if (e.code === 'ArrowLeft') { e.preventDefault(); handlePrevTrack(); }
  else if (e.code === 'ArrowUp' && e.ctrlKey) {
    e.preventDefault();
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    if (idx < speeds.length - 1) {
      playbackSpeed = speeds[idx + 1];
      audio.playbackRate = playbackSpeed;
    videoPlayer.playbackRate = playbackSpeed;
      if (speedBtn) speedBtn.textContent = `${playbackSpeed}x`;
      if (speedSelect) speedSelect.value = playbackSpeed;
      const cfg = loadUICfg(); cfg.speed = playbackSpeed; saveUICfg(cfg);
      showToast(`Speed: ${playbackSpeed}x`, 'info', 1000);
    }
  }
  else if (e.code === 'ArrowDown' && e.ctrlKey) {
    e.preventDefault();
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    if (idx > 0) {
      playbackSpeed = speeds[idx - 1];
      audio.playbackRate = playbackSpeed;
    videoPlayer.playbackRate = playbackSpeed;
      if (speedBtn) speedBtn.textContent = `${playbackSpeed}x`;
      if (speedSelect) speedSelect.value = playbackSpeed;
      const cfg = loadUICfg(); cfg.speed = playbackSpeed; saveUICfg(cfg);
      showToast(`Speed: ${playbackSpeed}x`, 'info', 1000);
    }
  }
  else if (e.code === 'ArrowUp') {
    e.preventDefault();
    const v = Math.min(1, activeMedia.volume + 0.05);
    audio.volume = v; videoPlayer.volume = v;
    volumeFill.style.width = `${v * 100}%`; volumeBg.setAttribute('aria-valuenow', String(Math.round(v * 100))); updateVolumeIcon(v);
    const cfg = loadUICfg(); cfg.volume = v; saveUICfg(cfg);
  }
  else if (e.code === 'ArrowDown') {
    e.preventDefault();
    const v = Math.max(0, activeMedia.volume - 0.05);
    audio.volume = v; videoPlayer.volume = v;
    volumeFill.style.width = `${v * 100}%`; volumeBg.setAttribute('aria-valuenow', String(Math.round(v * 100))); updateVolumeIcon(v);
    const cfg = loadUICfg(); cfg.volume = v; saveUICfg(cfg);
  }
  else if (e.code === 'KeyF' && e.ctrlKey) { e.preventDefault(); switchTab('library'); searchInput.focus(); }
  else if (e.code === 'KeyL' && e.ctrlKey) { e.preventDefault(); lyricsBtn.click(); }
  else if (e.code === 'KeyN' && e.ctrlKey) { e.preventDefault(); btnCreatePlaylist.click(); }
  else if (e.code === 'KeyM' && e.ctrlKey) { e.preventDefault(); audio.muted = !audio.muted; standbyAudio.muted = audio.muted; videoPlayer.muted = audio.muted; }
  else if (e.code === 'KeyS' && e.ctrlKey) { e.preventDefault(); switchTab('settings'); }
  else if (e.code === 'KeyQ' && e.ctrlKey) { e.preventDefault(); setQueueOpen(!queuePanel.classList.contains('open')); }
  else if (e.code === 'Escape') {
    if (videoModal.style.display === 'flex') closeVideoBtn.click();
    else if (trackDetailPage && trackDetailPage.classList.contains('open')) closeTrackDetail();
    else if (playlistModal.style.display === 'flex') closePlaylistModal.click();
    else if (editModal.style.display === 'flex') closeEditModalFn();
    else if (lyricsSidebar.style.display === 'flex') closeLyricsPanel.click();
    else if (queuePanel.classList.contains('open')) setQueueOpen(false);
    else if (confirmModal && confirmModal.style.display === 'flex') confirmModal.querySelector('#confirm-cancel').click();
  }
});

// =========================================================
// LYRICS
// =========================================================

lyricsBtn.addEventListener('click', () => {
  const isVisible = lyricsSidebar.style.display === 'flex';
  lyricsSidebar.style.display = isVisible ? 'none' : 'flex';
  lyricsBtn.classList.toggle('active-toggle', !isVisible);
  lyricsBtn.setAttribute('aria-pressed', String(!isVisible));
});

closeLyricsPanel.addEventListener('click', () => {
  lyricsSidebar.style.display = 'none';
  lyricsBtn.classList.remove('active-toggle');
  lyricsBtn.setAttribute('aria-pressed', 'false');
});

async function fetchLyrics(artist, title) {
  const requestId = ++lyricsRequestId;
  lyricsScrollContainer.innerHTML = '<div style="color:var(--text-muted); font-size:13px; text-align:center; margin-top:40px;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching...</div>';
  parsedLyrics = [];
  try {
    const res = await window.api.fetchLyrics(artist, title);
    if (requestId !== lyricsRequestId) return;
    const data = res.data;
    if (res.success && data && data.syncedLyrics) {
      parseLRC(data.syncedLyrics);
      renderSyncedLyrics();
    } else if (res.success && data && data.plainLyrics) {
      lyricsScrollContainer.innerHTML = `<div style="font-size:14px; line-height:1.8; color:var(--text-muted); white-space:pre-wrap;">${escapeHtml(data.plainLyrics)}</div>`;
    } else {
      lyricsScrollContainer.innerHTML = '<div style="color:var(--text-muted); font-size:13px; text-align:center; margin-top:40px;">No lyrics found for this track.</div>';
    }
  } catch (err) {
    if (requestId === lyricsRequestId) {
      lyricsScrollContainer.innerHTML = '<div style="color:var(--text-muted); font-size:13px; text-align:center; margin-top:40px;">Unable to load lyrics.</div>';
    }
  }
}
function parseLRC(lrcText) {
  parsedLyrics = [];
  const timestampPattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
  for (const line of String(lrcText || '').split(/\r?\n/)) {
    const stamps = [...line.matchAll(timestampPattern)];
    if (!stamps.length) continue;
    const text = line.slice(stamps[stamps.length - 1].index + stamps[stamps.length - 1][0].length).trim();
    if (!text) continue;
    for (const stamp of stamps) {
      const fraction = stamp[3] ? (stamp[3].length === 3 ? Number(stamp[3]) / 1000 : Number(stamp[3]) / 100) : 0;
      parsedLyrics.push({ time: Number(stamp[1]) * 60 + Number(stamp[2]) + fraction, text });
    }
  }
  parsedLyrics.sort((a, b) => a.time - b.time);
}

function renderSyncedLyrics() {
  lyricsScrollContainer.innerHTML = '';
  activeLyricIndex = -1;
  parsedLyrics.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'lyric-line';
    div.id = `lyric-line-${index}`;
    div.textContent = item.text;
    div.addEventListener('click', () => { audio.currentTime = item.time; });
    lyricsScrollContainer.appendChild(div);
  });
}

audioDecks.forEach(deck => deck.addEventListener('timeupdate', () => {
  if (deck !== audio) return;
  if (parsedLyrics.length === 0) return;
  const curTime = deck.currentTime;
  let activeIdx = -1;
  for (let i = 0; i < parsedLyrics.length; i++) {
    if (curTime >= parsedLyrics[i].time) activeIdx = i;
    else break;
  }
  if (activeIdx === activeLyricIndex) return;
  const previousLine = document.getElementById(`lyric-line-${activeLyricIndex}`);
  if (previousLine) previousLine.classList.remove('active');
  activeLyricIndex = activeIdx;
  const currentLine = document.getElementById(`lyric-line-${activeIdx}`);
  if (currentLine) {
    currentLine.classList.add('active');
    currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}));

// =========================================================
// HEART
// =========================================================

function updateMainHeart() {
  if (activeIndex >= 0 && activeIndex < tracks.length) {
    const isLiked = tracks[activeIndex].isLiked;
    mainHeartBtn.className = `heart-btn ${isLiked ? 'liked' : ''}`;
    mainHeartBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>`;
    const label = isLiked ? `Remove ${tracks[activeIndex].title} from favorites` : `Add ${tracks[activeIndex].title} to favorites`;
    mainHeartBtn.setAttribute('aria-label', label);
    mainHeartBtn.title = label;
    mainHeartBtn.setAttribute('aria-pressed', String(isLiked));
  }
}

mainHeartBtn.addEventListener('click', () => {
  if (activeIndex >= 0 && activeIndex < tracks.length) {
    tracks[activeIndex].isLiked = !tracks[activeIndex].isLiked;
    saveLibrary(); updateMainHeart(); renderTracks();
  }
});

// =========================================================
// PLAYLISTS
// =========================================================

btnCreatePlaylist.addEventListener('click', () => {
  editingPlaylistIndex = -1;
  playlistModalTitle.textContent = 'Create New Playlist';
  savePlaylistBtn.textContent = 'Create Playlist';
  playlistModal.style.display = 'flex';
  playlistNameInput.value = '';
  playlistNameInput.focus();
});

closePlaylistModal.addEventListener('click', () => playlistModal.style.display = 'none');

if (importSpotifyBtn && spotifyImportModal) {
  importSpotifyBtn.addEventListener('click', () => {
    spotifyPlaylistName.value = '';
    spotifyPlaylistUrl.value = '';
    spotifyImportModal.style.display = 'flex';
    spotifyPlaylistUrl.focus();
  });
  $('close-spotify-import').addEventListener('click', () => { spotifyImportModal.style.display = 'none'; });
  $('save-spotify-playlist').addEventListener('click', async () => {
    const rawUrl = spotifyPlaylistUrl.value.trim();
    let playlistId = '';
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') throw new Error('Use a Spotify playlist link from open.spotify.com.');
      const match = url.pathname.match(/^\/(?:embed\/)?playlist\/([A-Za-z0-9]{22})\/?$/);
      if (!match) throw new Error('That link does not look like a Spotify playlist.');
      playlistId = match[1];
    } catch (error) {
      showToast(error instanceof TypeError ? 'Paste a valid Spotify playlist link.' : error.message, 'warning');
      spotifyPlaylistUrl.focus();
      return;
    }
    const existing = playlists.find(pl => pl.spotifyId === playlistId);
    if (existing) {
      currentView = existing.name;
      switchTab('library');
      resetNavActive();
      renderPlaylists();
      renderTracks();
      spotifyImportModal.style.display = 'none';
      showToast('This Spotify playlist is already in your library.', 'info');
      return;
    }
    const name = spotifyPlaylistName.value.trim() || `Spotify Playlist ${playlistId.slice(0, 5)}`;
    if (playlists.some(pl => pl.name.toLowerCase() === name.toLowerCase())) {
      showToast('A playlist with that name already exists. Choose another name.', 'warning');
      spotifyPlaylistName.focus();
      return;
    }
    playlists.push({ name, tracks: [], spotifyId: playlistId, spotifyUrl: `https://open.spotify.com/playlist/${playlistId}` });
    if (!(await saveLibrary())) return;
    currentView = name;
    switchTab('library');
    renderPlaylists();
    renderTracks();
    spotifyImportModal.style.display = 'none';
    showToast('Spotify playlist added. Sign in to Spotify in its player if needed.', 'success', 5000);
  });
  spotifyPlaylistUrl.addEventListener('keydown', event => { if (event.key === 'Enter') $('save-spotify-playlist').click(); });
}

savePlaylistBtn.addEventListener('click', () => {
  const name = playlistNameInput.value.trim();
  if (!name) return;
  if (playlists.some((playlist, index) => index !== editingPlaylistIndex && playlist.name.toLowerCase() === name.toLowerCase())) {
    showToast('A playlist with that name already exists.', 'warning');
    return;
  }
  if (editingPlaylistIndex >= 0) {
    playlists[editingPlaylistIndex].name = name;
    if (currentView !== 'all' && currentView !== 'fav') currentView = name;
  } else {
    playlists.push({ name, tracks: [] });
  }
  saveLibrary(); renderPlaylists(); renderTracks();
  playlistModal.style.display = 'none';
});

function renderPlaylists() {
  playlistListContainer.innerHTML = '';
  playlists.forEach((p, idx) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `nav-item ${p.name === currentView ? 'active' : ''}`;
    item.dataset.playlistName = p.name;
    item.innerHTML = `${p.spotifyId ? '<i class="fa-brands fa-spotify" style="color:#1ed760;"></i>' : '<i class="fa-solid fa-list-ul"></i>'} ${escapeHtml(p.name)}`;
    item.addEventListener('click', () => {
      currentView = p.name;
      switchTab('library');
      resetNavActive();
      item.classList.add('active');
      renderTracks();
    });
    item.addEventListener('dragover', e => {
      if (e.dataTransfer.types.includes('application/x-outfix-track')) { e.preventDefault(); item.classList.add('drop-target'); }
    });
    item.addEventListener('dragleave', () => item.classList.remove('drop-target'));
    item.addEventListener('drop', e => {
      const trackId = e.dataTransfer.getData('application/x-outfix-track');
      if (!trackId) return;
      e.preventDefault(); e.stopPropagation(); item.classList.remove('drop-target');
      const track = tracks.find(t => String(t.id) === trackId);
      if (!track) return;
      if (!p.tracks.some(t => String(t.id) === trackId)) {
        p.tracks.push(track);
        saveLibrary(); renderTracks(); renderPlaylists();
        showToast(`Added to "${p.name}"`, 'success');
      } else showToast(`Already in "${p.name}"`, 'info');
    });
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const menu = document.createElement('div');
      menu.className = 'playlist-dropdown';
      menu.style.display = 'flex';
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';

      const rename = document.createElement('button');
      rename.type = 'button';
      rename.className = 'dropdown-item';
      rename.textContent = 'Rename';
      rename.addEventListener('click', () => {
        editingPlaylistIndex = idx;
        playlistModalTitle.textContent = 'Rename Playlist';
        savePlaylistBtn.textContent = 'Rename';
        playlistNameInput.value = p.name;
        playlistModal.style.display = 'flex';
        playlistNameInput.focus();
        menu.remove();
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'dropdown-item';
      del.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i> Delete';
      del.style.color = 'var(--danger)';
      del.addEventListener('click', () => {
        showConfirm(`Delete playlist "${p.name}"?`, () => {
          playlists.splice(idx, 1);
          if (currentView === p.name) { currentView = 'all'; resetNavActive(); navAll.classList.add('active'); }
          saveLibrary(); renderPlaylists(); renderTracks();
        });
        menu.remove();
      });

      menu.appendChild(rename);
      menu.appendChild(del);
      document.body.appendChild(menu);
      const menuRect = menu.getBoundingClientRect();
      menu.style.left = Math.max(8, Math.min(e.clientX, window.innerWidth - menuRect.width - 8)) + 'px';
      menu.style.top = Math.max(8, Math.min(e.clientY, window.innerHeight - menuRect.height - 8)) + 'px';
      setTimeout(() => { document.addEventListener('click', () => menu.remove(), { once: true }); }, 0);
    });
    playlistListContainer.appendChild(item);
  });
}

// =========================================================
// SLIDERS
// =========================================================

function setupDraggableSlider(sliderEl, onDrag) {
  sliderEl.addEventListener('keydown', event => {
    const media = activeMedia;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const isVolume = sliderEl === volumeBg;
    const duration = Number.isFinite(media.duration) ? media.duration : 0;
    const current = isVolume ? media.volume : (duration ? media.currentTime / duration : 0);
    const step = isVolume ? 0.05 : (duration ? Math.min(0.1, 5 / duration) : 0);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
      : Math.max(0, Math.min(1, current + (['ArrowRight', 'ArrowUp'].includes(event.key) ? step : -step)));
    onDrag(next);
    sliderEl.setAttribute('aria-valuenow', String(Math.round(next * 100)));
  });
  const handleDrag = (e) => {
    const rect = sliderEl.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onDrag(pos);
    sliderEl.setAttribute('aria-valuenow', String(Math.round(pos * 100)));
  };
  sliderEl.addEventListener('pointerdown', (e) => {
    sliderEl.classList.add('dragging');
    handleDrag(e);
    const onMove = (e) => handleDrag(e);
    const onUp = () => {
      sliderEl.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });
}

setupDraggableSlider(sliderBg, (pos) => {
  if (activeVideoMode && videoPlayer.duration) {
    videoPlayer.currentTime = pos * videoPlayer.duration;
    sliderFill.style.width = `${pos * 100}%`;
  } else if (audio.duration) {
    audio.currentTime = pos * audio.duration;
    sliderFill.style.width = `${pos * 100}%`;
  }
});

audioDecks.forEach(deck => deck.addEventListener('timeupdate', () => {
  if (deck !== audio) return;
  if (activeVideoMode) return;
  if (deck.duration && !sliderBg.classList.contains('dragging')) {
    const pct = (deck.currentTime / deck.duration) * 100;
    sliderFill.style.width = `${pct}%`;
    sliderBg.setAttribute('aria-valuenow', String(Math.round(pct)));
    currTime.textContent = formatTime(deck.currentTime);
    durTime.textContent = formatTime(deck.duration);
  }
  if (crossfadeDuration > 0 && !isRepeat && !deck.paused && Number.isFinite(deck.duration) && activeIndex >= 0) {
    const trackId = String(tracks[activeIndex]?.id);
    if (deck.duration - deck.currentTime <= crossfadeDuration && autoCrossfadeStartedFor !== trackId) {
      autoCrossfadeStartedFor = trackId;
      handleNextTrack();
    }
  }
}));

videoPlayer.addEventListener('timeupdate', () => {
  if (!activeVideoMode) return;
  if (videoPlayer.duration && !sliderBg.classList.contains('dragging')) {
    const pct = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    sliderFill.style.width = `${pct}%`;
    sliderBg.setAttribute('aria-valuenow', String(Math.round(pct)));
    currTime.textContent = formatTime(videoPlayer.currentTime);
    durTime.textContent = formatTime(videoPlayer.duration);
  }
});

function updateVolumeIcon(v) {
  const icon = volumeIcon.querySelector('i');
  if (!icon) return;
  if (audio.muted || v === 0) icon.className = 'fa-solid fa-volume-xmark';
  else if (v < 0.5) icon.className = 'fa-solid fa-volume-low';
  else icon.className = 'fa-solid fa-volume-high';
  const label = audio.muted ? 'Unmute' : 'Mute';
  volumeIcon.setAttribute('aria-label', label);
  volumeIcon.title = label;
}

setupDraggableSlider(volumeBg, (pos) => {
  audio.volume = pos;
  videoPlayer.volume = pos;
  volumeFill.style.width = `${pos * 100}%`;
  volumeBg.setAttribute('aria-valuenow', String(Math.round(pos * 100)));
  updateVolumeIcon(pos);
  const cfg = loadUICfg(); cfg.volume = pos; saveUICfg(cfg);
});

volumeIcon.addEventListener('click', () => {
  audio.muted = !audio.muted;
  standbyAudio.muted = audio.muted;
  videoPlayer.muted = audio.muted;
  updateVolumeIcon(activeMedia.volume);
});

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// =========================================================
// DRAG & DROP
// =========================================================

let dragCounter = 0;

window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  if (dropOverlay && e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
    dropOverlay.style.display = 'flex';
  }
});

window.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    if (dropOverlay) dropOverlay.style.display = 'none';
  }
});

window.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragCounter = 0;
  if (dropOverlay) dropOverlay.style.display = 'none';

  const files = Array.from(e.dataTransfer.files || []);
  if (files.length === 0) return;

  let added = 0;
  for (const f of files) {
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    const audioExts = ['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac'];
    const videoExts = ['mp4', 'webm', 'mkv', 'mov', 'avi'];
    if (!audioExts.includes(ext) && !videoExts.includes(ext)) continue;

    const isVideo = videoExts.includes(ext);

    let filePath = null;
    try { filePath = window.api.getPathForFile(f); } catch (err) {}
    if (!filePath && f.path) filePath = f.path;
    if (!filePath) continue;
    const normalizedPath = filePath.toLowerCase();
    if (tracks.some(track => track.path && track.path.toLowerCase() === normalizedPath)) continue;

    const localUrl = 'outfix://' + encodeURIComponent(filePath);

    tracks.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      title: f.name.replace(/\.[^.]+$/, ''),
      artist: 'Local file',
      album: 'Local',
      cover: '',
      duration: 0,
      localPath: localUrl,
      path: filePath,
      ext: ext.toUpperCase(),
      type: isVideo ? 'video' : 'audio',
      isLiked: false,
    });
    added++;
  }

  if (added > 0) {
    await saveLibrary();
    renderTracks();
    showToast(`${added} track(s) added`, 'success');
  } else {
    showToast('No new audio/video files to add. Unsupported files and duplicates were skipped.', 'warning');
  }
});

// =========================================================
// BIN STATUS
// =========================================================

window.api.onBinStatus((d) => {
  if (d.status === 'ready') showToast('Tools ready', 'success');
  else if (d.status === 'error') showToast('Tools error: ' + d.message, 'error');
});

// =========================================================
// INIT
// =========================================================

init();
