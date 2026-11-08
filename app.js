// ==========================================================================
// CELEBRATION CANVAS FIREWORKS ENGINE
// ==========================================================================
class FireworksEngine {
    constructor(canvasId = 'fireworks-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(x, y, count = 38) {
        if (!this.canvas) return;
        const colors = ['#FFD700', '#FF4081', '#00E676', '#00E5FF', '#FF9100', '#E040FB', '#FFFFFF', '#FFEE58'];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
            const speed = 3.6 + Math.random() * 6.0;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const isStar = Math.random() > 0.55;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.4,
                color,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.018,
                size: isStar ? 5 + Math.random() * 4 : 3 + Math.random() * 3,
                isStar,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.22
            });
        }
        if (!this.animId) {
            this.loop();
        }
    }

    launchFromElement(el) {
        if (!el) {
            this.launchRandom(3);
            return;
        }
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.burst(cx, cy, 42);
        setTimeout(() => this.burst(cx - 60, cy - 30, 24), 160);
        setTimeout(() => this.burst(cx + 60, cy - 25, 24), 300);
    }

    launchRandom(burstCount = 3) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let b = 0; b < burstCount; b++) {
            setTimeout(() => {
                const rx = w * 0.2 + Math.random() * (w * 0.6);
                const ry = h * 0.2 + Math.random() * (h * 0.45);
                this.burst(rx, ry, 38);
            }, b * 200);
        }
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12; // gentle gravity
            p.vx *= 0.98; // air resistance
            p.alpha -= p.decay;
            p.rotation += p.rotSpeed;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;

            if (p.isStar) {
                this.drawStar(0, 0, 5, p.size, p.size * 0.45);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animId = null;
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// ==========================================================================
// ЭКОГРАД: ХРАНИТЕЛИ ЭНЕРГИИ — PRODUCTION APPLICATION CORE (VANILLA JS)
// ==========================================================================

const GAME_STORAGE_KEY = 'ecograd_game_state_v7';

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
    "1": {
        "name": "Гостиная",
        "fixedImg": "assets/games/game1/livingroom_fixed_all.jpg",
        "problemImg": "assets/games/game1/livingroom_fixed_all.jpg",
        "successTitle": "ГОСТИНАЯ СПАСЕНА!",
        "successDesc": "Ты выключил лишний свет и телевизор. Теперь в гостиной сохраняется энергия.",
        "items": {
            "lamp1": {
                "name": "Лампа",
                "questions": [
                    {
                        "text": "Почему нужно выключать свет, когда выходишь из комнаты?",
                        "options": [
                            {
                                "text": "Чтобы экономить электричество",
                                "correct": true
                            },
                            {
                                "text": "Чтобы в комнате стало темно и страшно",
                                "correct": false
                            }
                        ],
                        "tip": "Правильно! Если свет горит зря, тратится драгоценная энергия. Выключай свет — береги планету!",
                        "audioKey": "g1_lamp1_q1",
                        "tipAudioKey": "g1_lamp1_q1_tip"
                    },
                    {
                        "text": "Что нужно сделать, если в комнате никого нет?",
                        "options": [
                            {
                                "text": "Выключить свет",
                                "correct": true
                            },
                            {
                                "text": "Оставить свет включённым",
                                "correct": false
                            }
                        ],
                        "tip": "Молодец! В пустой комнате свет гореть не должен!",
                        "audioKey": "g1_lamp1_q2",
                        "tipAudioKey": "g1_lamp1_q2_tip"
                    }
                ]
            },
            "tv1": {
                "name": "Телевизор",
                "questions": [
                    {
                        "text": "Что нужно сделать, если никто не смотрит телевизор?",
                        "options": [
                            {
                                "text": "Выключить телевизор",
                                "correct": true
                            },
                            {
                                "text": "Оставить его работать",
                                "correct": false
                            }
                        ],
                        "tip": "Отлично! Телевизор не должен работать в пустой комнате без зрителей!",
                        "audioKey": "g1_tv1_q1",
                        "tipAudioKey": "g1_tv1_q1_tip"
                    },
                    {
                        "text": "Почему не стоит оставлять телевизор включённым просто так?",
                        "options": [
                            {
                                "text": "Он зря расходует электричество",
                                "correct": true
                            },
                            {
                                "text": "Он сам заряжается от воздуха",
                                "correct": false
                            }
                        ],
                        "tip": "Верно! Работающий телевизор постоянно расходует электроэнергию!",
                        "audioKey": "g1_tv1_q2",
                        "tipAudioKey": "g1_tv1_q2_tip"
                    }
                ]
            }
        }
    },
    "2": {
        "name": "Кухня",
        "fixedImg": "assets/games/game1/kitchen_fixed_all.jpg",
        "problemImg": "assets/games/game1/kitchen_problem_all.jpg",
        "successTitle": "КУХНЯ СПАСЕНА!",
        "successDesc": "Холодильник закрыт, кран выключен. Кухня выглядит чистой, уютной и энергоэффективной!",
        "items": {
            "fridge2": {
                "name": "Холодильник",
                "questions": [
                    {
                        "text": "Почему нельзя надолго оставлять холодильник открытым?",
                        "options": [
                            {
                                "text": "Он теряет холод и расходует больше электричества",
                                "correct": true
                            },
                            {
                                "text": "Внутри начинают светиться продукты",
                                "correct": false
                            }
                        ],
                        "tip": "Точно! Тёплый воздух попадает внутрь, и мотору приходится тратить много энергии на охлаждение!",
                        "audioKey": "g1_fridge2_q1",
                        "tipAudioKey": "g1_fridge2_q1_tip"
                    },
                    {
                        "text": "Что нужно сделать после того, как достал продукты?",
                        "options": [
                            {
                                "text": "Закрыть дверцу холодильника",
                                "correct": true
                            },
                            {
                                "text": "Оставить дверцу открытой",
                                "correct": false
                            }
                        ],
                        "tip": "Правильно! Достал вкусное яблочко — сразу плотно закрой дверцу!",
                        "audioKey": "g1_fridge2_q2",
                        "tipAudioKey": "g1_fridge2_q2_tip"
                    }
                ]
            },
            "faucet2": {
                "name": "Кран",
                "questions": [
                    {
                        "text": "Почему нельзя оставлять воду включённой без необходимости?",
                        "options": [
                            {
                                "text": "Зря расходуется вода",
                                "correct": true
                            },
                            {
                                "text": "Вода становится невидимой",
                                "correct": false
                            }
                        ],
                        "tip": "Умница! Чистая пресная вода очень ценна, её нужно беречь!",
                        "audioKey": "g1_faucet2_q1",
                        "tipAudioKey": "g1_faucet2_q1_tip"
                    },
                    {
                        "text": "Что нужно сделать после мытья рук?",
                        "options": [
                            {
                                "text": "Закрыть кран",
                                "correct": true
                            },
                            {
                                "text": "Оставить воду течь",
                                "correct": false
                            }
                        ],
                        "tip": "Супер! Помыл ручки чисто — сразу плотно закрути кран!",
                        "audioKey": "g1_faucet2_q2",
                        "tipAudioKey": "g1_faucet2_q2_tip"
                    }
                ]
            }
        }
    },
    "3": {
        "name": "Спальня",
        "fixedImg": "assets/games/game1/bedroom_fixed_all.jpg",
        "problemImg": "assets/games/game1/bedroom_problem_all.jpg",
        "successTitle": "СПАЛЬНЯ СПАСЕНА!",
        "successDesc": "Окно закрыто после проветривания, свет выключен. Комната выглядит комфортной и уютной!",
        "items": {
            "window3": {
                "name": "Окно и батарея",
                "questions": [
                    {
                        "text": "Почему не стоит долго держать окно открытым, когда работает отопление?",
                        "options": [
                            {
                                "text": "Тепло уходит на улицу",
                                "correct": true
                            },
                            {
                                "text": "Радиатор начинает вырабатывать больше солнца",
                                "correct": false
                            }
                        ],
                        "tip": "Верно! Если окно долго открыто зимой, драгоценное тепло батарей вылетает на улицу!",
                        "audioKey": "g1_window3_q1",
                        "tipAudioKey": "g1_window3_q1_tip"
                    },
                    {
                        "text": "Что лучше сделать, если нужно проветрить комнату?",
                        "options": [
                            {
                                "text": "Проветрить ненадолго, а затем закрыть окно",
                                "correct": true
                            },
                            {
                                "text": "Оставить окно открытым надолго",
                                "correct": false
                            }
                        ],
                        "tip": "Отлично! Короткое проветривание освежает воздух и сохраняет тепло стен!",
                        "audioKey": "g1_window3_q2",
                        "tipAudioKey": "g1_window3_q2_tip"
                    }
                ]
            },
            "bedlamp3": {
                "name": "Свет в спальне",
                "questions": [
                    {
                        "text": "Что нужно сделать, уходя из спальни?",
                        "options": [
                            {
                                "text": "Выключить свет",
                                "correct": true
                            },
                            {
                                "text": "Оставить свет включённым",
                                "correct": false
                            }
                        ],
                        "tip": "Точно! Выходя из любой комнаты, не забывай выключать свет!",
                        "audioKey": "g1_bedlamp3_q1",
                        "tipAudioKey": "g1_bedlamp3_q1_tip"
                    },
                    {
                        "text": "Почему важно выключать свет в пустой комнате?",
                        "options": [
                            {
                                "text": "Чтобы не расходовать электричество зря",
                                "correct": true
                            },
                            {
                                "text": "Чтобы лампочка не скучала",
                                "correct": false
                            }
                        ],
                        "tip": "Ура! Выключенный вовремя свет бережёт энергию нашей планеты!",
                        "audioKey": "g1_bedlamp3_q2",
                        "tipAudioKey": "g1_bedlamp3_q2_tip"
                    }
                ]
            }
        }
    }
};

