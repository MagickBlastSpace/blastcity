import { _decorator, Component, Node, Slider, Button, Toggle } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { AudioController } from '../../utils/AudioController';
import { UserData } from '../../data/UserData';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UISettingsFrame')
export class UISettingsFrame extends UIPopupFrameBase {

    @property(Slider)
    musicSlider: Slider = null;

    @property(Slider)
    sfxSlider: Slider = null;

    @property(Button)
    closeBtn: Button = null;

    @property(Toggle)
    devModeToggle: Toggle = null;
    @property(Toggle)
    aphroditeToggle: Toggle = null;

    @property(Button)
    langBtn_Ru: Button = null;
    @property(Button)
    langBtn_En: Button = null;

    @property(Localization)
    localization: Localization;


    start() {
        this.musicSlider.node.on('slide', this.onMusicVolumeChanged, this);
        this.sfxSlider.node.on('slide', this.onSfxVolumeChanged, this);

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        const isDevMode = UserData.instance.isDevMode();
        this.devModeToggle.isChecked = isDevMode;

        this.devModeToggle.node.on('toggle', this.onToggleDevMode, this);

        const isAphrodite = UserData.instance.isAphroditeAvailable();
        this.aphroditeToggle.isChecked = isAphrodite;

        this.aphroditeToggle.node.on('toggle', this.onToggleAphrodite, this);

        this.langBtn_Ru.node.on(Button.EventType.CLICK, this.onLangBtnClickRu, this);
        this.langBtn_En.node.on(Button.EventType.CLICK, this.onLangBtnClickEn, this);
    }


    refresh() {
        this.musicSlider.progress = UserData.instance.getMusicVolume();
        this.sfxSlider.progress = UserData.instance.getSfxVolume();
    }


    show() {
        super.show();

        this.refresh();
    }
    

    onMusicVolumeChanged(slider: Slider) {
        const newVolume = slider.progress;

        AudioController.instance.setMusicVolume(newVolume);
    }

    onSfxVolumeChanged(slider: Slider) {
        const newVolume = slider.progress;

        AudioController.instance.setSfxVolume(newVolume);

        //this.playSfxPreview();
    }

    playSfxPreview() {
        AudioController.instance.playClick();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onToggleDevMode(toggle: Toggle) {
        UserData.instance.setDevMode(toggle.isChecked);
        console.log('Developer mode is now:', toggle.isChecked);
    }

    onToggleAphrodite(toggle: Toggle) {
        UserData.instance.setAphroditeAvailable(toggle.isChecked);
        console.log('Aphrodite is now:', toggle.isChecked);
    }


    onLangBtnClickRu() {
        this.localization.setLanguage("ru");
    }

    onLangBtnClickEn() {
        this.localization.setLanguage("en");
    }
}


