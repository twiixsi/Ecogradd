// ==========================================================================
// ЭКОГРАД: ХРАНИТЕЛИ ЭНЕРГИИ — AUDIO ENGINE
// ==========================================================================

class EcogradAudio {
    constructor() {
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.bgMusicAudio = null;
        this.audioContext = null;

        this.soundEffects = {
            click: 'assets/audio/effects/click.wav',
            hover: 'assets/audio/effects/hover.wav',
            correct: 'assets/audio/effects/correct.wav',
            incorrect: 'assets/audio/effects/incorrect.wav',
            crystal: 'assets/audio/effects/crystal.wav',
            unlock: 'assets/audio/effects/unlock.wav',
            badge: 'assets/audio/effects/badge.wav',
            complete: 'assets/audio/effects/complete.wav'
        };

        this.bgMusicSrc = 'assets/audio/music/bg_music.mp3';
        this.musicVolume = 0.22; // Приглушённо на фон

        this.init();
    }

    init() {
        try {
            const saved = localStorage.getItem('ecograd_audio_settings');
            if (saved) {
                const s = JSON.parse(saved);
                this.musicEnabled = s.music ?? true;
                this.sfxEnabled = s.sfx ?? true;
            }
        } catch (e) {}

        // Unlock on first user gesture
        const startAudio = () => {
            if (this.musicEnabled && !this.bgMusicAudio) {
                this.playMusic();
            }
            window.removeEventListener('pointerdown', startAudio);
            window.removeEventListener('keydown', startAudio);
        };
        window.addEventListener('pointerdown', startAudio, { once: true });
        window.addEventListener('keydown', startAudio, { once: true });
    }

    playMusic() {
        if (!this.musicEnabled) return;
        try {
            if (!this.bgMusicAudio) {
                this.bgMusicAudio = new Audio(this.bgMusicSrc);
                this.bgMusicAudio.loop = true;
                this.bgMusicAudio.volume = this.musicVolume;
            }
            this.bgMusicAudio.play().catch(() => {});
        } catch (e) {
            console.warn('Audio play waiting for gesture', e);
        }
    }

    stopMusic() {
        if (this.bgMusicAudio) {
            this.bgMusicAudio.pause();
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.stopMusic();
        }
        this.saveSettings();
        return this.musicEnabled;
    }

    toggleSfx() {
        this.sfxEnabled = !this.sfxEnabled;
        if (this.sfxEnabled) {
            this.playSfx('click');
        }
        this.saveSettings();
        return this.sfxEnabled;
    }

    saveSettings() {
        try {
            localStorage.setItem('ecograd_audio_settings', JSON.stringify({
                music: this.musicEnabled,
                sfx: this.sfxEnabled
            }));
        } catch (e) {}
    }

    playSfx(name) {
        if (!this.sfxEnabled) return;
        const src = this.soundEffects[name];
        if (!src) return;

        try {
            const snd = new Audio(src);
            snd.volume = 0.65;
            snd.play().catch(() => {});
        } catch (e) {}
    }
}

window.soundEngine = new EcogradAudio();
