// window.addEventListener('DOMContentLoaded', function () {
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PlAYER_STORAGE_KEY = "F8_PLAYER";
const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const playerDuration = $(".player-duration");
const playerRemaining = $('.player-remaining');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    // config trả về value của key đó
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Murder In My Mind',
            singer: 'Kordhell',
            path: './assets/music/song 1.mp3',
            image: './assets/img/song 1.jpg'
        },
        {
            name: 'Close Eyes',
            singer: 'DVRST',
            path: './assets/music/song 2.mp3',
            image: './assets/img/song 2.jpg'
        },
        {
            name: 'S.X.N.D. N.X.D.E.S',
            singer: 'BADTRIP MUSIC',
            path: './assets/music/song 3.mp3',
            image: './assets/img/song 3.jpg'
        },
        {
            name: 'RAVE',
            singer: 'Dxrk ダーク',
            path: './assets/music/song 4.mp3',
            image: './assets/img/song 4.jpg'
        },
        {
            name: 'IN THE CLUB',
            singer: 'Mishashi Sensei',
            path: './assets/music/song 5.mp3',
            image: './assets/img/song 5.jpg'
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        // thisIs.setConfig('isRandom', thisIs.isRandom)
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
        // nhét key và object {key, value} vào localstorage, chuyển đổi sang string 
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}" >
                            <div class="thumb" 
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        });
    },
    // currentSong: function () {
    //     return this.songs[this.currentIndex];
    // },

    handleEvents: function () {

        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xử lý cd quay và dừng 
        const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }
        ], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        // Handles CD enlargement / reduction
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play();
        }

        // khi bài hát được pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause();

        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //xử lý khi tua bài hát
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        }


        // khi next bài hát
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong()
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()
        }

        // khi prevert bài hát
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong()
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()
        }

        // xử lý bật tắt nút  random bài hát
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //xử lý bật tắt nút repeat 1 bài hát
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //xử lý next song khi auido ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }


        //lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || !e.target.closest('.option')) {
                //xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },


    scrollToActiveSong: function () {
        setTimeout(() => {
            if ((this.currentIndex) <= 2) {
                $('.song.active').scrollIntoView({
                    behavior: "smooth",
                    block: 'end'
                })
            } else {
                $('.song.active').scrollIntoView({
                    behavior: "smooth",
                    block: 'center'
                })
            }
        }, 400)
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong();
    },

    start: function () {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //định nghĩa các thuộc tính cho object
        this.defineProperties();

        //lắng nghe xử lý các sự kiện , DOM events
        this.handleEvents();

        //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //render lại danh sách bài hát playlist
        this.render();


        //hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();