const GAME3_DATA = [
    {
        "id": "bunny",
        "name": "Солнечная поляна",
        "questions": [
            {
                "text": "На солнечной полянке днём очень светло. Зачем здесь нужны солнечные фонарики?",
                "options": [
                    {
                        "text": "Они накапливают энергию солнца днём, чтобы светить ночью",
                        "correct": true
                    },
                    {
                        "text": "Чтобы днём солнышку было веселее светить",
                        "correct": false
                    },
                    {
                        "text": "Чтобы пугать дневных бабочек",
                        "correct": false
                    }
                ],
                "tip": "Солнечные батареи улавливают чистый солнечный свет и бесплатно освещают дорожки ночью!",
                "audioKey": "g3_bunny_q1",
                "tipAudioKey": "g3_bunny_q1_tip"
            },
            {
                "text": "Зверята на полянке собрали ягоды и хотят помыть их. Как лучше поступить, чтобы сберечь воду?",
                "options": [
                    {
                        "text": "Помыть ягодки в мисочке с водой, а не под сильной струёй из шланга",
                        "correct": true
                    },
                    {
                        "text": "Включить воду на полную мощность на целый час",
                        "correct": false
                    },
                    {
                        "text": "Бросить ягоды в фонтан",
                        "correct": false
                    }
                ],
                "tip": "Мытьё ягод и овощей в миске сберегает десятки литров чистой воды!",
                "audioKey": "g3_bunny_q2",
                "tipAudioKey": "g3_bunny_q2_tip"
            },
            {
                "text": "Какое главное правило энергосбережения в ясный солнечный день?",
                "options": [
                    {
                        "text": "Использовать естественный свет солнца и выключать лампочки",
                        "correct": true
                    },
                    {
                        "text": "Включить все фонарики на поляне",
                        "correct": false
                    }
                ],
                "tip": "Солнечный свет дарит радость, тепло и бережёт электричество!",
                "audioKey": "g3_bunny_q3",
                "tipAudioKey": "g3_bunny_q3_tip"
            }
        ]
    },
    {
        "id": "park",
        "name": "Лесная тропинка",
        "questions": [
            {
                "text": "На каком транспорте лучше всего передвигаться по лесной тропинке, чтобы сохранить воздух чистым?",
                "options": [
                    {
                        "text": "На велосипеде, самокате или пешком",
                        "correct": true
                    },
                    {
                        "text": "На старом дымящем грузовике",
                        "correct": false
                    },
                    {
                        "text": "На бензиновом мопеде без глушителя",
                        "correct": false
                    }
                ],
                "tip": "Велосипеды и прогулки пешком не загрязняют природу, не расходуют энергоресурсы и делают нас здоровыми!",
                "audioKey": "g3_park_q1",
                "tipAudioKey": "g3_park_q1_tip"
            },
            {
                "text": "Зачем вдоль лесной тропинки высаживают молодые деревья и кустарники?",
                "options": [
                    {
                        "text": "Они вырабатывают чистый кислород и задерживают пыль",
                        "correct": true
                    },
                    {
                        "text": "Чтобы закрывать небо от птиц",
                        "correct": false
                    }
                ],
                "tip": "Деревья — это зелёные лёгкие нашей планеты!",
                "audioKey": "g3_park_q2",
                "tipAudioKey": "g3_park_q2_tip"
            },
            {
                "text": "Что нужно сделать с фантиком от конфеты на прогулке в лесу?",
                "options": [
                    {
                        "text": "Донести до урны или забрать домой в кармане",
                        "correct": true
                    },
                    {
                        "text": "Бросить под кустик на тропинке",
                        "correct": false
                    },
                    {
                        "text": "Закопать в мох",
                        "correct": false
                    }
                ],
                "tip": "Береги природу: мусор должен попадать только в урны и отправляться на переработку!",
                "audioKey": "g3_park_q3",
                "tipAudioKey": "g3_park_q3_tip"
            }
        ]
    },
    {
        "id": "fountain",
        "name": "Река Чистюля",
        "questions": [
            {
                "text": "Из реки Чистюли выведен кран для полива. Из него капает вода. Что должен сделать юный Хранитель?",
                "options": [
                    {
                        "text": "Плотно закрыть кран",
                        "correct": true
                    },
                    {
                        "text": "Открыть кран ещё сильнее",
                        "correct": false
                    },
                    {
                        "text": "Пройти мимо",
                        "correct": false
                    }
                ],
                "tip": "Каждая капелька чистой воды драгоценна для всех жителей планеты!",
                "audioKey": "g3_fountain_q1",
                "tipAudioKey": "g3_fountain_q1_tip"
            },
            {
                "text": "Как жители Экограда могут с пользой применить дождевую воду?",
                "options": [
                    {
                        "text": "Собирать в бочки для полива клумб и огородов",
                        "correct": true
                    },
                    {
                        "text": "Сразу выливать в канализацию",
                        "correct": false
                    }
                ],
                "tip": "Дождевая вода мягкая и очень полезна для полива цветов!",
                "audioKey": "g3_fountain_q2",
                "tipAudioKey": "g3_fountain_q2_tip"
            },
            {
                "text": "Почему нельзя мыть машины и велосипеды с мылом прямо в речке?",
                "options": [
                    {
                        "text": "Грязная пена отравляет воду, рыбок и речные растения",
                        "correct": true
                    },
                    {
                        "text": "Рыбкам очень нравится мыльная пена",
                        "correct": false
                    }
                ],
                "tip": "Грязная пена отравляет воду, рыбок и речные растения, а на очистку воды тратится много ресурсов!",
                "audioKey": "g3_fountain_q3",
                "tipAudioKey": "g3_fountain_q3_tip"
            }
        ]
    },
    {
        "id": "school",
        "name": "Энергодом",
        "questions": [
            {
                "text": "В умном Энергодоме наступил вечер, и жильцы ложатся спать. Что нужно сделать с техникой?",
                "options": [
                    {
                        "text": "Выключить технику из розеток",
                        "correct": true
                    },
                    {
                        "text": "Оставить все экраны включёнными до утра",
                        "correct": false
                    },
                    {
                        "text": "Включить громкую музыку на всю ночь",
                        "correct": false
                    }
                ],
                "tip": "Выключение приборов из сети сохраняет огромное количество энергии!",
                "audioKey": "g3_school_q1",
                "tipAudioKey": "g3_school_q1_tip"
            },
            {
                "text": "Какая бытовая техника в Энергодоме помогает беречь ресурсы семьи?",
                "options": [
                    {
                        "text": "С высоким классом энергоэффективности А+++",
                        "correct": true
                    },
                    {
                        "text": "Самая старая и сильно гудящая техника",
                        "correct": false
                    }
                ],
                "tip": "Современные приборы класса А+++ тратят минимум электричества!",
                "audioKey": "g3_school_q2",
                "tipAudioKey": "g3_school_q2_tip"
            },
            {
                "text": "Что помогает Энергодому сохранять тепло зимой без лишнего отопления?",
                "options": [
                    {
                        "text": "Качественные тёплые стеклопакеты и утеплённые стены",
                        "correct": true
                    },
                    {
                        "text": "Распахнутые настежь двери и окна",
                        "correct": false
                    }
                ],
                "tip": "Утеплённый дом держит тепло как термос и не требует лишнего обогрева!",
                "audioKey": "g3_school_q3",
                "tipAudioKey": "g3_school_q3_tip"
            }
        ]
    },
    {
        "id": "bear",
        "name": "Парк будущего",
        "questions": [
            {
                "text": "Какая энергия приводит в движение аттракционы и фонарики в Парке будущего?",
                "options": [
                    {
                        "text": "Чистая энергия ветра и солнечных лучей",
                        "correct": true
                    },
                    {
                        "text": "Дизельные генераторы с едким черным дымом",
                        "correct": false
                    },
                    {
                        "text": "Костры из сухих веток на площадках",
                        "correct": false
                    }
                ],
                "tip": "Ветер и солнце — бесконечные и экологически чистые источники энергии будущего!",
                "audioKey": "g3_bear_q1",
                "tipAudioKey": "g3_bear_q1_tip"
            },
            {
                "text": "Для полива газонов в Парке будущего установлены умные датчики влажности. Зачем они нужны?",
                "options": [
                    {
                        "text": "Чтобы включать полив только тогда, когда земля действительно высохла",
                        "correct": true
                    },
                    {
                        "text": "Чтобы поливать траву даже во время сильного дождя",
                        "correct": false
                    }
                ],
                "tip": "Умный полив не тратит лишнюю воду во время дождя и прохлады!",
                "audioKey": "g3_bear_q2",
                "tipAudioKey": "g3_bear_q2_tip"
            },
            {
                "text": "В какую урну в Парке будущего нужно выбросить пластиковую бутылочку от сока?",
                "options": [
                    {
                        "text": "В специальный контейнер для пластика, чтобы отправить на переработку",
                        "correct": true
                    },
                    {
                        "text": "Бросить на зелёную травку под скамейку",
                        "correct": false
                    }
                ],
                "tip": "Раздельный сбор мусора позволяет делать из старого пластика полезные новые вещи!",
                "audioKey": "g3_bear_q3",
                "tipAudioKey": "g3_bear_q3_tip"
            }
        ]
    }
];



