import { _decorator, Component, Node, Button, assetManager, Sprite, SpriteFrame } from 'cc';
import { UIMainMenuButton } from './UIMainMenuButton';
import { UIMainMenuFrame } from './UIMainMenuFrame';
import { UIFrameBase } from '../UIFrameBase';
import { AdsTimer } from '../../utils/AdsTimer';
import { SaveData } from '../../data/SaveData';
import { Chest } from '../../game/Chest';
import { AudioController } from '../../utils/AudioController';
import { UISettingsFrame } from '../start/UISettingsFrame';
import { UserData } from '../../data/UserData';
import { UIPopupReward } from '../UIPopupReward';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenu')
export class UIMainMenu extends UIFrameBase {

    @property(Button)
    shopBtn: Button = null;
    @property(Button)
    clanBtn: Button = null;
    @property(Button)
    playBtn: Button = null;
    @property(Button)
    tbdBtn: Button = null;
    @property(Button)
    tbd2Btn: Button = null;

    @property(Button)
    settingsBtn: Button = null;

    @property(Sprite)
    background: Sprite = null;
    @property(Sprite)
    background_1: Sprite = null;

    @property([UIMainMenuButton])
    buttonsUi: UIMainMenuButton[] = [];

    @property([UIMainMenuFrame])
    framesUi: UIMainMenuFrame[] = [];

    @property(Node)
    startFrame: Node = null;
    @property(Chest)
    chest: Chest = null;

    @property(UISettingsFrame)
    settingsFrame: UISettingsFrame = null;

    @property(AdsTimer)
    adsTimer: AdsTimer = null;

    @property(UIPopupReward)
    rewardPopup: UIPopupReward;


    start() {
        SaveData.instance.node.on("level_progress_loaded", () => this.play());
        UserData.instance.node.on("premium_purchase", () => this.showPremiumPurchase());

        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnShopClick, this);
        this.clanBtn.node.on(Button.EventType.CLICK, this.onBtnClanClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onBtnPlayClick, this);
        this.tbdBtn.node.on(Button.EventType.CLICK, this.onBtnTbdClick, this);
        this.tbd2Btn.node.on(Button.EventType.CLICK, this.onBtnTbd2Click, this);

        this.settingsBtn.node.on(Button.EventType.CLICK, this.onSettingsBtnClick, this);

        this.setAllBtnsPassive();
        this.onBtnPlayClick();

        this.updateBackgroundGraphics();

        this.startFrame.on("play", () => this.play());
        this.chest.node.on("complete", () => this.updateBackgroundGraphics());

        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();
        //SaveData.instance.loadLevelProgressData();

        AudioController.instance.playMainMenuSoundtrack();
    }


    show() {
        super.show();

        this.onBtnPlayClick();

        this.adsTimer.startMenuTimer();

        AudioController.instance.playMainMenuSoundtrack();
    }

    play() {
        this.hide();

        this.adsTimer.startGameplayTimer();

        AudioController.instance.playGameplaySoundtrack();
    }


    onBtnShopClick() {
        this.onMainMenuBtnClick(0);
    }
    
    onBtnClanClick() {
        this.onMainMenuBtnClick(1);
    }

    onBtnPlayClick() {
        this.onMainMenuBtnClick(2);
    }

    onBtnTbdClick() {
        this.onMainMenuBtnClick(3);
    }

    onBtnTbd2Click() {
        this.onMainMenuBtnClick(4);
    }

    
    onMainMenuBtnClick(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.buttonsUi[index].setActiveIcon(true);

        this.framesUi[index].show();
    }

    onSettingsBtnClick() {
        this.settingsFrame.show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.framesUi.length; i++) {
            this.framesUi[i].hide();
        }
    }


    updateBackgroundGraphics() {
        assetManager.loadBundle("big_graphics", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: big_graphics`, err);
                return;
            }

            console.log(`Successfully loaded bundle: big_graphics"`);

            let backIndex = this.chest.getStage() + 1;

            bundle.load("back" + backIndex + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: background`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: background`);

                this.background.spriteFrame = spriteFrame;
                this.background_1.spriteFrame = spriteFrame;
            });
        });
    }


    showPremiumPurchase() {
        this.rewardPopup.show();

        this.rewardPopup.init_Battlepass();
    }
}


