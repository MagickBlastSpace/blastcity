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

                this.soundtrackSource.play();
            });
        });
    }


    /*UI*/
    playClick() {
        this.uiSource.playOneShot(this.click, 1);
    }

    playPopup() {
        this.uiSource.playOneShot(this.popup, 1);
    }

    
    /*Gameplay*/
    playLevelComplete() {
        this.uiSource.playOneShot(this.levelComplete, 1);
    }

    playLevelResult() {
        this.uiSource.playOneShot(this.levelResult, 1);
    }

    playHammerSound() {
        this.uiSource.playOneShot(this.hammer, 1);
    }

    playBowSound() {
        this.uiSource.playOneShot(this.bow, 1);
    }
    
    playCannonSound() {
        this.uiSource.playOneShot(this.cannon, 1);
    }
    
    playShuffleSound() {
        this.uiSource.playOneShot(this.shuffle, 1);
    }
}


