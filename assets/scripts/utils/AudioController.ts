import { _decorator, Component, Node, assetManager, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {

    @property(AudioSource)
    public soundtrackSource: AudioSource = null!

    @property(AudioSource)
    public uiSource: AudioSource = null!

    private click: AudioClip = null!
    private popup: AudioClip = null!

    private levelComplete: AudioClip = null!
    private win: AudioClip = null!
    private lose: AudioClip = null!

    private hammer: AudioClip = null!
    private bow: AudioClip = null!
    private cannon: AudioClip = null!
    private shuffle: AudioClip = null!

    public static instance: AudioController = null;

    private isMusic: boolean = true;
    private isSfx: boolean = true;
    private isVibration: boolean = true;


    onLoad() {
        AudioController.instance = this;
    }

    start() {
        this.loadSoundsAssets();
    }


    /*Assets Management*/
    loadSoundsAssets() {
        this.loadUiSounds();
        this.loadGameplaySounds();
    }


    loadUiSounds() {
        assetManager.loadBundle("sounds_ui", (err, bundle) => {
            if (err) {
                return;
            }

            bundle.load("click", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.click = audio;
            });

            bundle.load("popup", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.popup = audio;
            });
        });
    }

    loadGameplaySounds() {
        assetManager.loadBundle("sounds_boosters", (err, bundle) => {
            if (err) {
                return;
            }

            bundle.load("hammer", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.hammer = audio;
            });

            bundle.load("bow", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.bow = audio;
            });

            bundle.load("cannon", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.cannon = audio;
            });

            bundle.load("shuffle", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.shuffle = audio;
            });
        });

        assetManager.loadBundle("sounds_level", (err, bundle) => {
            if (err) {
                return;
            }

            bundle.load("level_complete", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.levelComplete = audio;
            });

            bundle.load("win", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.win = audio;
            });

            bundle.load("lose", AudioClip, (err, audio) => {
                if (err) {
                    return;
                }

                this.lose = audio;
            });
        });
    }


    /*Music*/
    playMainMenuSoundtrack() {
        this.playMusic("main");
    }

    playGameplaySoundtrack() {
        this.playMusic("gameplay");
    }


    playMusic(soundtrackName: string) {
        if (this.soundtrackSource.playing) {
            this.soundtrackSource.stop();
        }

        assetManager.loadBundle("music", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: music`, err);
                return;
            }

            console.log(`Successfully loaded bundle: music"`);

            bundle.load(soundtrackName, AudioClip, (err, audio) => {
                if (err) {
                    console.error(`Failed to load sound`, err);
                    return;
                }

                console.log(`Successfully loaded sound`);

                if (this.soundtrackSource.playing) {
                    this.soundtrackSource.stop();
                }

                this.soundtrackSource.clip = audio;

                if(this.isMusicEnabled()) {
                    this.soundtrackSource.play();
                }
            });
        });
    }


    /*UI*/
    playClick() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.click, 1);
    }

    playPopup() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.popup, 1);
    }

    
    /*Gameplay*/
    playLevelComplete() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.levelComplete, 1);
    }

    playWin() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.win, 1);
    }

    playLose() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.lose, 1);
    }

    playHammerSound() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.hammer, 1);
    }

    playBowSound() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.bow, 1);
    }
    
    playCannonSound() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.cannon, 1);
    }
    
    playShuffleSound() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.shuffle, 1);
    }


    /*Settings Switcher*/
    switchMusic() {
        this.isMusic = !this.isMusic;

        if(!this.isMusicEnabled()) {
            if (this.soundtrackSource.playing) {
                this.soundtrackSource.stop();
            }
        }
        else {
            this.soundtrackSource.play();
        }
    }

    switchSfx() {
        this.isSfx = !this.isSfx;
    }

    switchVibration() {
        this.isVibration = !this.isVibration;
    }


    isMusicEnabled(): boolean {
        return this.isMusic;
    }

    isSfxEnabled(): boolean {
        return this.isSfx;
    }

    isVibrationEnabled(): boolean {
        return this.isVibration;
    }
}