// ==========================================================================
// PRE-RECORDED STUDIO CARTOON VOICE PLAYER
// Natural, expressive, human preschool voice without synthetic robot artifacts
// ==========================================================================
const VOICE_MAP = {
    "badge_unlocked": "assets/audio/voice/badge_unlocked.mp3",
    "cert_diploma": "assets/audio/voice/cert_diploma.mp3",
    "cert_title": "assets/audio/voice/cert_title.mp3",
    "final_celebration": "assets/audio/voice/final_celebration.mp3",
    "g1_bedlamp3_q1": "assets/audio/voice/g1_bedlamp3_q1.mp3",
    "g1_bedlamp3_q1_opt1": "assets/audio/voice/g1_bedlamp3_q1_opt1.mp3",
    "g1_bedlamp3_q1_opt2": "assets/audio/voice/g1_bedlamp3_q1_opt2.mp3",
    "g1_bedlamp3_q1_tip": "assets/audio/voice/g1_bedlamp3_q1_tip.mp3",
    "g1_bedlamp3_q2": "assets/audio/voice/g1_bedlamp3_q2.mp3",
    "g1_bedlamp3_q2_opt1": "assets/audio/voice/g1_bedlamp3_q2_opt1.mp3",
    "g1_bedlamp3_q2_opt2": "assets/audio/voice/g1_bedlamp3_q2_opt2.mp3",
    "g1_bedlamp3_q2_tip": "assets/audio/voice/g1_bedlamp3_q2_tip.mp3",
    "g1_faucet2_q1": "assets/audio/voice/g1_faucet2_q1.mp3",
    "g1_faucet2_q1_opt1": "assets/audio/voice/g1_faucet2_q1_opt1.mp3",
    "g1_faucet2_q1_opt2": "assets/audio/voice/g1_faucet2_q1_opt2.mp3",
    "g1_faucet2_q1_tip": "assets/audio/voice/g1_faucet2_q1_tip.mp3",
    "g1_faucet2_q2": "assets/audio/voice/g1_faucet2_q2.mp3",
    "g1_faucet2_q2_opt1": "assets/audio/voice/g1_faucet2_q2_opt1.mp3",
    "g1_faucet2_q2_opt2": "assets/audio/voice/g1_faucet2_q2_opt2.mp3",
    "g1_faucet2_q2_tip": "assets/audio/voice/g1_faucet2_q2_tip.mp3",
    "g1_fridge2_q1": "assets/audio/voice/g1_fridge2_q1.mp3",
    "g1_fridge2_q1_opt1": "assets/audio/voice/g1_fridge2_q1_opt1.mp3",
    "g1_fridge2_q1_opt2": "assets/audio/voice/g1_fridge2_q1_opt2.mp3",
    "g1_fridge2_q1_tip": "assets/audio/voice/g1_fridge2_q1_tip.mp3",
    "g1_fridge2_q2": "assets/audio/voice/g1_fridge2_q2.mp3",
    "g1_fridge2_q2_opt1": "assets/audio/voice/g1_fridge2_q2_opt1.mp3",
    "g1_fridge2_q2_opt2": "assets/audio/voice/g1_fridge2_q2_opt2.mp3",
    "g1_fridge2_q2_tip": "assets/audio/voice/g1_fridge2_q2_tip.mp3",
    "g1_intro": "assets/audio/voice/g1_intro.mp3",
    "g1_lamp1_q1": "assets/audio/voice/g1_lamp1_q1.mp3",
    "g1_lamp1_q1_opt1": "assets/audio/voice/g1_lamp1_q1_opt1.mp3",
    "g1_lamp1_q1_opt2": "assets/audio/voice/g1_lamp1_q1_opt2.mp3",
    "g1_lamp1_q1_tip": "assets/audio/voice/g1_lamp1_q1_tip.mp3",
    "g1_lamp1_q2": "assets/audio/voice/g1_lamp1_q2.mp3",
    "g1_lamp1_q2_opt1": "assets/audio/voice/g1_lamp1_q2_opt1.mp3",
    "g1_lamp1_q2_opt2": "assets/audio/voice/g1_lamp1_q2_opt2.mp3",
    "g1_lamp1_q2_tip": "assets/audio/voice/g1_lamp1_q2_tip.mp3",
    "g1_r1_greeting": "assets/audio/voice/g1_r1_greeting.mp3",
    "g1_r1_success": "assets/audio/voice/g1_r1_success.mp3",
    "g1_r2_greeting": "assets/audio/voice/g1_r2_greeting.mp3",
    "g1_r2_success": "assets/audio/voice/g1_r2_success.mp3",
    "g1_r3_greeting": "assets/audio/voice/g1_r3_greeting.mp3",
    "g1_r3_success": "assets/audio/voice/g1_r3_success.mp3",
    "g1_tv1_q1": "assets/audio/voice/g1_tv1_q1.mp3",
    "g1_tv1_q1_opt1": "assets/audio/voice/g1_tv1_q1_opt1.mp3",
    "g1_tv1_q1_opt2": "assets/audio/voice/g1_tv1_q1_opt2.mp3",
    "g1_tv1_q1_tip": "assets/audio/voice/g1_tv1_q1_tip.mp3",
    "g1_tv1_q2": "assets/audio/voice/g1_tv1_q2.mp3",
    "g1_tv1_q2_opt1": "assets/audio/voice/g1_tv1_q2_opt1.mp3",
    "g1_tv1_q2_opt2": "assets/audio/voice/g1_tv1_q2_opt2.mp3",
    "g1_tv1_q2_tip": "assets/audio/voice/g1_tv1_q2_tip.mp3",
    "g1_window3_q1": "assets/audio/voice/g1_window3_q1.mp3",
    "g1_window3_q1_opt1": "assets/audio/voice/g1_window3_q1_opt1.mp3",
    "g1_window3_q1_opt2": "assets/audio/voice/g1_window3_q1_opt2.mp3",
    "g1_window3_q1_tip": "assets/audio/voice/g1_window3_q1_tip.mp3",
    "g1_window3_q2": "assets/audio/voice/g1_window3_q2.mp3",
    "g1_window3_q2_opt1": "assets/audio/voice/g1_window3_q2_opt1.mp3",
    "g1_window3_q2_opt2": "assets/audio/voice/g1_window3_q2_opt2.mp3",
    "g1_window3_q2_tip": "assets/audio/voice/g1_window3_q2_tip.mp3",
    "g2_bulb": "assets/audio/voice/g2_bulb.mp3",
    "g2_door": "assets/audio/voice/g2_door.mp3",
    "g2_faucet": "assets/audio/voice/g2_faucet.mp3",
    "g2_intro": "assets/audio/voice/g2_intro.mp3",
    "g2_solar": "assets/audio/voice/g2_solar.mp3",
    "g2_success": "assets/audio/voice/g2_success.mp3",
    "g2_windmill": "assets/audio/voice/g2_windmill.mp3",
    "g2_window": "assets/audio/voice/g2_window.mp3",
    "g2_wrong": "assets/audio/voice/g2_wrong.mp3",
    "g3_bear_q1": "assets/audio/voice/g3_bear_q1.mp3",
    "g3_bear_q1_opt1": "assets/audio/voice/g3_bear_q1_opt1.mp3",
    "g3_bear_q1_opt2": "assets/audio/voice/g3_bear_q1_opt2.mp3",
    "g3_bear_q1_opt3": "assets/audio/voice/g3_bear_q1_opt3.mp3",
    "g3_bear_q1_tip": "assets/audio/voice/g3_bear_q1_tip.mp3",
    "g3_bear_q2": "assets/audio/voice/g3_bear_q2.mp3",
    "g3_bear_q2_opt1": "assets/audio/voice/g3_bear_q2_opt1.mp3",
    "g3_bear_q2_opt2": "assets/audio/voice/g3_bear_q2_opt2.mp3",
    "g3_bear_q2_tip": "assets/audio/voice/g3_bear_q2_tip.mp3",
    "g3_bear_q3": "assets/audio/voice/g3_bear_q3.mp3",
    "g3_bear_q3_opt1": "assets/audio/voice/g3_bear_q3_opt1.mp3",
    "g3_bear_q3_opt2": "assets/audio/voice/g3_bear_q3_opt2.mp3",
    "g3_bear_q3_tip": "assets/audio/voice/g3_bear_q3_tip.mp3",
    "g3_bunny_q1": "assets/audio/voice/g3_bunny_q1.mp3",
    "g3_bunny_q1_opt1": "assets/audio/voice/g3_bunny_q1_opt1.mp3",
    "g3_bunny_q1_opt2": "assets/audio/voice/g3_bunny_q1_opt2.mp3",
    "g3_bunny_q1_opt3": "assets/audio/voice/g3_bunny_q1_opt3.mp3",
    "g3_bunny_q1_tip": "assets/audio/voice/g3_bunny_q1_tip.mp3",
    "g3_bunny_q2": "assets/audio/voice/g3_bunny_q2.mp3",
    "g3_bunny_q2_opt1": "assets/audio/voice/g3_bunny_q2_opt1.mp3",
    "g3_bunny_q2_opt2": "assets/audio/voice/g3_bunny_q2_opt2.mp3",
    "g3_bunny_q2_opt3": "assets/audio/voice/g3_bunny_q2_opt3.mp3",
    "g3_bunny_q2_tip": "assets/audio/voice/g3_bunny_q2_tip.mp3",
    "g3_bunny_q3": "assets/audio/voice/g3_bunny_q3.mp3",
    "g3_bunny_q3_opt1": "assets/audio/voice/g3_bunny_q3_opt1.mp3",
    "g3_bunny_q3_opt2": "assets/audio/voice/g3_bunny_q3_opt2.mp3",
    "g3_bunny_q3_tip": "assets/audio/voice/g3_bunny_q3_tip.mp3",
    "g3_fountain_q1": "assets/audio/voice/g3_fountain_q1.mp3",
    "g3_fountain_q1_opt1": "assets/audio/voice/g3_fountain_q1_opt1.mp3",
    "g3_fountain_q1_opt2": "assets/audio/voice/g3_fountain_q1_opt2.mp3",
    "g3_fountain_q1_opt3": "assets/audio/voice/g3_fountain_q1_opt3.mp3",
    "g3_fountain_q1_tip": "assets/audio/voice/g3_fountain_q1_tip.mp3",
    "g3_fountain_q2": "assets/audio/voice/g3_fountain_q2.mp3",
    "g3_fountain_q2_opt1": "assets/audio/voice/g3_fountain_q2_opt1.mp3",
    "g3_fountain_q2_opt2": "assets/audio/voice/g3_fountain_q2_opt2.mp3",
    "g3_fountain_q2_tip": "assets/audio/voice/g3_fountain_q2_tip.mp3",
    "g3_fountain_q3": "assets/audio/voice/g3_fountain_q3.mp3",
    "g3_fountain_q3_opt1": "assets/audio/voice/g3_fountain_q3_opt1.mp3",
    "g3_fountain_q3_opt2": "assets/audio/voice/g3_fountain_q3_opt2.mp3",
    "g3_fountain_q3_tip": "assets/audio/voice/g3_fountain_q3_tip.mp3",
    "g3_intro": "assets/audio/voice/g3_intro.mp3",
    "g3_park_q1": "assets/audio/voice/g3_park_q1.mp3",
    "g3_park_q1_opt1": "assets/audio/voice/g3_park_q1_opt1.mp3",
    "g3_park_q1_opt2": "assets/audio/voice/g3_park_q1_opt2.mp3",
    "g3_park_q1_opt3": "assets/audio/voice/g3_park_q1_opt3.mp3",
    "g3_park_q1_tip": "assets/audio/voice/g3_park_q1_tip.mp3",
    "g3_park_q2": "assets/audio/voice/g3_park_q2.mp3",
    "g3_park_q2_opt1": "assets/audio/voice/g3_park_q2_opt1.mp3",
    "g3_park_q2_opt2": "assets/audio/voice/g3_park_q2_opt2.mp3",
    "g3_park_q2_tip": "assets/audio/voice/g3_park_q2_tip.mp3",
    "g3_park_q3": "assets/audio/voice/g3_park_q3.mp3",
    "g3_park_q3_opt1": "assets/audio/voice/g3_park_q3_opt1.mp3",
    "g3_park_q3_opt2": "assets/audio/voice/g3_park_q3_opt2.mp3",
    "g3_park_q3_opt3": "assets/audio/voice/g3_park_q3_opt3.mp3",
    "g3_park_q3_tip": "assets/audio/voice/g3_park_q3_tip.mp3",
    "g3_school_q1": "assets/audio/voice/g3_school_q1.mp3",
    "g3_school_q1_opt1": "assets/audio/voice/g3_school_q1_opt1.mp3",
    "g3_school_q1_opt2": "assets/audio/voice/g3_school_q1_opt2.mp3",
    "g3_school_q1_opt3": "assets/audio/voice/g3_school_q1_opt3.mp3",
    "g3_school_q1_tip": "assets/audio/voice/g3_school_q1_tip.mp3",
    "g3_school_q2": "assets/audio/voice/g3_school_q2.mp3",
    "g3_school_q2_opt1": "assets/audio/voice/g3_school_q2_opt1.mp3",
    "g3_school_q2_opt2": "assets/audio/voice/g3_school_q2_opt2.mp3",
    "g3_school_q2_tip": "assets/audio/voice/g3_school_q2_tip.mp3",
    "g3_school_q3": "assets/audio/voice/g3_school_q3.mp3",
    "g3_school_q3_opt1": "assets/audio/voice/g3_school_q3_opt1.mp3",
    "g3_school_q3_opt2": "assets/audio/voice/g3_school_q3_opt2.mp3",
    "g3_school_q3_tip": "assets/audio/voice/g3_school_q3_tip.mp3",
    "hero_kicker": "assets/audio/voice/hero_kicker.mp3",
    "hero_luchik": "assets/audio/voice/hero_luchik.mp3",
    "hero_phrase_1": "assets/audio/voice/hero_phrase_1.mp3",
    "hero_phrase_2": "assets/audio/voice/hero_phrase_2.mp3",
    "hero_phrase_3": "assets/audio/voice/hero_phrase_3.mp3",
    "hero_phrase_4": "assets/audio/voice/hero_phrase_4.mp3",
    "hero_phrase_5": "assets/audio/voice/hero_phrase_5.mp3",
    "hero_phrase_6": "assets/audio/voice/hero_phrase_6.mp3",
    "hero_phrase_7": "assets/audio/voice/hero_phrase_7.mp3",
    "hero_sub": "assets/audio/voice/hero_sub.mp3",
    "hero_welcome": "assets/audio/voice/hero_welcome.mp3",
    "tut_intro": "assets/audio/voice/tut_intro.mp3",
    "wrong_retry": "assets/audio/voice/wrong_retry.mp3",
    "card_game1_desc": "assets/audio/voice/card_game1_desc.mp3",
"card_game2_desc": "assets/audio/voice/card_game2_desc.mp3",
"card_game3_desc": "assets/audio/voice/card_game3_desc.mp3"
};

