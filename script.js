// ================= STATE & DATA STORAGE =================
let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Elemen DOM Utama
const audio = document.getElementById('audioPlayer');
const songListEl = document.getElementById('dynamicSongList');
const favSongListEl = document.getElementById('favSongList');
const miniPlayer = document.getElementById('miniPlayer');
const miniTitle = document.getElementById('miniTitle');
const miniArtist = document.getElementById('miniArtist');
const miniPlayBtn = document.getElementById('miniPlayBtn');
const miniPlayIcon = document.getElementById('miniPlayIcon');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const fullSongTitle = document.getElementById('fullSongTitle');
const fullArtistName = document.getElementById('fullArtistName');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const volumeSlider = document.getElementById('volumeSlider');
const favBtn = document.getElementById('favBtn');
const heartIcon = document.getElementById('heartIcon');
const searchInput = document.getElementById('searchInput');

// ================= 1. NAVIGASI MENU BAWAH (MULUS & RESPONSIF) =================
const navItems = document.querySelectorAll('.nav-item');
const viewPanes = document.querySelectorAll('.view-pane');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Hapus kelas active dari semua menu dan panel
        navItems.forEach(n => n.classList.remove('active'));
        viewPanes.forEach(v => v.classList.remove('active'));

        // Aktifkan menu dan panel tujuan
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    });
});

// ================= 2. NAVIGASI PEMUTAR FULL SCREEN =================
const playerView = document.getElementById('playerView');
const backBtn = document.getElementById('backBtn');
const openPlayerTriggers = document.querySelectorAll('[data-open-player]');

openPlayerTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        if(playlist.length > 0) playerView.classList.add('open');
    });
});

backBtn.addEventListener('click', () => {
    playerView.classList.remove('open');
});

// ================= 3. UPLOAD FILE MP3 LOKAL =================
const mp3FileInput = document.getElementById('mp3FileInput');
mp3FileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        for (let file of files) {
            const songObj = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Lokal Perangkat",
                url: URL.createObjectURL(file),
                isFav: false
            };
            playlist.push(songObj);
        }
        renderPlaylist();
        alert(`Berhasil menambahkan ${files.length} lagu!`);
        document.querySelector('[data-target="viewHome"]').click();
    }
});

// ================= 4. RENDER DAFTAR LAGU =================
function renderPlaylist(filter = '') {
    songListEl.innerHTML = '';
    favSongListEl.innerHTML = '';

    if (playlist.length === 0) {
        songListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu. Masuk ke menu <b>Tambah</b>.</p></div>`;
        favSongListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu favorit.</p></div>`;
        return;
    }

    let hasHomeResults = false;
    let hasFavResults = false;

    playlist.forEach((song, index) => {
        if (filter && !song.title.toLowerCase().includes(filter.toLowerCase()) && !song.artist.toLowerCase().includes(filter.toLowerCase())) {
            return;
        }

        hasHomeResults = true;
        const cardHTML = `
            <div class="song-card liquid-glass" onclick="playSong(${index})">
                <div class="mini-cover">♪</div>
                <div class="song-meta">
                    <h3 class="song-name">${song.title}</h3>
                    <p class="song-artist">${song.artist}</p>
                </div>
                <span class="song-duration">MP3</span>
            </div>
        `;
        songListEl.innerHTML += cardHTML;

        if (song.isFav) {
            hasFavResults = true;
            favSongListEl.innerHTML += cardHTML;
        }
    });

    if (!hasHomeResults) {
        songListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Lagu tidak ditemukan.</p></div>`;
    }
    if (!hasFavResults) {
        favSongListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu favorit.</p></div>`;
    }
}

searchInput.addEventListener('input', (e) => {
    renderPlaylist(e.target.value);
});

