// ==========================================================================
// ЭКОГРАД: ХРАНИТЕЛИ ЭНЕРГИИ — PRODUCTION APPLICATION CORE (VANILLA JS)
// ==========================================================================

const GAME_STORAGE_KEY = 'ecograd_game_state_v6';

const defaultState = {
    totalPoints: 0,
    unlockedGames: [1],
    completedGames: [],
    badges: [],
    cityStage: 1,
    game1Points: 0,
    game2Points: 0,
    game3Points: 0,
    game1SolvedItems: [],
    game2PlacedItems: [],
    game3CompletedLocations: [],
    playerName: 'Юный Хранитель'
};

// ==========================================================================
// GAME 1 QUESTION DATABASE (3 ROOMS, 2 ITEMS PER ROOM, 2 QUESTIONS PER ITEM)
// Exactly according to user specification in Section 5
// ==========================================================================
const GAME1_DATA = {
    1: {
        name: 'Гостиная',
        fixedImg: 'assets/games/game1/livingroom_fixed_all.jpg',
        problemImg: 'assets/games/game1/livingroom_fixed_all.jpg',
        successTitle: 'ГОСТИНАЯ СПАСЕНА!',
        successDesc: 'Ты выключил лишний свет и телевизор! Теперь в гостиной уютно, аккуратно и сохраняется энергия!',
        items: {
            lamp1: {
                name: 'Лампа',
                questions: [
                    {
                        text: 'Почему нужно выключать свет, когда выходишь из комнаты?',
                        options: [
                            { text: 'Чтобы экономить электричество', correct: true },
                            { text: 'Чтобы в комнате стало темно и страшно', correct: false }
                        ],
                        tip: 'Правильно! Если свет горит зря, тратится драгоценная энергия. Выключай свет — береги планету!'
                    },
                    {
                        text: 'Что нужно сделать, если в комнате никого нет?',
                        options: [
                            { text: 'Выключить свет', correct: true },
                            { text: 'Оставить свет включённым', correct: false }
                        ],
                        tip: 'Молодец! В пустой комнате свет гореть не должен!'
                    }
                ]
            },
            tv1: {
                name: 'Телевизор',
                questions: [
                    {
                        text: 'Что нужно сделать, если никто не смотрит телевизор?',
                        options: [
                            { text: 'Выключить телевизор', correct: true },
                            { text: 'Оставить его работать', correct: false }
                        ],
                        tip: 'Отлично! Телевизор не должен работать в пустой комнате без зрителей!'
                    },
                    {
                        text: 'Почему не стоит оставлять телевизор включённым просто так?',
                        options: [
                            { text: 'Он зря расходует электричество', correct: true },
                            { text: 'Он сам заряжается от воздуха', correct: false }
                        ],
                        tip: 'Верно! Работающий телевизор постоянно расходует электроэнергию!'
                    }
                ]
            }
        }
    },
    2: {
        name: 'Кухня',
        fixedImg: 'assets/games/game1/kitchen_fixed_all.jpg',
        problemImg: 'assets/games/game1/kitchen_problem_all.jpg',
        successTitle: 'КУХНЯ СПАСЕНА!',
        successDesc: 'Холодильник закрыт, кран выключен. Кухня выглядит чистой, уютной и энергоэффективной!',
        items: {
            fridge2: {
                name: 'Холодильник',
                questions: [
                    {
                        text: 'Почему нельзя надолго оставлять холодильник открытым?',
                        options: [
                            { text: 'Он теряет холод и расходует больше электричества', correct: true },
                            { text: 'Внутри начинают светиться продукты', correct: false }
                        ],
                        tip: 'Точно! Тёплый воздух попадает внутрь, и мотору приходится тратить много энергии на охлаждение!'
                    },
                    {
                        text: 'Что нужно сделать после того, как достал продукты?',
                        options: [
                            { text: 'Закрыть дверцу холодильника', correct: true },
                            { text: 'Оставить дверцу открытой', correct: false }
                        ],
                        tip: 'Правильно! Достал вкусное яблочко — сразу плотно закрой дверцу!'
                    }
                ]
            },
            faucet2: {
                name: 'Кран',
                questions: [
                    {
                        text: 'Почему нельзя оставлять воду включённой без необходимости?',
                        options: [
                            { text: 'Так вода зря расходуется', correct: true },
                            { text: 'Вода становится невидимой', correct: false }
                        ],
                        tip: 'Умница! Чистая пресная вода очень ценна, её нужно беречь!'
                    },
                    {
                        text: 'Что нужно сделать после мытья рук?',
                        options: [
                            { text: 'Закрыть кран', correct: true },
                            { text: 'Оставить воду течь', correct: false }
                        ],
                        tip: 'Супер! Помыл ручки чисто — сразу плотно закрути кран!'
                    }
                ]
            }
        }
    },
    3: {
        name: 'Спальня',
        fixedImg: 'assets/games/game1/bedroom_fixed_all.jpg',
        problemImg: 'assets/games/game1/bedroom_problem_all.jpg',
        successTitle: 'СПАЛЬНЯ СПАСЕНА!',
        successDesc: 'Окно закрыто после проветривания, свет выключен. Комната выглядит комфортной и уютной!',
        items: {
            window3: {
                name: 'Окно и батарея',
                questions: [
                    {
                        text: 'Почему не стоит долго держать окно открытым, когда работает отопление?',
                        options: [
                            { text: 'Тепло уходит на улицу', correct: true },
                            { text: 'Радиатор начинает вырабатывать больше солнца', correct: false }
                        ],
                        tip: 'Верно! Если окно долго открыто зимой, драгоценное тепло батарей вылетает на улицу!'
                    },
                    {
                        text: 'Что лучше сделать, если нужно проветрить комнату?',
                        options: [
                            { text: 'Проветрить ненадолго, а затем закрыть окно', correct: true },
                            { text: 'Оставить окно открытым надолго', correct: false }
                        ],
                        tip: 'Отлично! Короткое проветривание освежает воздух и сохраняет тепло стен!'
                    }
                ]
            },
            bedlamp3: {
                name: 'Свет в спальне',
                questions: [
                    {
                        text: 'Что нужно сделать, уходя из спальни?',
                        options: [
                            { text: 'Выключить свет', correct: true },
                            { text: 'Оставить свет включённым', correct: false }
                        ],
                        tip: 'Точно! Выходя из любой комнаты, не забывай выключать свет!'
                    },
                    {
                        text: 'Почему важно выключать свет в пустой комнате?',
                        options: [
                            { text: 'Чтобы не расходовать электричество зря', correct: true },
                            { text: 'Чтобы лампочка не скучала', correct: false }
                        ],
                        tip: 'Ура! Выключенный вовремя свет бережёт энергию нашей планеты!'
                    }
                ]
            }
        }
    }
};

