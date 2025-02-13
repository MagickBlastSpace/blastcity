import { _decorator, Component, AudioSource, AudioClip, assetManager } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    @property(AudioSource) soundtrackSource: AudioSource = null!;
    @property(AudioSource) uiSource: AudioSource = null!;
    @property(AudioSource) baseTileSource: AudioSource = null!;
    @property(AudioSource) bonusTileSource: AudioSource = null!;

    private audioCache: Map<string, AudioClip> = new Map();
    private musicCache: Map<string, AudioClip> = new Map();
    private soundCooldowns: Map<string, number> = new Map(); // Prevents rapid repeated playbacks

    public static instance: AudioController = null;
    
    private isMusic = true;
    private isSfx = true;
    private isVibration = true;
    private isAssetsLoaded = false;

    private baseTileNames: string[] = ['base_tile_destroy_1', 'base_tile_destroy_2', 'base_tile_destroy_3', 'base_tile_destroy_4', 'base_tile_destroy_5'];

    onLoad() {
        if (!AudioController.instance) {
            AudioController.instance = this;
        }
    }

    /* Asset Management */
    loadSoundsAssets() {
        if (this.isAssetsLoaded) return;
        this.isAssetsLoaded = true;
        this.loadBundleSounds('sounds_ui', ['click', 'popup']);
        this.loadBundleSounds('sounds_boosters', ['hammer', 'bow', 'cannon', 'shuffle']);
        this.loadBundleSounds('sounds_level', ['level_complete', 'win', 'lose']);
        this.loadBundleSounds('sounds_bonuses', ['bomb', 'rocket', 'discoball', 'double_discoball', 'combo']);
        this.loadBundleSounds('sounds_tiles', this.baseTileNames);
        this.loadMusicAssets();
    }

    private loadBundleSounds(bundleName: string, sounds: string[]) {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) return;
            sounds.forEach(sound => this.loadSound(bundle, sound));
        });
    }

    private loadSound(bundle: any, soundName: string) {
        bundle.load(soundName, AudioClip, (err, audio) => {
            if (!err) this.audioCache.set(soundName, audio);
        });
    }

    /* Music Caching */
    private loadMusicAssets() {
        assetManager.loadBundle('music', (err, bundle) => {
            if (err) return;
            ['main', 'gameplay'].forEach(track => {
                bundle.load(track, AudioClip, (err, audio) => {
                    if (!err) this.musicCache.set(track, audio);
                });
            });
        });
    }

    private playMusic(soundtrackName: string) {
        if (!this.isMusic) return;
    
        // Stop current music before changing tracks
        if (this.soundtrackSource.playing) {
            this.soundtrackSource.stop();
        }
    
        // If the track is cached, use it instead of reloading
        if (this.musicCache.has(soundtrackName)) {
            const newClip = this.musicCache.get(soundtrackName)!;
            if (this.soundtrackSource.clip !== newClip) {
                this.soundtrackSource.clip = newClip;
            }
            this.soundtrackSource.play();
            return;
        }
    
        // Load the music if not already cached
        assetManager.loadBundle('music', (err, bundle) => {
            if (err) return;
            bundle.load(soundtrackName, AudioClip, (err, audio) => {
                if (!err) {
                    this.musicCache.set(soundtrackName, audio);
                    this.soundtrackSource.clip = audio;
                    this.soundtrackSource.play();
                }
            });
        });
    }
    

    playMainMenuSoundtrack() { this.playMusic('main'); }
    playGameplaySoundtrack() { this.playMusic('gameplay'); }

    /* Cooldown for Audio Clips */
    private playSound(source: AudioSource, soundName: string, volume = 1) {
        if (!this.isSfx || !this.audioCache.has(soundName)) return;

        const now = Date.now();
        const lastPlayed = this.soundCooldowns.get(soundName) || 0;

        // Prevent playing the same sound within 100ms
        if (now - lastPlayed < 100) return;

        this.soundCooldowns.set(soundName, now);
        source.playOneShot(this.audioCache.get(soundName)!, volume);
    }

    /* UI Sounds */
    playClick() { this.playSound(this.uiSource, 'click'); }
    playPopup() { this.playSound(this.uiSource, 'popup'); }

    /* Gameplay Sounds */
    playLevelComplete() { this.playSound(this.uiSource, 'level_complete'); }
    playWin() { this.playSound(this.uiSource, 'win'); }
    playLose() { this.playSound(this.uiSource, 'lose'); }
    playHammerSound() { this.playSound(this.uiSource, 'hammer'); }
    playBowSound() { this.playSound(this.uiSource, 'bow'); }
    playCannonSound() { this.playSound(this.uiSource, 'cannon'); }
    playShuffleSound() { this.playSound(this.uiSource, 'shuffle'); }

    playRocket() { this.playSound(this.bonusTileSource, 'rocket'); }
    playBomb() { this.playSound(this.bonusTileSource, 'bomb'); }
    playDiscoball() { this.playSound(this.bonusTileSource, 'discoball'); }
    playDoubleDiscoball() { this.playSound(this.bonusTileSource, 'double_discoball'); }
    playCombo() { this.playSound(this.bonusTileSource, 'combo'); }

    playTilesDestroy() {
        const randomClip = this.baseTileNames[Math.floor(Math.random() * this.baseTileNames.length)];
        this.playSound(this.baseTileSource, randomClip);
    }

    /* Unload Unused Audio (Memory Management) */
    clearUnusedAudio() {
        this.audioCache.forEach((_, key) => {
            if (!this.audioCache.has(key)) return;
            this.audioCache.get(key)?.destroy();
            this.audioCache.delete(key);
        });

        this.musicCache.forEach((_, key) => {
            if (!this.musicCache.has(key)) return;
            this.musicCache.get(key)?.destroy();
            this.musicCache.delete(key);
        });
    }

    /* Settings */
    switchMusic() {
        this.isMusic = !this.isMusic;
        if (!this.isMusic && this.soundtrackSource.playing) {
            this.soundtrackSource.stop();
        } else {
            this.soundtrackSource.play();
        }
    }

    switchSfx() { this.isSfx = !this.isSfx; }
    switchVibration() { this.isVibration = !this.isVibration; }
    isMusicEnabled() { return this.isMusic; }
    isSfxEnabled() { return this.isSfx; }
    isVibrationEnabled() { return this.isVibration; }
}