class VoicePlayer {
    constructor() {
        this.currentAudio = null;
        this.currentBtn = null;
    }

    play(audioKeyOrUrl, fallbackText = '', btnElement = null) {
        this.stop();

        let audioUrl = VOICE_MAP[audioKeyOrUrl] || audioKeyOrUrl;
        if (!audioUrl || !audioUrl.endsWith('.mp3')) {
            if (typeof audioKeyOrUrl === 'string' && /^[a-zA-Z0-9_-]+$/.test(audioKeyOrUrl)) {
                audioUrl = `assets/audio/voice/${audioKeyOrUrl}.mp3`;
            } else {
                audioUrl = VOICE_MAP[audioKeyOrUrl] || null;
            }
        }

        if (btnElement) {
            this.currentBtn = btnElement;
            btnElement.classList.add('speaking');
        }

        if (audioUrl) {
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            audio.play().then(() => {
                // Pre-recorded cartoon voice playing smoothly
            }).catch(() => {
                this.speakFallback(fallbackText, btnElement);
            });

            audio.onended = () => {
                this.stop();
            };
            audio.onerror = () => {
                this.speakFallback(fallbackText, btnElement);
            };
        } else if (fallbackText) {
            this.speakFallback(fallbackText, btnElement);
        }
    }

    stop() {
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {}
            this.currentAudio = null;
        }
        if (this.currentBtn) {
            this.currentBtn.classList.remove('speaking');
            this.currentBtn = null;
        }
        document.querySelectorAll('.speak-btn.speaking').forEach(b => b.classList.remove('speaking'));
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
    }

    speakFallback(text, btnElement) {
        if (!('speechSynthesis' in window) || !text) {
            this.stop();
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const utterance = new SpeechSynthesisUtterance(clean);
            const voices = window.speechSynthesis.getVoices();
            const ruVoice = voices.find(v => /^ru(-|_)/i.test(v.lang) && /female|milena|tatyana|irina|yadviga|child|google/i.test(v.name)) ||
                            voices.find(v => /^ru(-|_)/i.test(v.lang));
            if (ruVoice) utterance.voice = ruVoice;
            utterance.lang = 'ru-RU';
            utterance.pitch = 1.08;
            utterance.rate = 0.98;

            utterance.onend = () => this.stop();
            utterance.onerror = () => this.stop();

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            this.stop();
        }
    }
}