// ==========================================================================
// GAME 3 LOCATION QUESTIONS (5 LOCATIONS, 3 QUESTIONS EACH = 15 QUESTIONS)
// Exactly matching the prompt:
// 1. «Солнечная поляна»
// 2. «Лесная тропинка»
// 3. «Река Чистюля»
// 4. «Энергодом»
// 5. «Парк будущего»
// ==========================================================================
const GAME3_DATA = [
    {
        id: 'bunny',
        name: 'Солнечная поляна',
        questions: [
            {
                text: 'На солнечной полянке днём очень светло. Зачем здесь нужны солнечные фонарики?',
                options: [
                    { text: 'Они накапливают энергию солнца днём, чтобы светить ночью', correct: true },
                    { text: 'Чтобы днём солнышку было веселее светить', correct: false },
                    { text: 'Чтобы пугать дневных бабочек', correct: false }
                ],
                tip: 'Солнечные батареи улавливают чистый солнечный свет и бесплатно освещают дорожки ночью!'
            },
            {
                text: 'Зверята на полянке собрали ягоды и хотят помыть их. Как лучше поступить, чтобы сберечь воду?',
                options: [
                    { text: 'Помыть ягодки в мисочке с водой, а не под сильной струёй из шланга', correct: true },
                    { text: 'Включить воду на полную мощность на целый час', correct: false },
                    { text: 'Бросить ягоды в фонтан', correct: false }
                ],
                tip: 'Мытьё ягод и овощей в миске сберегает десятки литров чистой воды!'
            },
            {
                text: 'Какое главное правило энергосбережения в ясный солнечный день?',
                options: [
                    { text: 'Использовать естественный свет солнца и выключать лампочки', correct: true },
                    { text: 'Включить все фонарики на поляне', correct: false }
                ],
                tip: 'Солнечный свет дарит радость, тепло и бережёт электричество!'
            }
        ]
    },
    {
        id: 'park',
        name: 'Лесная тропинка',
        questions: [
            {
                text: 'На каком транспорте лучше всего передвигаться по лесной тропинке, чтобы сохранить воздух чистым?',
                options: [
                    { text: 'На велосипеде, самокате или пешком', correct: true },
                    { text: 'На старом дымящем грузовике', correct: false },
                    { text: 'На бензиновом мопеде без глушителя', correct: false }
                ],
                tip: 'Велосипеды и прогулки пешком не загрязняют природу и делают нас здоровыми!'
            },
            {
                text: 'Зачем вдоль лесной тропинки высаживают молодые деревья и кустарники?',
                options: [
                    { text: 'Они вырабатывают чистый кислород и задерживают пыль', correct: true },
                    { text: 'Чтобы закрывать небо от птиц', correct: false }
                ],
                tip: 'Деревья — это зелёные лёгкие нашей планеты!'
            },
            {
                text: 'Что нужно сделать с фантиком от конфеты на прогулке в лесу?',
                options: [
                    { text: 'Донести до урны или забрать домой в кармане', correct: true },
                    { text: 'Бросить под кустик на тропинке', correct: false },
                    { text: 'Закопать в мох', correct: false }
                ],
                tip: 'Береги природу: мусор должен попадать только в урны и на переработку!'
            }
        ]
    },
    {
        id: 'fountain',
        name: 'Река Чистюля',
        questions: [
            {
                text: 'У реки Чистюли из краника капает вода прямо на камни. Что должен сделать юный Хранитель?',
                options: [
                    { text: 'Плотно закрыть вентиль крана!', correct: true },
                    { text: 'Открыть кран ещё сильнее', correct: false },
                    { text: 'Пройти мимо и не обращать внимания', correct: false }
                ],
                tip: 'Каждая капелька чистой воды драгоценна для всех жителей планеты!'
            },
            {
                text: 'Как жители Экограда могут с пользой применить дождевую воду у реки?',
                options: [
                    { text: 'Собирать в бочки для полива клумб и огородов', correct: true },
                    { text: 'Сразу выливать в канализацию', correct: false }
                ],
                tip: 'Дождевая вода мягкая и очень полезна для полива цветов!'
            },
            {
                text: 'Почему нельзя мыть машины и велосипеды с мылом прямо в речке?',
                options: [
                    { text: 'Грязная пена отравляет воду, рыбок и речные растения', correct: true },
                    { text: 'Рыбкам очень нравится мыльная пена', correct: false }
                ],
                tip: 'Чистая вода в реках — залог здоровья всей живой природы!'
            }
        ]
    },
    {
        id: 'school',
        name: 'Энергодом',
        questions: [
            {
                text: 'В умном Энергодоме наступил вечер, и жильцы ложатся спать. Что нужно сделать с техникой?',
                options: [
                    { text: 'Выключить компьютеры и телевизоры из розеток', correct: true },
                    { text: 'Оставить все экраны включёнными до утра', correct: false },
                    { text: 'Включить громкую музыку на всю ночь', correct: false }
                ],
                tip: 'Выключение приборов из сети сохраняет огромное количество энергии!'
            },
            {
                text: 'Какая бытовая техника в Энергодоме помогает беречь ресурсы семьи?',
                options: [
                    { text: 'С высоким классом энергоэффективности А+++', correct: true },
                    { text: 'Самая старая и сильно гудящая техника', correct: false }
                ],
                tip: 'Современные приборы класса А+++ тратят минимум электричества!'
            },
            {
                text: 'Что помогает Энергодому сохранять тепло зимой без лишнего отопления?',
                options: [
                    { text: 'Качественные тёплые стеклопакеты и утеплённые стены', correct: true },
                    { text: 'Распахнутые настежь двери и окна', correct: false }
                ],
                tip: 'Утеплённый дом держит тепло как термос и не требует лишнего обогрева!'
            }
        ]
    },
    {
        id: 'bear',
        name: 'Парк будущего',
        questions: [
            {
                text: 'Какая энергия приводит в движение аттракционы и фонарики в Парке будущего?',
                options: [
                    { text: 'Чистая энергия ветра и солнечных лучей', correct: true },
                    { text: 'Дизельные генераторы с едким черным дымом', correct: false },
                    { text: 'Костры из сухих веток на площадках', correct: false }
                ],
                tip: 'Ветер и солнце — бесконечные и экологически чистые источники энергии будущего!'
            },
            {
                text: 'Для полива газонов в Парке будущего установлены умные датчики влажности. Зачем они нужны?',
                options: [
                    { text: 'Чтобы включать полив только тогда, когда земля действительно высохла', correct: true },
                    { text: 'Чтобы поливать траву даже во время сильного дождя', correct: false }
                ],
                tip: 'Умный полив не тратит лишнюю воду во время дождя и прохлады!'
            },
            {
                text: 'В какую урну в Парке будущего нужно выбросить пластиковую бутылочку от сока?',
                options: [
                    { text: 'В специальный контейнер для пластика, чтобы отправить на переработку', correct: true },
                    { text: 'Бросить на зелёную травку под скамейку', correct: false }
                ],
                tip: 'Раздельный сбор мусора позволяет делать из старого пластика полезные новые вещи!'
            }
        ]
    }
];

