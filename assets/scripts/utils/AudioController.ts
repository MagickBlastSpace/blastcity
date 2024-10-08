import { _decorator, Component, Node, assetManager, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {

    @property(AudioSource)
    public soundtrackSource: AudioSource = null!

    @property(AudioSource)
    public uiSource: AudioSource = null!

    @property(AudioClip)
    public click: AudioClip = null!
    @property(AudioClip)
    public popup: AudioClip = null!

    @property(AudioClip)
    public levelComplete: AudioClip = null!
    @property(AudioClip)
    public levelResult: AudioClip = null!

    @property(AudioClip)
    public hammer: AudioClip = null!
    @property(AudioClip)
    public bow: AudioClip = null!
    @property(AudioClip)
    public cannon: AudioClip = null!
    @property(AudioClip)
    public shuffle: AudioClip = null!

    public static instance: AudioController = null;

    private isMusic: boolean = true;
    private isSfx: boolean = true;
    private isVibration: boolean = true;


    onLoad() {
        AudioController.instance = this;
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

    playLevelResult() {
        if(!this.isSfxEnabled()) {
            return;
        }

        this.uiSource.playOneShot(this.levelResult, 1);
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

        if(this.isMusicEnabled()) {
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