class EcogradApp {
    constructor() {
        this.voicePlayer = new VoicePlayer();
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
        this.state = { ...defaultState };
        this.saveState();
        if (window.soundEngine) window.soundEngine.playSfx('click');
        location.reload();
    }

    init() {
        // Automatically assign precise audioKey to all question options
        for (const room of Object.values(GAME1_DATA)) {
            for (const item of Object.values(room.items)) {
                item.questions.forEach(q => {
                    q.options.forEach((opt, idx) => {
                        if (!opt.audioKey) opt.audioKey = `${q.audioKey}_opt${idx + 1}`;
                    });
                });
            }
        }
        GAME3_DATA.forEach(zone => {
            zone.questions.forEach(q => {
                q.options.forEach((opt, idx) => {
                    if (!opt.audioKey) opt.audioKey = `${q.audioKey}_opt${idx + 1}`;
                });
            });
        });

        const g1q = document.getElementById('game1-question-overlay');
        if (g1q) g1q.style.display = 'none';
        const g1s = document.getElementById('game1-room-success-overlay');
        if (g1s) g1s.style.display = 'none';
        const g2s = document.getElementById('game2-success-overlay');
        if (g2s) g2s.style.display = 'none';

        this.bindEvents();
        this.updateUI();
        this.initCharacterInteractions();
        this.restoreGame2Slots();
        this.initStaticSpeechControls();
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
            { text: "Привет! Я лисёнок Лучик. Давай спасать наш Экоград!", key: "hero_luchik" },
            { text: "Капля за каплей утекает река — закрывай краны!", key: "hero_phrase_1" },
            { text: "Уходя из комнаты — всегда гаси свет!", key: "hero_phrase_2" },
            { text: "Береги тепло в доме — не открывай окна на весь день зимой!", key: "hero_phrase_3" },
            { text: "Ты отлично справляешься! Вперёд к приключениям!", key: "hero_phrase_4" },
            { text: "Привет, друг! Давай вместе наведём порядок в комнатах и спасём энергию!", key: "hero_phrase_5" },
            { text: "Каждый выключенный свет делает наш Экоград ещё зеленее и ярче!", key: "hero_phrase_6" },
            { text: "Ты настоящий супергерой природы! Жми на кнопку приключений!", key: "hero_phrase_7" }
        ];