class EcogradApp {
    constructor() {
        this.state = this.loadState();
        this.activeModal = null;
        this.selectedTrayItem = null;

        // Game 1 Runtime State
        this.game1CurrentRoom = 1;
        this.game1ActiveItemKey = null;
        this.game1ActiveQuestionIdx = 0;

        // Game 2 Runtime State
        this.game2PlacedItems = new Set(this.state.game2PlacedItems || []);

        // Game 3 Runtime State
        this.game3ActiveLocId = null;
        this.game3ActiveQuestionIdx = 0;

        this.init();
    }

    loadState() {
        try {
            const raw = localStorage.getItem(GAME_STORAGE_KEY);
            if (raw) return { ...defaultState, ...JSON.parse(raw) };
        } catch (e) {}
        return { ...defaultState };
    }

    saveState() {
        try {
            localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {}
        this.updateUI();
    }

    resetProgress() {
        if (confirm('Начать приключение заново? Все очки и значки будут сброшены.')) {
            this.state = { ...defaultState };
            this.saveState();
            location.reload();
        }
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.initCharacterInteractions();
        this.restoreGame2Slots();
    }

    updateUI() {
        const pointsEl = document.getElementById('total-points-display');
        if (pointsEl) pointsEl.textContent = this.state.totalPoints;

        const badgesCountEl = document.getElementById('total-badges-display');
        if (badgesCountEl) badgesCountEl.textContent = `${this.state.badges.length} / 3`;

        const cityStages = [0, 33, 66, 100];
        const percent = cityStages[this.state.cityStage - 1] || 0;
        const meterFill = document.getElementById('city-meter-fill');
        const meterText = document.getElementById('city-meter-percent');
        if (meterFill) meterFill.style.width = `${percent}%`;
        if (meterText) meterText.textContent = `${percent}%`;

        const heroBgImg = document.getElementById('hero-bg-img');
        const cityThumb = document.getElementById('city-status-thumb');
        const stageImages = {
            1: 'assets/backgrounds/city_stage1.jpg',
            2: 'assets/backgrounds/city_stage2.jpg',
            3: 'assets/backgrounds/city_stage3.jpg',
            4: 'assets/backgrounds/city_stage4_final.jpg'
        };
        const currentBg = stageImages[this.state.cityStage] || stageImages[1];
        if (heroBgImg) heroBgImg.src = currentBg;
        if (cityThumb) cityThumb.src = currentBg;

        this.updateCardState(1, 'card-game-1', 100, this.state.game1Points);
        this.updateCardState(2, 'card-game-2', 150, this.state.game2Points);
        this.updateCardState(3, 'card-game-3', 200, this.state.game3Points);

        this.updateBadgesUI();
        this.updateCertificateUI();
    }

    updateCardState(gameNum, cardId, maxPts, currentPts) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const isUnlocked = this.state.unlockedGames.includes(gameNum);
        const isCompleted = this.state.completedGames.includes(gameNum);
        const statusBadge = card.querySelector('.card-status-badge');
        const playBtn = card.querySelector('.btn-card-play');
        const pointsTag = card.querySelector('.card-points-tag');

        card.classList.remove('locked', 'completed');

        if (isCompleted) {
            card.classList.add('completed');
            if (statusBadge) {
                statusBadge.className = 'card-status-badge badge-completed';
                statusBadge.textContent = 'Пройдено';
            }
            if (playBtn) playBtn.textContent = 'Играть снова';
            if (pointsTag) pointsTag.textContent = `${currentPts} / ${maxPts} энергии`;
        } else if (isUnlocked) {
            if (statusBadge) {
                statusBadge.className = 'card-status-badge badge-open';
                statusBadge.textContent = 'Доступно';
            }
            if (playBtn) playBtn.textContent = 'Начать игру';
            if (pointsTag) pointsTag.textContent = `до ${maxPts} энергии`;
        } else {
            card.classList.add('locked');
            if (statusBadge) {
                statusBadge.className = 'card-status-badge badge-locked';
                statusBadge.textContent = 'Заблокировано';
            }
            if (playBtn) playBtn.textContent = `Пройди игру ${gameNum - 1}`;
            if (pointsTag) pointsTag.textContent = `до ${maxPts} энергии`;
        }
    }