// ================= 5. KONTROL PEMUTAR AUDIO =================
function playSong(index) {
    currentIndex = index;
    const song = playlist[currentIndex];

    audio.src = song.url;
    audio.play().then(() => {
        isPlaying = true;
        updatePlayStateUI();
        miniPlayer.style.display = 'flex';
        
        miniTitle.textContent = song.title;
        miniArtist.textContent = song.artist;
        fullSongTitle.textContent = song.title;
        fullArtistName.textContent = song.artist;
        
        if (song.isFav) {
            favBtn.classList.add('liked');
            heartIcon.textContent = '♥';
        } else {
            favBtn.classList.remove('liked');
            heartIcon.textContent = '♡';
        }
    }).catch(err => console.log("Gagal memutar audio:", err));
}

function togglePlayState() {
    if (playlist.length === 0) return;
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        if (!audio.src && playlist.length > 0) {
            playSong(0);
            return;
        }
        audio.play();
        isPlaying = true;
    }
    updatePlayStateUI();
}

function updatePlayStateUI() {
    const iconPath = isPlaying 
        ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
        : '<path d="M8 5v14l11-7z"/>';
    
    playIcon.innerHTML = iconPath;
    miniPlayIcon.innerHTML = iconPath;
}

playBtn.addEventListener('click', togglePlayState);
miniPlayBtn.addEventListener('click', togglePlayState);

nextBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentIndex = (currentIndex + 1) % playlist.length;
    }
    playSong(currentIndex);
});

prevBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(currentIndex);
});

audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.play();
    } else {
        nextBtn.click();
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalDurationEl.textContent = formatTime(audio.duration);
    }
});

progressTrack.addEventListener('click', (e) => {
    const rect = progressTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
    }
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

// ================= 6. MORPHING MENU & FAVORIT =================
const morphMenu = document.getElementById('morphMenu');
const menuTrigger = document.getElementById('menuTrigger');

menuTrigger.addEventListener('click', () => {
    morphMenu.classList.toggle('open');
});

favBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    const currentSong = playlist[currentIndex];
    currentSong.isFav = !currentSong.isFav;
    
    if (currentSong.isFav) {
        favBtn.classList.add('liked');
        heartIcon.textContent = '♥';
    } else {
        favBtn.classList.remove('liked');
        heartIcon.textContent = '♡';
    }
    renderPlaylist(searchInput.value);
});

// ================= 7. TAB FILTER (BERANDA) =================
const tabs = document.querySelectorAll('.tab-pill[data-tab]');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.tabs?.forEach(t => {
            t.classList.remove('active');
            t.classList.add('liquid-glass');
        });
        tab.classList.add('active');
        tab.classList.remove('liquid-glass');
    });
});

// ================= 8. GESTURE USAP LAYAR (SWIPE NAVIGATION) =================
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const appContainer = document.querySelector('.app-container');

appContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

appContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const horizontalDist = touchStartX - touchEndX;
    const verticalDist = Math.abs(touchStartY - touchEndY);
    const swipeThreshold = 40; // Sensitivitas usapan agar lebih mudah merespons sentuhan jari

    if (Math.abs(horizontalDist) < swipeThreshold || verticalDist > Math.abs(horizontalDist)) {
        return;
    }

    const navList = Array.from(document.querySelectorAll('.nav-item'));
    const activeIndex = navList.findIndex(item => item.classList.contains('active'));

    if (activeIndex === -1) return;

    if (horizontalDist > 0) {
        // Usap ke Kiri -> Pindah ke tab berikutnya
        const nextIndex = (activeIndex + 1) % navList.length;
        navList[nextIndex].click();
    } else {
        // Usap ke Kanan -> Pindah ke tab sebelumnya
        const prevIndex = (activeIndex - 1 + navList.length) % navList.length;
        navList[prevIndex].click();
    }
}

// ================= 9. DAFTARKAN PWA SERVICE WORKER =================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('PWA Service Worker Berhasil Didaftarkan!'))
            .catch((err) => console.log('PWA Gagal:', err));
    });
}