import { _decorator, Component, Node, assetManager, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {

    @property(AudioSource)
    public soundtrackSource: AudioSource = null!


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

                this.soundtrackSource.clip = audio;

                this.soundtrackSource.play();
            });
        });
    }
}


