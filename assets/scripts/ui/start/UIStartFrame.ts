import { _decorator, Component, Node, Button, Label, Sprite, SpriteFrame, assetManager } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { UIEventButton } from './UIEventButton';
import { Field } from '../../game/Field';
import { AdsTimer } from '../../utils/AdsTimer';
import { KingLeagueEvent } from '../../game/events/competitive/KingLeagueEvent';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrame')
export class UIStartFrame extends UIFrameBase {

    @property(Button)
    playBtn: Button = null;

    @property([UIEventButton])
    eventBtns: UIEventButton[] = [];

    @property(UIFrameBase)
    briefingPopup: UIFrameBase = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;

    @property(Sprite)
    background: Sprite = null;
    @property(Sprite)
    background_1: Sprite = null;

    @property(Field)
    field: Field = null;

    @property(AdsTimer)
    adsTimer: AdsTimer = null;

    @property(KingLeagueEvent)
    kingLeague: KingLeagueEvent = null;

    private isLevelsLoaded: boolean = false;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());
        this.briefingPopup.node.on("play", () => this.onPlay());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        SaveData.instance.loadLevelProgressData();
        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].node.on("click", () => this.onEventBtnClick(i), this);
            this.eventBtns[i].node.on("play", () => this.onPlay());
        }

        GameData.instance.node.on("levels_loaded", () => this.unlockPlay());
        GameData.instance.node.on("level_stage_update", () => this.lockPlay());

        this.playBtn.node.active = false;

        //this.refresh();

        assetManager.loadBundle("big_graphics", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: big_graphics`, err);
                return;
            }

            console.log(`Successfully loaded bundle: big_graphics"`);

            bundle.load("back/spriteFrame", SpriteFrame, (err, spriteFrame) => {
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

    onPlayBtnClick() {
        this.hideAllPopups();

        this.briefingPopup.show();
    }


    refresh() {
        if(this.kingLeague.isKingLeagueMode()) {
            console.log("King League Mode");
            
            if(!this.kingLeague.getIsStarted() && this.isLevelsLoaded && this.kingLeague.canParticipate()) {
                this.openEventByName("KingLeague");
            }

            let currentLevelNumber = UserData.instance.getKingLeagueProgress() + 1;
            this.levelLabel.string = "Round " + currentLevelNumber;
        }
        else {
            let currentLevelNumber = UserData.instance.getProgress() + 1;
            this.levelLabel.string = "Level " + currentLevelNumber;
        }
    }

    show() {
        super.show();

        this.refresh();

        this.adsTimer.startMenuTimer();
    }


    onEventBtnClick(index: number) {
        this.hideAllPopups();

        this.eventBtns[index].showEventPrefab();
    }


    lockPlay() {
        this.refresh();

        this.playBtn.node.active = false;
    }
    
    unlockPlay() {
        this.refresh();

        this.playBtn.node.active = true;

        this.isLevelsLoaded = true;
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

            this.hide();

            this.adsTimer.startGameplayTimer();
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
}


