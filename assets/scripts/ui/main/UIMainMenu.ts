import { _decorator, Component, Node, Button, assetManager, Sprite, SpriteFrame, macro } from 'cc';
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
import { UIProfilePopup } from '../profile/UIProfilePopup';
import { UIAssetsLoadingFrame } from '../loading/UIAssetsLoadingFrame';
import { ChestRewardData } from '../../data/ChestData';
import { UICollectionCardRecievePopup } from '../collection/UICollectionCardRecievePopup';
import { Net } from '../../net/Net';
import { Clans } from '../../game/Clans';
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
    @property(Button)
    profileBtn: Button = null;

    @property(Sprite)
    background: Sprite = null;
    @property(Sprite)
    background_1: Sprite = null;
    @property(Sprite)
    chestPicture: Sprite = null;

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
    @property(UIProfilePopup)
    profilePopup: UIProfilePopup;

    @property(UIAssetsLoadingFrame)
    assetsLoadingFrame: UIAssetsLoadingFrame;

    @property(Node)
    resourcesNode: Node = null;

    @property(UICollectionCardRecievePopup)
    recievePopup: UICollectionCardRecievePopup;

    @property(Clans)
    clans: Clans = null;


    onLoad() {
        macro.ENABLE_MULTI_TOUCH = false;
    }
    
    start() {
        this.assetsLoadingFrame.show();

        SaveData.instance.node.on("level_progress_loaded", () => this.play());
        UserData.instance.node.on("premium_purchase", () => this.showPremiumPurchase());
        SaveData.instance.node.on("level_progress_checked", () => {
            console.log(`[STARTUP +${performance.now().toFixed(0)}ms] Level progress checked`);
            if(UserData.instance.getProgress() > 0) {
                this.assetsLoadingFrame.hide();

                AudioController.instance.playMainMenuSoundtrack();

                AudioController.instance.loadSoundsAssets();
            }
        });

        this.startFrame.on("play", () => this.play());
        this.startFrame.on("assets_ready", () => {
            this.updateBackgroundGraphics();
            
            AudioController.instance.loadSoundsAssets();
        });
        
        this.chest.node.on("complete", () => this.updateBackgroundGraphics());
        this.chest.node.on("reward", (data) => this.showChestReward(data));

        this.resourcesNode.on("shop", () => this.onBtnShopClick());

        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnShopClick, this);
        this.clanBtn.node.on(Button.EventType.CLICK, this.onBtnClanClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onBtnPlayClick, this);
        this.tbdBtn.node.on(Button.EventType.CLICK, this.onBtnTbdClick, this);
        this.tbd2Btn.node.on(Button.EventType.CLICK, this.onBtnTbd2Click, this);

        this.settingsBtn.node.on(Button.EventType.CLICK, this.onSettingsBtnClick, this);
        this.profileBtn.node.on(Button.EventType.CLICK, this.onProfileBtnClick, this);

        this.recievePopup.node.on("check", (id) => {
            this.removeRecievedCard(id);
            this.checkRecievedCards();
        });

        this.setAllBtnsPassive();
        this.onBtnPlayClick();

        this.updateButtonsAdaptivity();

        
        this.scheduleOnce(() => {
            Net.instance.fetchMembersOfChannel(this.clans.getClanId());
        }, 5);
    }


    show() {
        super.show();

        this.onBtnPlayClick();

        this.adsTimer.startMenuTimer();

        AudioController.instance.playMainMenuSoundtrack();
    }

    play() {
        console.log("play event handle");

        this.hide();

        this.adsTimer.startGameplayTimer();
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

        this.updateButtonsAdaptivity();

        this.checkRecievedCards();
    }

    onSettingsBtnClick() {
        this.settingsFrame.show();
    }

    onProfileBtnClick() {
        this.profilePopup.init(UserData.instance.getPlayerId());
        
        this.profilePopup.show();
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

            bundle.load("chest/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: chest`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: chest`);

                this.chestPicture.spriteFrame = spriteFrame;
            });
        });
    }


    showPremiumPurchase() {
        this.rewardPopup.show();

        this.rewardPopup.init_Battlepass();
    }

    showChestReward(data: ChestRewardData) {
        this.rewardPopup.show();

        this.rewardPopup.init_Chest(data);
    }


    updateButtonsAdaptivity() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].refreshAdaptivity();
        }
    }


    removeRecievedCard(id: string) {
        UserData.instance.removeRecievedCard(id);
    }

    checkRecievedCards() {
        let recievedCards = UserData.instance.getRecievedCards();

        if(recievedCards.length > 0) {
            this.recievePopup.hideClean();

            this.recievePopup.init(recievedCards[0].id, recievedCards[0].playerId);

            this.recievePopup.show();
        }
    }
}



