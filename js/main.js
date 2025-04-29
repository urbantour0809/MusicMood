document.addEventListener('DOMContentLoaded', () => {
    let ACCESS_TOKEN = '';

    // Access Token 가져오기
    async function fetchAccessToken() {
        try {
            const response = await fetch('getToken.jsp');
            if (!response.ok) throw new Error('Token request failed');
            const data = await response.json();
            ACCESS_TOKEN = data.access_token;
            return ACCESS_TOKEN;
        } catch (error) {
            console.error('Token fetch error:', error);
            return null;
        }
    }

    // 무드별 플레이리스트 ID
    const MOOD_PLAYLISTS = {
        happy: {
            title: "즐거운 플레이리스트",
            playlists: [
                '2jqJzW5rXwu9FpUdGNdo2W'
            ]
        },
        calm: {
            title: "평온한 플레이리스트",
            playlists: [
                '1Krm4ydj8K9nhqsbzXW9Zg'
            ]
        },
        energetic: {
            title: "활기찬 플레이리스트",
            playlists: [
                '7k6QVcqBgBIjQYdwVReZBG'
            ]
        },
        sad: {
            title: "감성적인 플레이리스트",
            playlists: [
                '6sJ5fgYe6zpxkOtsl1s8MG'
            ]
        }
    };

    // 시간 포맷 함수
    function formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }

    // 플레이리스트 정보 가져오기
    async function fetchPlaylistInfo(playlistId) {
        try {
            // 플레이리스트 정보 가져오기
            const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            if (!playlistResponse.ok) throw new Error('Playlist fetch failed');
            const playlist = await playlistResponse.json();

            // 플레이리스트의 트랙 정보 가져오기
            const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            if (!tracksResponse.ok) throw new Error('Tracks fetch failed');
            const tracks = await tracksResponse.json();

            return { playlist, tracks };
        } catch (error) {
            console.error('Playlist fetch error:', error);
            return null;
        }
    }

// 무드별 플레이리스트 표시
async function showMoodPlaylists(mood) {
    try {
        if (!ACCESS_TOKEN) {
            await fetchAccessToken();
        }

        const moodData = MOOD_PLAYLISTS[mood];
        if (!moodData) return;

        const existingSection = document.querySelector('.mood-playlists');
        if (existingSection) {
            existingSection.classList.add('fade-out');
            await new Promise(resolve => setTimeout(resolve, 300));
            existingSection.remove();
        }

        const moodSection = document.createElement('section');
        moodSection.className = 'mood-playlists fade-in';
        moodSection.innerHTML = `
            <h3>${moodData.title}</h3>
            <div class="playlist-grid"></div>
        `;
        document.querySelector('.mood-selector').after(moodSection);

        const playlistGrid = moodSection.querySelector('.playlist-grid');
        const playlistId = moodData.playlists[0];
        const data = await fetchPlaylistInfo(playlistId);
        
        if (data) {
            console.log('Playlist Data:', data); // 반드시 찍어보기
            
            const { playlist, tracks } = data;
            
            // 여기서 playlist.images[0].url을 확실히 안전하게 불러오기
            const playlistImage = (playlist.images && playlist.images.length > 0)
                ? playlist.images[0].url
                : 'default-image.jpg';  // 기본 이미지

            playlistGrid.innerHTML = `
                <div class="playlist-card">
                    <div class="playlist-header">
                        <img src="${playlistImage}" 
                             alt="${playlist.name}" 
                             class="playlist-image">
                        <div class="playlist-info">
                            <h4>${playlist.name}</h4>
                            <p>${playlist.description || ''}</p>
                        </div>
                    </div>
                    <div class="playlist-tracks" style="display: none;">
                        ${tracks.items.map((item, index) => {
                            const track = item.track;
                            const trackImage = (track && track.album && track.album.images && track.album.images.length > 0)
                                ? track.album.images[0].url
                                : playlistImage; // 트랙 이미지 없으면 플레이리스트 대표이미지

                            return `
                                <div class="track-item">
                                    <span class="track-number">${index + 1}</span>
                                    <img src="${trackImage}" 
                                         class="track-thumbnail" 
                                         alt="${track ? track.name : 'Track image'}">
                                    <div class="track-info">
                                        <div class="track-name">${track ? track.name : 'Unknown Track'}</div>
                                        <div class="track-artist">
                                            ${track && track.artists ? track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}
                                        </div>
                                    </div>
                                    <div class="track-duration">${formatDuration(track ? track.duration_ms : 0)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // 플레이리스트 카드 클릭 이벤트
            const playlistCard = playlistGrid.querySelector('.playlist-card');
            playlistCard.addEventListener('click', function() {
                const tracksList = this.querySelector('.playlist-tracks');
                const isExpanded = this.classList.contains('expanded');
                
                this.classList.toggle('expanded');
                
                if (isExpanded) {
                    tracksList.style.display = 'none';
                } else {
                    tracksList.style.display = 'block';
                    tracksList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    } catch (error) {
        console.error('Error showing playlists:', error);
    }
}
	// 무드별 배경 효과 생성 함수
	function createMoodBackground(mood) {
	    const background = document.querySelector('.mood-background');
	    background.innerHTML = '';
	    background.className = 'mood-background'; // 클래스 초기화
	
	    switch(mood) {
	        case 'happy':
	            background.classList.add('happy-background');
	            // 개선된 버블 효과 생성
	            for(let i = 0; i < 20; i++) {
	                const bubble = document.createElement('div');
	                bubble.className = 'bubble';
	                // 랜덤한 크기와 위치 설정
	                const size = Math.random() * 60 + 20;
	                bubble.style.width = `${size}px`;
	                bubble.style.height = `${size}px`;
	                bubble.style.left = `${Math.random() * 100}%`;
	                bubble.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
	                bubble.style.animationDelay = `${Math.random() * 4}s`;
	                background.appendChild(bubble);
	            }
	            break;
	
	        case 'calm':
	            background.classList.add('calm-background');
	            // 부드러운 웨이브 효과 생성
	            for(let i = 0; i < 3; i++) {
	                const wave = document.createElement('div');
	                wave.className = 'wave';
	                background.appendChild(wave);
	            }
	            break;
	
	        case 'energetic':
	            // 사운드 웨이브 생성
	            const container = document.createElement('div');
	            container.className = 'energetic-background';
	            for(let i = 0; i < 50; i++) {
	                const bar = document.createElement('div');
	                bar.className = 'sound-bar';
	                bar.style.setProperty('--delay', i);
	                container.appendChild(bar);
	            }
	            background.appendChild(container);
	            break;
	
	        case 'sad':
	            // 빗방울 효과 생성
	            background.classList.add('sad-background');
	            for(let i = 0; i < 100; i++) {
	                const raindrop = document.createElement('div');
	                raindrop.className = 'raindrop';
	                raindrop.style.left = `${Math.random() * 100}%`;
	                raindrop.style.animationDelay = `${Math.random() * 2}s`;
	                background.appendChild(raindrop);
	            }
	            break;
	    }
	}
	
	// 무드 버튼 이벤트 리스너 수정
	const moodButtons = document.querySelectorAll('.mood-btn');
	moodButtons.forEach(button => {
	    button.addEventListener('click', async () => {
	        const mood = button.dataset.mood;
	        
	        // 현재 컨텐츠 페이드 아웃
	        const currentContent = document.querySelector('.mood-playlists');
	        if (currentContent) {
	            currentContent.classList.add('fade-exit');
	            await new Promise(resolve => setTimeout(resolve, 500));
	        }
	
	        // 배경 효과 변경
	        document.body.dataset.mood = mood;
	        createMoodBackground(mood);
	
	        // 새 컨텐츠 페이드 인
	        await showMoodPlaylists(mood);
	        const newContent = document.querySelector('.mood-playlists');
	        if (newContent) {
	            newContent.classList.add('fade-enter');
	            requestAnimationFrame(() => {
	                newContent.classList.add('fade-enter-active');
	            });
	        }
	    });
	});
    // 테마 토글 버튼
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            themeToggle.textContent = document.body.classList.contains('dark-theme') ? '🌙' : '☀️';
        });
    }

    // 슬라이더 기능
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 5000;

    slides[currentSlide].classList.add('active');

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, slideInterval);

    // 이미지 프리로딩
    function preloadImages() {
        const imageUrls = [
            './assets/images/1.png',
            './assets/images/2.png',
            './assets/images/3.png',
            './assets/images/4.png'
        ];

        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    preloadImages();

    // 초기화
    (async function init() {
        await fetchAccessToken();
    })();
});