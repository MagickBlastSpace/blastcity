import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { UIEventButton } from './UIEventButton';
import { Field } from '../../game/Field';
import { KingLeagueEvent } from '../../game/events/competitive/KingLeagueEvent';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UIChest } from '../chest/UIChest';
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

    private isLevelsLoaded: boolean = false;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        
        this.briefingPopup.node.on("play", () => this.onPlay());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].node.on("click", () => this.onEventBtnClick(i), this);
            this.eventBtns[i].node.on("play", () => this.onPlay());
        }

        GameData.instance.node.on("levels_loaded", () => this.lockPlay(false));
        GameData.instance.node.on("level_stage_update", () => this.lockPlay(true));

        this.playBtn.node.active = false;
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

        ResolutionManager.instance.adjustResolution();
    }

    show() {
        super.show();

        this.refresh();
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
}


