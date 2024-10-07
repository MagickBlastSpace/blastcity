import { _decorator, Component, Node, Slider, AudioSource, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { AudioController } from '../../utils/AudioController';
const { ccclass, property } = _decorator;

@ccclass('UISettingsFrame')
export class UISettingsFrame extends UIPopupFrameBase {

    @property(Slider)
    musicSlider: Slider = null;

    @property(Slider)
    sfxSlider: Slider = null;

    @property(AudioSource)
    musicAudioSource: AudioSource = null;

    @property(AudioSource)
    sfxAudioSource: AudioSource = null;

    @property(Button)
    closeBtn: Button = null;


    start() {
        this.musicSlider.progress = this.musicAudioSource.volume;
        this.sfxSlider.progress = this.sfxAudioSource.volume;

        this.musicSlider.node.on('slide', this.onMusicVolumeChanged, this);
        this.sfxSlider.node.on('slide', this.onSfxVolumeChanged, this);

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    onMusicVolumeChanged(slider: Slider) {
        const newVolume = slider.progress;
        this.musicAudioSource.volume = newVolume;
    }

    onSfxVolumeChanged(slider: Slider) {
        const newVolume = slider.progress;
        this.sfxAudioSource.volume = newVolume;

        //this.playSfxPreview();
    }

    playSfxPreview() {
        AudioController.instance.playClick();
    }

    onCloseBtnClick() {
        this.hide();
    }
}