        let pIdx = 0;
        if (heroFox) {
            heroFox.addEventListener('click', (e) => {
                // If user clicks speaker button inside speech bubble, don't cycle
                if (e.target && e.target.closest && e.target.closest('.speak-btn')) return;

                if (window.soundEngine) window.soundEngine.playSfx('click');
                const pObj = phrases[pIdx];
                pIdx = (pIdx + 1) % phrases.length;
                if (speechBubble) {
                    speechBubble.innerHTML = `<span class="speech-bubble-text">${pObj.text}</span>`;
                    this.addSpeechButton(speechBubble, pObj.text, 'bubble-speak-btn', pObj.key);
                    speechBubble.style.display = 'block';
                    speechBubble.animate([
                        { transform: 'scale(0.85) translateY(10px)', opacity: 0 },
                        { transform: 'scale(1) translateY(0)', opacity: 1 }
                    ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });

                    // PLAY VOICE DIRECTLY ON FOX TAP!
                    const speakBtn = speechBubble.querySelector('.speak-btn');
                    this.voicePlayer.play(pObj.key, pObj.text, speakBtn);
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
                const isTutorial = Boolean(btn.closest('#modal-tutorial'));
                this.closeAllModals();
                if (isTutorial) {
                    this.scrollToAdventures();
                }
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const isTutorial = (overlay.id === 'modal-tutorial');
                    this.closeAllModals();
                    if (isTutorial) {
                        this.scrollToAdventures();
                    }
                }
            });
        });

        // Certificate Name
        document.getElementById('child-name-input')?.addEventListener('input', (e) => {
            this.state.playerName = e.target.value.trim() || 'Юный Хранитель';
            const certName = document.getElementById('cert-player-name');
            if (certName) certName.textContent = this.state.playerName;
            this.saveState();
        });

        // Universal Return to Ecograd Buttons across all modals & popups
        document.querySelectorAll('.btn-return-ecograd, #return-ecograd-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.soundEngine) window.soundEngine.playSfx('click');
                this.closeAllModals();
                this.scrollToAdventures();
            });
        });

        // Game 2 -> Game 3 Transition Button
        document.getElementById('game2-to-game3-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.soundEngine) window.soundEngine.playSfx('click');
            this.closeAllModals();
            this.openGame(3);
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
            this.scrollToAdventures();
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
        if (this.voicePlayer) this.voicePlayer.stop();
        const g1q = document.getElementById('game1-question-overlay');
        if (g1q) g1q.style.display = 'none';
        const g1s = document.getElementById('game1-room-success-overlay');
        if (g1s) g1s.style.display = 'none';
        const g2s = document.getElementById('game2-success-overlay');
        if (g2s) g2s.style.display = 'none';
    }

    openGame(gameNum) {
        if (!this.state.unlockedGames.includes(gameNum)) {
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');
            const card = document.querySelector(`.adventure-card[data-game="${gameNum}"]`);
            if (card) {
                card.animate([
                    { transform: 'translateX(-6px)' },
                    { transform: 'translateX(6px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 250 });
            }
            return;
        }

        if (gameNum === 1) {
            this.state.game1SolvedItems = [];
            this.saveState();
            const qOverlay = document.getElementById('game1-question-overlay');
            if (qOverlay) qOverlay.style.display = 'none';
            const sOverlay = document.getElementById('game1-room-success-overlay');
            if (sOverlay) sOverlay.style.display = 'none';
            this.openModal('modal-game1');
            this.switchGame1Room(1);
        } else if (gameNum === 2) {
            this.game2PlacedItems.clear();
            this.state.game2PlacedItems = [];
            this.saveState();
            this.restoreGame2Slots();
            const sOverlay = document.getElementById('game2-success-overlay');
            if (sOverlay) sOverlay.style.display = 'none';
            this.openModal('modal-game2');
        } else if (gameNum === 3) {
            this.state.game3CompletedLocations = [];
            this.saveState();
            document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('completed'));
            const questArea = document.getElementById('game3-quest-area');
            if (questArea) questArea.innerHTML = '';
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
            1: 'Гостиная: найди, где зря расходуется электроэнергия!',
            2: 'Кухня: найди, где зря расходуется вода и электроэнергия.',
            3: 'Спальня: найди, где уходит тепло и горит лишний свет!'
        };
        const roomAudioKeys = {
            1: 'g1_intro',
            2: 'g1_r2_greeting',
            3: 'g1_r3_greeting'
        };
        const bubble = document.getElementById('game1-companion-bubble');
        if (bubble) {
            bubble.textContent = greetings[roomNum] || '';
            this.addSpeechButton(bubble, bubble.textContent, '', roomAudioKeys[roomNum] || '');
        }
    }

    startGame1ItemQuestions(roomNum, itemKey) {
        if (window.soundEngine) window.soundEngine.playSfx('click');
        this.game1ActiveItemKey = itemKey;
        this.game1ActiveQuestionIdx = 0;

        const overlay = document.getElementById('game1-question-overlay');
        const feedbackBox = document.getElementById('game1-q-feedback');
        const feedbackMsg = document.getElementById('game1-q-msg');
        if (feedbackBox) feedbackBox.style.display = 'none';
        if (feedbackMsg) feedbackMsg.innerHTML = '';
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

        const feedbackMsg = document.getElementById('game1-q-msg');
        if (tagEl) tagEl.textContent = itemData.name;
        if (counterEl) counterEl.textContent = `Вопрос ${this.game1ActiveQuestionIdx + 1} из 2`;
        if (textEl) { textEl.textContent = qData.text; this.addSpeechButton(textEl, qData.text, '', qData.audioKey); }
        if (feedbackBox) feedbackBox.style.display = 'none';
        if (feedbackMsg) feedbackMsg.innerHTML = '';

        // STRICT: Next button is hidden until an option is selected!
        this.game1QuestionAnswered = false;
        const nextBtn = document.getElementById('game1-q-next-btn');
        const actionsSticky = document.getElementById('game1-actions-sticky');
        if (nextBtn) {
            nextBtn.style.display = 'none';
            nextBtn.disabled = true;
        }
        if (actionsSticky) {
            actionsSticky.style.display = 'none';
        }

        if (optionsList) {
            optionsList.innerHTML = '';
            // MANDATORY SHUFFLE: Randomize options order so correct answer is not always first
            const shuffledOptions = this.shuffle(qData.options);
            shuffledOptions.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'question-option-btn';
                btn.innerHTML = `<span class="opt-letter">${idx + 1}.</span> <span class="option-copy">${opt.text}</span>`;
                this.addSpeechButton(btn, opt.text, 'speak-option-btn', opt.audioKey || '');
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
        const actionsSticky = document.getElementById('game1-actions-sticky');
        const allOptionBtns = document.querySelectorAll('.question-option-btn');

        if (option.correct) {
            buttonEl.classList.add('correct');
            this.game1QuestionAnswered = true;
            if (window.fireworksEngine) {
                window.fireworksEngine.launchFromElement(buttonEl);
            }
            this.celebrateBurst(document.querySelector('#game1-question-overlay .question-dialog-card'));
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
            if (feedbackMsg) { feedbackMsg.textContent = qData.tip; this.addSpeechButton(feedbackMsg, qData.tip, '', qData.tipAudioKey); }

            // Reveal action button only after correct choice
            if (actionsSticky) actionsSticky.style.display = 'block';
            if (nextBtn) {
                nextBtn.textContent = (this.game1ActiveQuestionIdx === 0) ? 'Перейти ко 2 вопросу' : 'Завершить';
                nextBtn.style.display = 'block';
                nextBtn.disabled = false;
            }
        } else {
            buttonEl.classList.add('wrong');
            this.game1QuestionAnswered = false;
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');

            if (feedbackBox) feedbackBox.style.display = 'flex';
            if (feedbackFox) feedbackFox.src = 'assets/characters/luchik_thinking.png';
            if (feedbackMsg) { feedbackMsg.textContent = 'Подумай ещё раз, как поступить правильнее!'; this.addSpeechButton(feedbackMsg, feedbackMsg.textContent, '', 'wrong_retry'); }

            if (actionsSticky) actionsSticky.style.display = 'block';
            if (nextBtn) {
                nextBtn.textContent = 'Попробовать снова';
                nextBtn.style.display = 'block';
                nextBtn.disabled = false;
            }
        }
    }

    handleGame1NextQuestionClick() {
        const nextBtn = document.getElementById('game1-q-next-btn');
        const actionsSticky = document.getElementById('game1-actions-sticky');
        if (!nextBtn) return;

        if (nextBtn.textContent === 'Попробовать снова') {
            const feedbackBox = document.getElementById('game1-q-feedback');
            if (feedbackBox) feedbackBox.style.display = 'none';
            document.querySelectorAll('.question-option-btn').forEach(b => {
                b.disabled = false;
                b.classList.remove('wrong', 'correct');
            });
            nextBtn.style.display = 'none';
            nextBtn.disabled = true;
            if (actionsSticky) actionsSticky.style.display = 'none';
            this.game1QuestionAnswered = false;
            return;
        }

        // STRICT REQUIREMENT: Child CANNOT advance or skip without choosing the correct answer!
        if (!this.game1QuestionAnswered) {
            return;
        }

        nextBtn.disabled = true;
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
            // Play joyful room completion speech!
            if (descEl) this.addSpeechButton(descEl, roomData.successDesc, '', 'g1_r' + roomNum + '_success');

            if (window.fireworksEngine) {
                window.fireworksEngine.launchRandom(4);
            }

            if (btnText) {
                if (roomNum === 1) {
                    btnText.textContent = 'Перейти в Комнату 2 (Кухня)';
                } else if (roomNum === 2) {
                    btnText.textContent = 'Перейти в Комнату 3 (Спальня)';
                } else {
                    btnText.textContent = 'Завершить испытание!';
                }
            }

            const g2Desc = document.querySelector('#game2-success-overlay .room-success-desc');
        if (g2Desc) this.addSpeechButton(g2Desc, g2Desc.textContent, '', 'g2_success');
        if (successOverlay) successOverlay.style.display = 'flex';
        }, 600);
    }

    handleGame1RoomSuccessNext() {
        const successOverlay = document.getElementById('game1-room-success-overlay');
        if (successOverlay) successOverlay.style.display = 'none';

        // STRICT SEQUENTIAL ADVANCEMENT: NEVER SKIP ROOMS!
        if (this.game1CurrentRoom === 1) {
            this.switchGame1Room(2);
        } else if (this.game1CurrentRoom === 2) {
            this.switchGame1Room(3);
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

        // No system alert dialog
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
                if (bubble) { bubble.textContent = 'Теперь нажми на подсвеченную часть домика, чтобы установить её!'; this.addSpeechButton(bubble, bubble.textContent); }
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
            this.celebrateBurst(document.getElementById('house-canvas-area'));

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
            const itemVoices = {
                door: { key: 'g2_door', text: 'Здорово! Новая утеплённая дверь защитит от сквозняков и сбережёт тепло!' },
                window: { key: 'g2_window', text: 'Прекрасно! Тёплое окно со стеклопакетом сохранит уют в комнатах!' },
                bulb: { key: 'g2_bulb', text: 'Отлично! LED-лампочка светит ярко и тратит минимум тока!' },
                solar: { key: 'g2_solar', text: 'Ура! Солнечная батарея на крыше ловит лучи и дарит чистый свет!' },
                faucet: { key: 'g2_faucet', text: 'Супер! Экономный кран на дождевой бочке поможет поливать цветы!' },
                windmill: { key: 'g2_windmill', text: 'Замечательно! Эко-ветряк вращается и вырабатывает чистую энергию!' }
            };
            const vInfo = itemVoices[itemType];
            if (bubble && vInfo) {
                bubble.textContent = vInfo.text;
                this.addSpeechButton(bubble, vInfo.text, '', vInfo.key);
                // Voice feedback on speaker button tap only
            }

            if (window.fireworksEngine) {
                window.fireworksEngine.launchFromElement(slot);
            }
            if (this.game2PlacedItems.size >= 6) {
                setTimeout(() => this.completeGame2(), 800);
            }
        } else {
            if (window.soundEngine) window.soundEngine.playSfx('incorrect');
            const bubble = document.getElementById('game2-companion-bubble');
            if (bubble) {
                bubble.textContent = 'Эта деталь предназначена для другого места! Посмотри внимательнее на домик!';
                this.addSpeechButton(bubble, bubble.textContent, '', 'wrong_retry');
            }
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

        if (window.fireworksEngine) {
            window.fireworksEngine.launchRandom(5);
        }
        const successOverlay = document.getElementById('game2-success-overlay');
        const g2Desc = document.querySelector('#game2-success-overlay .room-success-desc');
        if (g2Desc) this.addSpeechButton(g2Desc, g2Desc.textContent, '', 'g2_success');
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
                <button class="quest-option-btn" data-correct="${opt.correct}" data-audio-key="${opt.audioKey || ''}">
                    <span class="opt-letter">${letters[idx]}.</span> <span class="option-copy">${opt.text}</span><span class="speak-btn speak-option-btn" role="button" aria-label="Прослушать ответ" tabindex="0"><svg class="speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></span>
                </button>
            `;
        });

        container.innerHTML = `
            <div class="quest-popup">
                <div class="quest-header-row">
                    <span class="quest-location-tag">${locData.name}</span>
                    <span class="quest-progress-tag">Вопрос ${this.game3ActiveQuestionIdx + 1} из 3</span>
                </div>
                <div class="quest-question"><span>${qData.text}</span><button type="button" class="speak-btn" aria-label="Прослушать вопрос" title="Послушать"><svg class="speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button></div>
                <div class="quest-options-grid">${optionsHtml}</div>
                <div id="game3-feedback-area" style="display: none;"></div>
            </div>
        `;

        container.scrollIntoView({ behavior: 'smooth' });

        const questQuestion = container.querySelector('.quest-question');
        const qSpeaker = questQuestion?.querySelector('.speak-btn');
        qSpeaker?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.voicePlayer.play(qData.audioKey, qData.text, qSpeaker);
        });
        container.querySelectorAll('.quest-option-btn').forEach(btn => {
            const copy = btn.querySelector('.option-copy');
            const speaker = btn.querySelector('.speak-btn');
            const aKey = btn.dataset.audioKey;
            speaker?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play(aKey || copy?.textContent, copy?.textContent || '', speaker);
            });
            speaker?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.voicePlayer.play(aKey || copy?.textContent, copy?.textContent || '', speaker);
                }
            });
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
            this.celebrateBurst(document.querySelector('#game3-quest-area .quest-popup'));
            allBtns.forEach(b => b.disabled = true);

            if (window.soundEngine) {
                window.soundEngine.playSfx('correct');
                window.soundEngine.playSfx('crystal');
            }

            this.state.game3Points = Math.min(200, this.state.game3Points + 13);
            this.state.totalPoints = this.calculateTotalPoints();
            this.saveState();

            if (window.fireworksEngine) {
                window.fireworksEngine.launchFromElement(btn);
            }

            // STRICT EXPLICIT LABELS: Вопрос 1 -> Вопрос 2 -> Вопрос 3 -> Завершить!
            let nextButtonLabel = 'Следующий вопрос';
            if (this.game3ActiveQuestionIdx === 0) {
                nextButtonLabel = 'Перейти ко 2 вопросу';
            } else if (this.game3ActiveQuestionIdx === 1) {
                nextButtonLabel = 'Перейти к 3 вопросу';
            } else {
                nextButtonLabel = 'Завершить локацию!';
            }

            if (feedbackArea) {
                feedbackArea.style.display = 'block';
                feedbackArea.innerHTML = `
                    <div class="quest-feedback-row">
                        <img src="assets/characters/luchik_happy.png" style="width: 60px; height: auto;" alt="Лучик">
                        <p class="quest-feedback-text"><span>${qData.tip}</span><button type="button" class="speak-btn" aria-label="Прослушать объяснение" title="Послушать"><svg class="speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button></p>
                        <button class="btn-primary" id="game3-next-q-btn" style="padding: 8px 18px; font-size: 15px;">
                            ${nextButtonLabel}
                        </button>
                    </div>
                `;

                const tipSpeaker = feedbackArea.querySelector('.speak-btn');
                tipSpeaker?.addEventListener('click', () => this.voicePlayer.play(qData.tipAudioKey, qData.tip, tipSpeaker));
                // Auto play cheerful cartoon voice explanation!
                // Voice explanation on speaker button tap only
                setTimeout(() => {
                    feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 40);
                const nextBtn = document.getElementById('game3-next-q-btn');
                nextBtn?.addEventListener('click', () => {
                    nextBtn.disabled = true; // Prevent any double-click skips
                    if (this.game3ActiveQuestionIdx === 0) {
                        this.game3ActiveQuestionIdx = 1;
                        this.renderGame3Quest(locData.id, pinElement);
                    } else if (this.game3ActiveQuestionIdx === 1) {
                        this.game3ActiveQuestionIdx = 2;
                        this.renderGame3Quest(locData.id, pinElement);
                    } else {
                        this.completeGame3Location(locData.id, pinElement);
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
                        <p class="quest-feedback-text"><span>Подумай ещё раз, как поступить правильнее и сберечь природу!</span><button type="button" class="speak-btn" id="game3-retry-speak-btn" aria-label="Прослушать подсказку" title="Послушать"><svg class="speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button></p>
                        <button class="btn-secondary" id="game3-retry-btn" style="padding: 6px 14px; font-size: 14px;">
                            Попробовать снова
                        </button>
                    </div>
                `;

                const retrySpeaker = document.getElementById('game3-retry-speak-btn');
                retrySpeaker?.addEventListener('click', () => {
                    this.voicePlayer.play('wrong_retry', 'Подумай ещё раз, как поступить правильнее и сберечь природу!', retrySpeaker);
                });
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

        if (window.fireworksEngine) {
            window.fireworksEngine.launchRandom(4);
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

    initStaticSpeechControls() {
        // Hero texts with studio cartoon audio clips
        const kicker = document.querySelector('.hero-kicker span');
        const heroBtn = document.querySelector('.hero-speak-btn');
        if (kicker && heroBtn) {
            heroBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play('hero_kicker', kicker.textContent, heroBtn);
            });
        }
        const sub = document.querySelector('.hero-subheading span');
        const subBtn = document.querySelector('.hero-sub-speak-btn');
        if (sub && subBtn) {
            subBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play('hero_sub', sub.textContent, subBtn);
            });
        }
        const bubble = document.querySelector('.speech-bubble-text');
        const bubbleBtn = document.querySelector('.bubble-speak-btn');
        if (bubble && bubbleBtn) {
            bubbleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play('hero_welcome', bubble.textContent, bubbleBtn);
            });
        }

        // Instructions and companion speech with dedicated audio clips
        const g1Companion = document.getElementById('game1-companion-bubble');
        if (g1Companion) {
            this.addSpeechButton(g1Companion, g1Companion.textContent, '', 'g1_intro');
        }

        const g2Companion = document.getElementById('game2-companion-bubble');
        if (g2Companion) {
            this.addSpeechButton(g2Companion, g2Companion.textContent, '', 'g2_intro');
        }

        const g3Instruction = document.querySelector('#modal-game3 .game-instruction-text');
        if (g3Instruction) {
            this.addSpeechButton(g3Instruction, g3Instruction.textContent, '', 'g3_intro');
        }

        const certBtn = document.querySelector('.cert-speak-btn');
        if (certBtn) {
            certBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play('cert_title', 'Ура! Ты спас Экоград! Ты настоящий Главный Хранитель энергии!', certBtn);
            });
        }

        const certDiplomaBtn = document.querySelector('.cert-diploma-speak-btn');
        if (certDiplomaBtn) {
            certDiplomaBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.voicePlayer.play('cert_diploma', 'Почётная грамота волшебного города Экоград. Награждается Главный Хранитель энергии за спасение природных ресурсов!', certDiplomaBtn);
            });
        }

        // Озвучка описаний трёх карточек приключений
