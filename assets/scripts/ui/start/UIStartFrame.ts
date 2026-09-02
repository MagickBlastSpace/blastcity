declare const gamepush: any;

import { _decorator, Component, Node, Button, Label, assetManager } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { UIEventButton } from './UIEventButton';
import { Field } from '../../game/Field';
import { KingLeagueEvent } from '../../game/events/competitive/KingLeagueEvent';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UIChest } from '../chest/UIChest';
import { EventsController } from '../../game/events/EventsController';
import { UIStartFrameEffects } from '../effects/UIStartFrameEffects';
import { UIAssetsLoadingFrame } from '../loading/UIAssetsLoadingFrame';
import { AudioController } from '../../utils/AudioController';
import { Level } from '../../game/Level';
import { ChestRewardData } from '../../data/ChestData';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrame')
export class UIStartFrame extends UIFrameBase {

    @property(Button)
    playBtn: Button = null;

    @property([UIEventButton])
    eventBtns: UIEventButton[] = [];

    @property(UIFrameBase)
    briefingPopup: UIFrameBase = null;

    @property(UIChest)
    chest: UIChest = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    levelCountLabel: Label = null;

    @property(Field)
    field: Field = null;
    @property(Level)
    level: Level = null;

    @property(KingLeagueEvent)
    kingLeague: KingLeagueEvent = null;

    @property(EventsController)
    eventsController: EventsController = null;
    @property(UIStartFrameEffects)
    effectsManager: UIStartFrameEffects = null;

    @property(UIAssetsLoadingFrame)
    assetsLoadingFrame: UIAssetsLoadingFrame;

    private isLevelsLoaded: boolean = false;

    private isPreloaded: boolean = false;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_checked", () => {
            if(UserData.instance.getProgress() > 0) {
                this.preloadAssets();
            }
        });

        this.field.node.on("level_init", () => {
            this.playGameplaySoundtrack();
            this.preloadAssets();
        });
        
        this.briefingPopup.node.on("play", () => this.onPlay());
        this.briefingPopup.node.on("play_rewarded", () => this.onPlayRewarded());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].node.on("click", () => this.onEventBtnClick(i), this);
            this.eventBtns[i].node.on("play", () => this.onEventPlay());
            this.eventBtns[i].node.on("event_play", () => this.onEventPlay());
        }

        GameData.instance.node.on("levels_loaded", () => this.lockPlay(false));
        GameData.instance.node.on("level_stage_update", () => this.lockPlay(true));

        this.playBtn.node.active = false;

        this.effectsManager.setEventBtns(this.eventBtns);

        this.effectsManager.node.on("event_progress_done", (eName) => this.refreshEventBtn(eName));

        //Localization.instance.node.on("lang_change", () => this.refresh());
    }

    onPlayBtnClick() {
        this.hideAllPopups();

        this.briefingPopup.show();
    }


    refresh() {
        //this.chest.refresh();

        /*for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].refresh();
        }*/

        ResolutionManager.instance.adjustResolution();

        if(this.kingLeague.isKingLeagueMode()) {
            if(!this.kingLeague.getIsStarted() && this.isLevelsLoaded && this.kingLeague.canParticipate()) {
                this.scheduleOpenEventByName("KingLeague");
            }

            let currentLevelNumber = UserData.instance.getKingLeagueProgress() + 1;
            this.levelLabel.string = Localization.instance.getLabelByKey("StartFrame.Stage");
            this.levelCountLabel.string = currentLevelNumber;
        }
        else {
            let currentLevelNumber = UserData.instance.getProgress() + 1;
            this.levelLabel.string = Localization.instance.getLabelByKey("StartFrame.Level");
            this.levelCountLabel.string = currentLevelNumber;
        }
    }

    show() {
        super.show();

        this.refresh();

        let totalTime = this.effectsManager.initEventsProgressEffects(this.eventsController.getProgressData()) + 1.2;
        this.eventsController.clearProgressData();

        this.scheduleOnce(() => {
            this.chest.refresh();

            for(let i = 0; i < this.eventBtns.length; i++) {
                this.eventBtns[i].refresh();
            }
        }, totalTime);
    }


    onEventBtnClick(index: number) {
        this.hideAllPopups();

        this.eventBtns[index].showEventPrefab();
    }


    lockPlay(isLock: boolean) {
        this.refresh();

        this.playBtn.node.active = !isLock;

        if(!isLock) {
            this.isLevelsLoaded = true;

            if(UserData.instance.getProgress() === 0) {
                this.onPlay();

                return;
            }

            if(this.kingLeague.isKingLeagueMode()) {
                console.log("King League Mode");

                if(!this.kingLeague.getIsStarted() && this.kingLeague.canParticipate()) {
                    this.scheduleOpenEventByName("KingLeague");
                }
            }
        }
    }


    hideAllPopups() {
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].hideClean();
        }

        this.briefingPopup.hideClean();
    }


    onPlay() {
        console.log(`[STARTUP +${performance.now().toFixed(0)}ms] Gameplay start requested`);

        try {
            this.field.spawnInitialBoard(GameData.instance.getCurrentLevel());

            this.node.emit("play");

            console.log("StartFrame play event");
        }
        catch (error) {
            console.log(error);
        }
    }

    onEventPlay() {
        this.onPlayBtnClick();
    }

    onPlayRewarded() {
        this.onPlay();

        this.showRewardedAd();
    }

    async showRewardedAd() {
        const success = await gamepush.ads.showRewardedVideo();
        if (success) {
            this.level.addExtraMoves(4);
        }
    }


    openEventByName(eventName: string) {
        for(let i = 0; i < this.eventBtns.length; i++) {
            if(this.eventBtns[i].getEventName() === eventName) {
                this.onEventBtnClick(i);

                return;
            }
        }
    }

    scheduleOpenEventByName(eventName: string) {
        for(let i = 0; i < this.eventBtns.length; i++) {
            if(this.eventBtns[i].getEventName() === eventName) {
                this.eventBtns[i].scheduleOpen();

                return;
            }
        }
    }


    preloadAssets() {
        if(this.isPreloaded) {
            return;
        }

        this.isPreloaded = true;

        assetManager.loadBundle("events", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: events`, err);
                return;
            }

            console.log(`Successfully loaded bundle events`);

            for(let i = 0; i < this.eventBtns.length; i++) {
                this.eventBtns[i].loadAssets(bundle);
            }
        });

        this.assetsLoadingFrame.loadAssets();

        this.node.emit("assets_ready");
    }


    playGameplaySoundtrack() {
        AudioController.instance.playGameplaySoundtrack();
    }

    refreshEventBtn(eName: string) {
        if(eName === "chest") {
            this.chest.refresh();

            return;
        }

        for(let i = 0; i < this.eventBtns.length; i++) {
            if(this.eventBtns[i].getEventName() === eName) {
                this.eventBtns[i].refresh();

                return;
            }
        }
    }
}
