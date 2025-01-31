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

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].node.on("click", () => this.onEventBtnClick(i), this);
            this.eventBtns[i].node.on("play", () => this.onPlay());
        }

        GameData.instance.node.on("levels_loaded", () => this.lockPlay(false));
        GameData.instance.node.on("level_stage_update", () => this.lockPlay(true));

        this.playBtn.node.active = false;

        this.effectsManager.setEventBtns(this.eventBtns);
    }

    onPlayBtnClick() {
        this.hideAllPopups();

        this.briefingPopup.show();
    }


    refresh() {
        if(this.kingLeague.isKingLeagueMode()) {
            if(!this.kingLeague.getIsStarted() && this.isLevelsLoaded && this.kingLeague.canParticipate()) {
                this.openEventByName("KingLeague");
            }

            let currentLevelNumber = UserData.instance.getKingLeagueProgress() + 1;
            this.levelLabel.string = "Раунд";
            this.levelCountLabel.string = currentLevelNumber;
        }
        else {
            let currentLevelNumber = UserData.instance.getProgress() + 1;
            this.levelLabel.string = "Уровень";
            this.levelCountLabel.string = currentLevelNumber;
        }

        this.chest.refresh();

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].refresh();
        }

        ResolutionManager.instance.adjustResolution();
    }

    show() {
        super.show();

        this.refresh();

        this.effectsManager.initEventsProgressEffects(this.eventsController.getProgressData());
        this.eventsController.clearProgressData();
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
                    this.openEventByName("KingLeague");
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
        try {
            this.field.spawnInitialBoard(GameData.instance.getCurrentLevel());

            this.node.emit("play");
        }
        catch (error) {
            console.log(error);
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
}