document.querySelectorAll('.card-desc').forEach(el => {
    const text = el.textContent.trim();

    const card = el.closest('.adventure-card');

    if (!card || !text) return;

    let audioKey = '';

    if (card.id === 'card-game-1') {
        audioKey = 'card_game1_desc';
    } 
    else if (card.id === 'card-game-2') {
        audioKey = 'card_game2_desc';
    } 
    else if (card.id === 'card-game-3') {
        audioKey = 'card_game3_desc';
    }

    this.addSpeechButton(el, text, '', audioKey);

    document.querySelectorAll('.quest-placeholder-card p, .about-text p').forEach(el => {
    const text = el.textContent.trim();
    if (text) this.addSpeechButton(el, text);
});


});
    }

    speakText(text, btnElement = null) {
        if (!('speechSynthesis' in window) || !text) return;
        window.speechSynthesis.cancel();
        document.querySelectorAll('.speak-btn.speaking').forEach(b => b.classList.remove('speaking'));

        const cleanText = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        // Prefer Russian cheerful / female / child / assistant voice
        const ruVoice = voices.find(v => /^ru(-|_)/i.test(v.lang) && /female|milena|tatyana|irina|yadviga|child|google/i.test(v.name)) ||
                        voices.find(v => /^ru(-|_)/i.test(v.lang));
        if (ruVoice) utterance.voice = ruVoice;
        utterance.lang = 'ru-RU';

        // CARTOON PRESCHOOL VOICE: Higher pitch (1.38) and lively energetic pace (1.05)
        utterance.pitch = 1.08;
        utterance.rate = 0.98;
        utterance.volume = 1;

        if (btnElement) {
            btnElement.classList.add('speaking');
            utterance.onend = () => btnElement.classList.remove('speaking');
            utterance.onerror = () => btnElement.classList.remove('speaking');
        }

        window.speechSynthesis.speak(utterance);
    }

    addSpeechButton(target, text, extraClass = '', audioKey = '') {
        if (!target || !text || target.querySelector('.speak-btn')) return;
        const nestedInButton = target.tagName === 'BUTTON';
        const btn = document.createElement(nestedInButton ? 'span' : 'button');
        if (!nestedInButton) btn.type = 'button';
        else { btn.setAttribute('role', 'button'); btn.setAttribute('tabindex', '0'); }
        btn.className = `speak-btn ${extraClass}`.trim();
        btn.setAttribute('aria-label', 'Прослушать текст');
        btn.title = 'Послушать';
        btn.innerHTML = '<svg class="speak-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        const play = (event) => {
            event.stopPropagation();
            this.voicePlayer.play(audioKey || text, text, btn);
        };
        btn.addEventListener('click', play);
        btn.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                play(event);
            }
        });
        target.appendChild(btn);
    }

    celebrateBurst(container) {
        if (!container) return;
        if (window.fireworksEngine) {
            window.fireworksEngine.launchFromElement(container);
        }
        const burst = document.createElement('div');
        burst.className = 'celebration-burst';
        burst.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 24; i++) {
            const piece = document.createElement('i');
            piece.style.setProperty('--angle', `${i * 15}deg`);
            piece.style.setProperty('--delay', `${(i % 6) * 35}ms`);
            burst.appendChild(piece);
        }
        container.appendChild(burst);
        setTimeout(() => burst.remove(), 1500);
    }

    calculateTotalPoints() {
        return Math.min(450, (this.state.game1Points || 0) + (this.state.game2Points || 0) + (this.state.game3Points || 0));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.fireworksEngine = new FireworksEngine('fireworks-canvas');
    window.ecogradApp = new EcogradApp();
});