    updateBadgesUI() {
        const b1 = document.getElementById('badge-box-1');
        const b2 = document.getElementById('badge-box-2');
        const b3 = document.getElementById('badge-box-3');

        if (b1) this.setBadgeBox(b1, this.state.badges.includes('rescuer'));
        if (b2) this.setBadgeBox(b2, this.state.badges.includes('master'));
        if (b3) this.setBadgeBox(b3, this.state.badges.includes('guardian'));
    }

    setBadgeBox(box, isUnlocked) {
        box.classList.toggle('locked', !isUnlocked);
        const tag = box.querySelector('.badge-status-tag');
        if (tag) {
            if (isUnlocked) {
                tag.className = 'badge-status-tag tag-unlocked';
                tag.textContent = 'Получено';
            } else {
                tag.className = 'badge-status-tag tag-locked';
                tag.textContent = 'Не открыто';
            }
        }
    }

    updateCertificateUI() {
        const certName = document.getElementById('cert-player-name');
        const certDate = document.getElementById('cert-date');
        const nameInput = document.getElementById('child-name-input');
        if (certName) certName.textContent = this.state.playerName || 'Юный Хранитель';
        if (nameInput) nameInput.value = this.state.playerName || '';
        if (certDate) {
            const now = new Date();
            certDate.textContent = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }

    scrollToAdventures() {
        if (window.soundEngine) window.soundEngine.playSfx('click');
        const adv = document.getElementById('adventures');
        if (adv) {
            adv.scrollIntoView({ behavior: 'smooth' });
        }
    }

    initCharacterInteractions() {
        const heroFox = document.getElementById('hero-character');
        const speechBubble = document.getElementById('character-speech');

        const phrases = [
            "Привет! Я лисёнок Лучик! Давай спасать наш Экоград!",
            "Капля за каплей утекает река — закрывай краны!",
            "Уходя из комнаты — всегда гаси свет!",
            "Береги тепло в доме — не открывай окна на весь день зимой!",
            "Ты отлично справляешься! Вперёд к приключениям!"
        ];

        let pIdx = 0;
        if (heroFox) {
            heroFox.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playSfx('click');
                const phrase = phrases[pIdx % phrases.length];
                pIdx++;
                if (speechBubble) {
                    speechBubble.textContent = phrase;
                    speechBubble.style.display = 'block';
                    speechBubble.animate([
                        { transform: 'scale(0.85) translateY(10px)', opacity: 0 },
                        { transform: 'scale(1) translateY(0)', opacity: 1 }
                    ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
                }
            });
        }
    }

    bindEvents() {
        // Smooth Anchor navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId.startsWith('#modal-') || targetId === '#') return;
                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    if (window.soundEngine) window.soundEngine.playSfx('click');
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Audio Controls
        const musicBtn = document.getElementById('toggle-music-btn');
        const sfxBtn = document.getElementById('toggle-sfx-btn');

        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                const on = window.soundEngine.toggleMusic();
                musicBtn.classList.toggle('muted', !on);
            });
        }
        if (sfxBtn) {
            sfxBtn.addEventListener('click', () => {
                const on = window.soundEngine.toggleSfx();
                sfxBtn.classList.toggle('muted', !on);
            });
        }

        // Hero Buttons
        document.getElementById('hero-start-btn')?.addEventListener('click', () => {
            this.scrollToAdventures();
        });
        document.getElementById('hero-tutorial-btn')?.addEventListener('click', () => {
            this.openModal('modal-tutorial');
        });

        // Cards
        document.getElementById('card-game-1')?.addEventListener('click', () => this.openGame(1));
        document.getElementById('card-game-2')?.addEventListener('click', () => this.openGame(2));
        document.getElementById('card-game-3')?.addEventListener('click', () => this.openGame(3));

        // Modals Close
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playSfx('click');
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeAllModals();
            });
        });

        // Certificate Name
        document.getElementById('child-name-input')?.addEventListener('input', (e) => {
            this.state.playerName = e.target.value.trim() || 'Юный Хранитель';
            const certName = document.getElementById('cert-player-name');
            if (certName) certName.textContent = this.state.playerName;
            this.saveState();
        });

        document.getElementById('btn-print-cert')?.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playSfx('click');
            window.print();
        });

        // Game 1 Room Tabs
        document.querySelectorAll('.room-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const roomNum = parseInt(tab.dataset.room, 10);
                this.switchGame1Room(roomNum);
            });
        });

        // Room Success Next Room Button
        document.getElementById('room-success-next-btn')?.addEventListener('click', () => {
            this.handleGame1RoomSuccessNext();
        });

        // Game 2 Success Next Button
        document.getElementById('game2-success-next-btn')?.addEventListener('click', () => {
            this.closeAllModals();
            this.openGame(3);
        });

        this.initGame1Mechanics();
        this.initGame2DragDrop();
        this.initGame3Mechanics();
    }

    openModal(id) {
        if (window.soundEngine) window.soundEngine.playSfx('click');
        this.closeAllModals();
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            this.activeModal = modal;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        this.activeModal = null;
    }

    openGame(gameNum) {
        if (!this.state.unlockedGames.includes(gameNum)) {
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');
            alert(`Это приключение откроется после завершения Игры ${gameNum - 1}!`);
            return;
        }

        if (gameNum === 1) {
            this.openModal('modal-game1');
            this.switchGame1Room(1);
        } else if (gameNum === 2) {
            this.openModal('modal-game2');
        } else if (gameNum === 3) {
            this.openModal('modal-game3');
        }
    }

    // Helper: Fisher-Yates array shuffle for randomizing options
    shuffle(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // ==========================================================================
    // GAME 1: СПАСИ ЭНЕРГИЮ! (QUESTION BASED PER ITEM)
    // ==========================================================================
    initGame1Mechanics() {
        document.querySelectorAll('.room-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const room = parseInt(btn.dataset.room, 10);
                const itemKey = btn.dataset.item;

                if (this.state.game1SolvedItems.includes(itemKey)) {
                    return;
                }

                this.startGame1ItemQuestions(room, itemKey);
            });
        });

        const nextQBtn = document.getElementById('game1-q-next-btn');
        if (nextQBtn) {
            nextQBtn.addEventListener('click', () => {
                this.handleGame1NextQuestionClick();
            });
        }
    }

    switchGame1Room(roomNum) {
        this.game1CurrentRoom = roomNum;
        if (window.soundEngine) window.soundEngine.playSfx('click');

        document.querySelectorAll('.room-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.room, 10) === roomNum);
        });

        document.getElementById('game1-question-overlay').style.display = 'none';
        document.getElementById('game1-room-success-overlay').style.display = 'none';

        const roomData = GAME1_DATA[roomNum];
        const itemKeys = Object.keys(roomData.items);
        const solvedCount = itemKeys.filter(k => this.state.game1SolvedItems.includes(k)).length;
        const allSolved = solvedCount >= itemKeys.length;

        // CRITICAL REQUIREMENT:
        // Room image stays on the problem illustration until ALL items in that room are solved!
        const bgImg = document.getElementById('game1-room-bg');
        if (bgImg) {
            bgImg.src = allSolved ? roomData.fixedImg : roomData.problemImg;
        }

        // Show/hide simple neutral buttons for this room
        document.querySelectorAll('.room-item-btn').forEach(btn => {
            const btnRoom = parseInt(btn.dataset.room, 10);
            const isThisRoom = (btnRoom === roomNum);
            btn.style.display = isThisRoom ? 'flex' : 'none';

            if (isThisRoom) {
                const isSolved = this.state.game1SolvedItems.includes(btn.dataset.item);
                btn.classList.toggle('solved', isSolved);
            }
        });

        const remainingNum = Math.max(0, itemKeys.length - solvedCount);
        const remainingEl = document.getElementById('room-remaining-num');
        if (remainingEl) remainingEl.textContent = remainingNum;

        const greetings = {
            1: 'Гостиная: найди неисправности и нажми на светящиеся кнопки рядом с ними!',
            2: 'Кухня: найди, где зря расходуются вода и холод, и нажми на круглые кнопки!',
            3: 'Спальня: найди, где уходит тепло и горит лишний свет, и нажми на кнопки!'
        };
        const bubble = document.getElementById('game1-companion-bubble');
        if (bubble) bubble.textContent = greetings[roomNum] || '';
    }

    startGame1ItemQuestions(roomNum, itemKey) {
        if (window.soundEngine) window.soundEngine.playSfx('click');
        this.game1ActiveItemKey = itemKey;
        this.game1ActiveQuestionIdx = 0;

        const overlay = document.getElementById('game1-question-overlay');
        if (overlay) overlay.style.display = 'flex';

        this.renderGame1Question();
    }

    renderGame1Question() {
        const roomNum = this.game1CurrentRoom;
        const itemKey = this.game1ActiveItemKey;
        const itemData = GAME1_DATA[roomNum].items[itemKey];
        const qData = itemData.questions[this.game1ActiveQuestionIdx];

        const tagEl = document.getElementById('game1-q-tag');
        const counterEl = document.getElementById('game1-q-counter');
        const textEl = document.getElementById('game1-q-text');
        const optionsList = document.getElementById('game1-q-options');
        const feedbackBox = document.getElementById('game1-q-feedback');

        if (tagEl) tagEl.textContent = itemData.name;
        if (counterEl) counterEl.textContent = `Вопрос ${this.game1ActiveQuestionIdx + 1} из 2`;
        if (textEl) textEl.textContent = qData.text;
        if (feedbackBox) feedbackBox.style.display = 'none';

        if (optionsList) {
            optionsList.innerHTML = '';
            // MANDATORY SHUFFLE: Randomize options order so correct answer is not always first
            const shuffledOptions = this.shuffle(qData.options);
            shuffledOptions.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'question-option-btn';
                btn.innerHTML = `<span class="opt-letter">${idx + 1}.</span> <span>${opt.text}</span>`;
                btn.addEventListener('click', () => {
                    this.handleGame1OptionChoice(opt, btn, qData);
                });
                optionsList.appendChild(btn);
            });
        }
    }

    handleGame1OptionChoice(option, buttonEl, qData) {
        const feedbackBox = document.getElementById('game1-q-feedback');
        const feedbackMsg = document.getElementById('game1-q-msg');
        const feedbackFox = document.getElementById('game1-q-fox');
        const nextBtn = document.getElementById('game1-q-next-btn');
        const allOptionBtns = document.querySelectorAll('.question-option-btn');

        if (option.correct) {
            buttonEl.classList.add('correct');
            allOptionBtns.forEach(b => b.disabled = true);

            if (window.soundEngine) {
                window.soundEngine.playSfx('correct');
                window.soundEngine.playSfx('crystal');
            }

            this.state.game1Points = Math.min(100, this.state.game1Points + 15);
            this.state.totalPoints = this.calculateTotalPoints();
            this.saveState();

            if (feedbackBox) feedbackBox.style.display = 'flex';
            if (feedbackFox) feedbackFox.src = 'assets/characters/luchik_happy.png';
            if (feedbackMsg) feedbackMsg.textContent = qData.tip;

            // User prompt: button says "Дальше"
            nextBtn.textContent = 'Дальше';
        } else {
            buttonEl.classList.add('wrong');
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');

            if (feedbackBox) feedbackBox.style.display = 'flex';
            if (feedbackFox) feedbackFox.src = 'assets/characters/luchik_thinking.png';
            if (feedbackMsg) feedbackMsg.textContent = 'Подумай ещё раз, как поступить правильнее!';

            nextBtn.textContent = 'Попробовать снова';
        }
    }

    handleGame1NextQuestionClick() {
        const nextBtn = document.getElementById('game1-q-next-btn');
        if (nextBtn.textContent === 'Попробовать снова') {
            const feedbackBox = document.getElementById('game1-q-feedback');
            if (feedbackBox) feedbackBox.style.display = 'none';
            document.querySelectorAll('.question-option-btn').forEach(b => {
                b.disabled = false;
                b.classList.remove('wrong', 'correct');
            });
            return;
        }

        if (this.game1ActiveQuestionIdx === 0) {
            // Advance to question 2 for the same item
            this.game1ActiveQuestionIdx = 1;
            this.renderGame1Question();
        } else {
            // Completed 2nd question -> item solved!
            this.completeGame1Item(this.game1ActiveItemKey);
        }
    }

    completeGame1Item(itemKey) {
        if (!this.state.game1SolvedItems.includes(itemKey)) {
            this.state.game1SolvedItems.push(itemKey);
            this.saveState();
        }

        // Close question dialog
        const overlay = document.getElementById('game1-question-overlay');
        if (overlay) overlay.style.display = 'none';

        // Disappear the button for this item
        const btn = document.querySelector(`.room-item-btn[data-item="${itemKey}"]`);
        if (btn) {
            btn.classList.add('solved');
        }

        const roomNum = this.game1CurrentRoom;
        const roomData = GAME1_DATA[roomNum];
        const itemKeys = Object.keys(roomData.items);
        const solvedCount = itemKeys.filter(k => this.state.game1SolvedItems.includes(k)).length;

        const remainingEl = document.getElementById('room-remaining-num');
        if (remainingEl) remainingEl.textContent = Math.max(0, itemKeys.length - solvedCount);

        // Check if ALL items in the current room are solved!
        if (solvedCount >= itemKeys.length) {
            this.triggerRoomCompletion(roomNum);
        }
    }

    triggerRoomCompletion(roomNum) {
        const roomData = GAME1_DATA[roomNum];
        const bgImg = document.getElementById('game1-room-bg');

        // Smooth transition to fixed illustration: dissolves / switches smoothly
        if (bgImg) {
            bgImg.style.transition = 'opacity 0.5s ease';
            bgImg.style.opacity = '0.2';
            setTimeout(() => {
                bgImg.src = roomData.fixedImg;
                bgImg.style.opacity = '1';
            }, 400);
        }

        if (window.soundEngine) {
            window.soundEngine.playSfx('complete');
            window.soundEngine.playSfx('crystal');
        }

        // Show celebratory Room Success Overlay
        setTimeout(() => {
            const successOverlay = document.getElementById('game1-room-success-overlay');
            const titleEl = document.getElementById('room-success-title');
            const descEl = document.getElementById('room-success-desc');
            const thumbEl = document.getElementById('room-success-thumb');
            const btnText = document.getElementById('room-success-btn-text');

            if (titleEl) titleEl.textContent = roomData.successTitle;
            if (descEl) descEl.textContent = roomData.successDesc;
            if (thumbEl) thumbEl.src = roomData.fixedImg;

            if (btnText) {
                if (roomNum < 3) {
                    btnText.textContent = `Следующая комната (${GAME1_DATA[roomNum + 1].name})`;
                } else {
                    btnText.textContent = 'Завершить игру!';
                }
            }

            if (successOverlay) successOverlay.style.display = 'flex';
        }, 700);
    }

    handleGame1RoomSuccessNext() {
        const successOverlay = document.getElementById('game1-room-success-overlay');
        if (successOverlay) successOverlay.style.display = 'none';

        if (this.game1CurrentRoom < 3) {
            this.switchGame1Room(this.game1CurrentRoom + 1);
        } else {
            this.completeGame1();
        }
    }

    completeGame1() {
        if (window.soundEngine) {
            window.soundEngine.playSfx('badge');
            window.soundEngine.playSfx('unlock');
        }

        if (!this.state.completedGames.includes(1)) {
            this.state.completedGames.push(1);
        }
        if (!this.state.unlockedGames.includes(2)) {
            this.state.unlockedGames.push(2);
        }
        if (!this.state.badges.includes('rescuer')) {
            this.state.badges.push('rescuer');
        }
        this.state.cityStage = Math.max(this.state.cityStage, 2);
        this.state.game1Points = 100;
        this.state.totalPoints = this.calculateTotalPoints();
        this.saveState();

        alert("УРА! Все три комнаты спасены!\nПолучен значок «Юный спасатель» и открыто Приключение 2 («Собери энергоумный дом»)!");
        this.closeAllModals();
        this.scrollToAdventures();
    }

    // ==========================================================================
    // GAME 2: СОБЕРИ ЭНЕРГОУМНЫЙ ДОМ (RENOVATION MECHANIC)
    // ==========================================================================
    initGame2DragDrop() {
        const draggables = document.querySelectorAll('.draggable-item');
        const repairSlots = document.querySelectorAll('.repair-slot');

        draggables.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const itemType = item.dataset.item;
                e.dataTransfer.setData('text/plain', itemType);
                this.highlightGuideSlot(itemType);
                if (window.soundEngine) window.soundEngine.playSfx('hover');
            });

            item.addEventListener('dragend', () => {
                this.clearGuideSlots();
            });

            // Tap-to-select for mobile & mouse
            item.addEventListener('click', () => {
                if (item.classList.contains('placed')) return;
                draggables.forEach(i => i.style.outline = 'none');
                item.style.outline = '3px solid #5AB869';
                this.selectedTrayItem = item.dataset.item;
                this.highlightGuideSlot(this.selectedTrayItem);
                if (window.soundEngine) window.soundEngine.playSfx('click');

                const bubble = document.getElementById('game2-companion-bubble');
                if (bubble) bubble.textContent = 'Теперь нажми на подсвеченную часть домика, чтобы установить её!';
            });
        });

        repairSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('slot-hover-target');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('slot-hover-target');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('slot-hover-target');
                this.clearGuideSlots();
                const itemType = e.dataTransfer.getData('text/plain');
                this.handleGame2Placement(itemType, slot);
            });

            // Tap slot
            slot.addEventListener('click', () => {
                if (this.selectedTrayItem) {
                    this.clearGuideSlots();
                    this.handleGame2Placement(this.selectedTrayItem, slot);
                }
            });
        });

        // Click outside tray to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.draggable-item') && !e.target.closest('.repair-slot')) {
                if (this.selectedTrayItem) {
                    this.selectedTrayItem = null;
                    draggables.forEach(i => i.style.outline = 'none');
                    this.clearGuideSlots();
                }
            }
        });
    }

    highlightGuideSlot(itemType) {
        this.clearGuideSlots();
        if (!itemType) return;
        const slot = document.querySelector(`.repair-slot[data-target="${itemType}"]`);
        if (slot && !slot.classList.contains('filled')) {
            slot.classList.add('slot-guide-hint');
        }
    }

    clearGuideSlots() {
        document.querySelectorAll('.repair-slot.slot-guide-hint').forEach(slot => {
            slot.classList.remove('slot-guide-hint');
        });
    }

    handleGame2Placement(itemType, slot) {
        this.clearGuideSlots();
        const expected = slot.dataset.target;
        if (itemType === expected) {
            if (this.game2PlacedItems.has(itemType)) return;

            this.game2PlacedItems.add(itemType);
            this.state.game2PlacedItems = Array.from(this.game2PlacedItems);

            slot.classList.add('filled');

            // Render transparent PNG overlay seamlessly without borders
            this.renderInstalledSlot(slot, itemType);

            // Mark tray item placed
            const itemEl = document.querySelector(`.draggable-item[data-item="${itemType}"]`);
            if (itemEl) {
                itemEl.classList.add('placed');
                itemEl.style.outline = 'none';
            }

            if (window.soundEngine) {
                window.soundEngine.playSfx('correct');
                window.soundEngine.playSfx('crystal');
            }

            this.state.game2Points = Math.min(150, this.state.game2Points + 25);
            this.state.totalPoints = this.calculateTotalPoints();
            this.saveState();

            this.selectedTrayItem = null;

            const bubble = document.getElementById('game2-companion-bubble');
            const complimentPhrases = [
                "Отлично! Старая деталь заменена на современную и красивую!",
                "Здорово получилось! Чистая энергия уже работает!",
                "Красота! Домик становится сказочным и тёплым!",
                "Супер! Осталось совсем немного до полного восстановления!"
            ];
            if (bubble) bubble.textContent = complimentPhrases[Math.floor(Math.random() * complimentPhrases.length)];

            if (this.game2PlacedItems.size >= 6) {
                setTimeout(() => this.completeGame2(), 800);
            }
        } else {
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');
            const bubble = document.getElementById('game2-companion-bubble');
            if (bubble) bubble.textContent = 'Эта деталь предназначена для другого места! Посмотри внимательнее на домик!';
        }
    }

    renderInstalledSlot(slot, itemType) {
        const container = slot.querySelector('.slot-installed-content') || slot;
        if (itemType === 'windmill') {
            container.innerHTML = `
                <div class="installed-windmill-wrap">
                    <img class="windmill-tower-img" src="assets/games/game2/installed_windmill_tower.png" alt="Башня ветряка">
                    <img class="windmill-blades-img spin-blades" src="assets/games/game2/installed_windmill_blades.png" alt="Вращающиеся лопасти ветряка">
                </div>
            `;
        } else if (itemType === 'solar') {
            container.innerHTML = `
                <div class="installed-solar-wrap">
                    <img class="solar-panel-img" src="assets/games/game2/installed_solar.png" alt="Солнечные батареи">
                </div>
            `;
        } else {
            container.innerHTML = `
                <img class="installed-item-img" src="assets/games/game2/installed_${itemType}.png" alt="${itemType}">
            `;
        }
    }

    restoreGame2Slots() {
        this.game2PlacedItems.forEach(itemType => {
            const slot = document.querySelector(`.repair-slot[data-target="${itemType}"]`);
            if (slot) {
                slot.classList.add('filled');
                this.renderInstalledSlot(slot, itemType);
            }
            const itemEl = document.querySelector(`.draggable-item[data-item="${itemType}"]`);
            if (itemEl) itemEl.classList.add('placed');
        });

        if (this.game2PlacedItems.size >= 6) {
            const houseBg = document.getElementById('game2-house-bg');
            if (houseBg) houseBg.src = 'assets/games/game2/house_base.jpg';
        }
    }

    completeGame2() {
        if (window.soundEngine) {
            window.soundEngine.playSfx('badge');
            window.soundEngine.playSfx('unlock');
        }

        const houseBg = document.getElementById('game2-house-bg');
        if (houseBg) houseBg.src = 'assets/games/game2/house_base.jpg';

        if (!this.state.completedGames.includes(2)) {
            this.state.completedGames.push(2);
        }
        if (!this.state.unlockedGames.includes(3)) {
            this.state.unlockedGames.push(3);
        }
        if (!this.state.badges.includes('master')) {
            this.state.badges.push('master');
        }
        this.state.cityStage = Math.max(this.state.cityStage, 3);
        this.state.game2Points = 150;
        this.state.totalPoints = this.calculateTotalPoints();
        this.saveState();

        const successOverlay = document.getElementById('game2-success-overlay');
        if (successOverlay) successOverlay.style.display = 'flex';
    }

    // ==========================================================================
    // GAME 3: ПУТЕШЕСТВИЕ ПО ЭКОГРАДУ (15 QUESTIONS, 5 LOCATIONS, SHUFFLED OPTIONS)
    // ==========================================================================
    initGame3Mechanics() {
        document.querySelectorAll('.map-pin').forEach(pin => {
            const locId = pin.dataset.location;
            if (this.state.game3CompletedLocations.includes(locId)) {
                pin.classList.add('completed');
            }

            pin.addEventListener('click', () => {
                this.startLocationQuests(locId, pin);
            });
        });
    }

    startLocationQuests(locId, pinElement) {
        if (window.soundEngine) window.soundEngine.playSfx('click');
        this.game3ActiveLocId = locId;
        this.game3ActiveQuestionIdx = 0;

        this.renderGame3Quest(locId, pinElement);
    }

    renderGame3Quest(locId, pinElement) {
        const container = document.getElementById('game3-quest-area');
        if (!container) return;

        const locData = GAME3_DATA.find(l => l.id === locId);
        if (!locData) return;

        const qData = locData.questions[this.game3ActiveQuestionIdx];

        // MANDATORY SHUFFLE: Randomize positions of options so correct answer is NOT always first!
        const shuffledOptions = this.shuffle(qData.options);
        const letters = ['А', 'Б', 'В'];

        let optionsHtml = '';
        shuffledOptions.forEach((opt, idx) => {
            optionsHtml += `
                <button class="quest-option-btn" data-correct="${opt.correct}">
                    <span class="opt-letter">${letters[idx]}.</span> <span>${opt.text}</span>
                </button>
            `;
        });

        container.innerHTML = `
            <div class="quest-popup">
                <div class="quest-header-row">
                    <span class="quest-location-tag">${locData.name}</span>
                    <span class="quest-progress-tag">Вопрос ${this.game3ActiveQuestionIdx + 1} из 3</span>
                </div>
                <div class="quest-question">${qData.text}</div>
                <div class="quest-options-grid">${optionsHtml}</div>
                <div id="game3-feedback-area" style="display: none;"></div>
            </div>
        `;

        container.scrollIntoView({ behavior: 'smooth' });

        container.querySelectorAll('.quest-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleGame3Answer(btn, qData, locData, pinElement);
            });
        });
    }

    handleGame3Answer(btn, qData, locData, pinElement) {
        // System checks correctness by property data-correct, completely independent of position
        const isCorrect = btn.dataset.correct === 'true';
        const feedbackArea = document.getElementById('game3-feedback-area');
        const allBtns = document.querySelectorAll('.quest-option-btn');

        if (isCorrect) {
            btn.classList.add('correct');
            allBtns.forEach(b => b.disabled = true);

            if (window.soundEngine) {
                window.soundEngine.playSfx('correct');
                window.soundEngine.playSfx('crystal');
            }

            this.state.game3Points = Math.min(200, this.state.game3Points + 13);
            this.state.totalPoints = this.calculateTotalPoints();
            this.saveState();

            const isLastQuestion = (this.game3ActiveQuestionIdx === 2);
            const nextButtonLabel = isLastQuestion ? 'Завершить локацию!' : 'Следующий вопрос';

            if (feedbackArea) {
                feedbackArea.style.display = 'block';
                feedbackArea.innerHTML = `
                    <div class="quest-feedback-row">
                        <img src="assets/characters/luchik_happy.png" style="width: 60px; height: auto;" alt="Лучик">
                        <p class="quest-feedback-text">${qData.tip}</p>
                        <button class="btn-primary" id="game3-next-q-btn" style="padding: 8px 18px; font-size: 15px;">
                            ${nextButtonLabel}
                        </button>
                    </div>
                `;

                document.getElementById('game3-next-q-btn')?.addEventListener('click', () => {
                    if (isLastQuestion) {
                        this.completeGame3Location(locData.id, pinElement);
                    } else {
                        this.game3ActiveQuestionIdx++;
                        this.renderGame3Quest(locData.id, pinElement);
                    }
                });
            }
        } else {
            btn.classList.add('wrong');
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');

            if (feedbackArea) {
                feedbackArea.style.display = 'block';
                feedbackArea.innerHTML = `
                    <div class="quest-feedback-row" style="background: #FDF4F4; border-color: #F5C6CB;">
                        <img src="assets/characters/luchik_thinking.png" style="width: 60px; height: auto;" alt="Лучик">
                        <p class="quest-feedback-text">Подумай ещё раз, как поступить правильнее и сберечь природу!</p>
                        <button class="btn-secondary" id="game3-retry-btn" style="padding: 6px 14px; font-size: 14px;">
                            Попробовать снова
                        </button>
                    </div>
                `;

                document.getElementById('game3-retry-btn')?.addEventListener('click', () => {
                    feedbackArea.style.display = 'none';
                    allBtns.forEach(b => {
                        b.disabled = false;
                        b.classList.remove('wrong', 'correct');
                    });
                });
            }
        }
    }

    completeGame3Location(locId, pinElement) {
        if (!this.state.game3CompletedLocations.includes(locId)) {
            this.state.game3CompletedLocations.push(locId);
            this.state.game3Points = Math.min(200, this.state.game3Points + 1);
            this.state.totalPoints = this.calculateTotalPoints();
            this.saveState();
        }

        pinElement.classList.add('completed');

        const container = document.getElementById('game3-quest-area');
        if (container) {
            container.innerHTML = `
                <div class="quest-popup" style="background:#E8F8EA; border-color:#5AB869; text-align:center;">
                    <div style="font-family:'Grandstander'; font-size:24px; font-weight:900; color:#2E7D32;">
                        Локация пройдена!
                    </div>
                    <div style="font-size:15px; color:#44634B; margin-top:8px;">
                        Ты блестяще помог всем жителям на этой точке карты! Выбери следующий флажок на карте города!
                    </div>
                </div>
            `;
        }

        if (this.state.game3CompletedLocations.length >= 5) {
            setTimeout(() => this.completeGame3(), 1200);
        }
    }

    completeGame3() {
        if (window.soundEngine) {
            window.soundEngine.playSfx('badge');
            window.soundEngine.playSfx('complete');
        }

        if (!this.state.completedGames.includes(3)) {
            this.state.completedGames.push(3);
        }
        if (!this.state.badges.includes('guardian')) {
            this.state.badges.push('guardian');
        }
        this.state.cityStage = 4;
        this.state.game3Points = 200;
        this.state.totalPoints = 450;
        this.saveState();

        this.closeAllModals();
        this.openModal('modal-celebration');
    }

    calculateTotalPoints() {
        return Math.min(450, (this.state.game1Points || 0) + (this.state.game2Points || 0) + (this.state.game3Points || 0));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.ecogradApp = new EcogradApp();
});
