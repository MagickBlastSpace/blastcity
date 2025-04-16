declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { Field } from '../../game/Field';
import { GameData, GoalData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIEventMinified } from '../events/UIEventMinified';
import { Localization } from '../../utils/Localization';
import { UIStartBonusItem } from './UIStartBonusItem';
import { UIBriefingGoalItem } from './UIBriefingGoalItem';
const { ccclass, property } = _decorator;

@ccclass('UIStartBriefingPopup')
export class UIStartBriefingPopup extends UIPopupFrameBase {

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;
    @property(Label)
    levelReqLabel: Label = null;

    @property(Sprite)
    frame: Sprite = null;
    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;

    @property(Sprite)
    header: Sprite = null;
    @property(SpriteFrame)
    header_common: SpriteFrame = null;
    @property(SpriteFrame)
    header_hard: SpriteFrame = null;
    @property(SpriteFrame)
    header_superHard: SpriteFrame = null;

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    butlersGiftInfoBtn: Button = null;
    @property(Button)
    playRewardedBtn: Button = null;

    @property(Node)
    bgNode: Node = null;
    @property(Node)
    goalsFailNode: Node = null;

    @property(UIFrameBase)
    butlersGiftInfoPopup: UIFrameBase = null;
    @property(UIFrameBase)
    refillEnergyPopup: UIFrameBase = null;

    @property([UIEventMinified])
    minifiedEvents: UIEventMinified[] = [];

    @property([UIStartBonusItem])
    startBonuses: UIStartBonusItem[] = [];

    @property([UIBriefingGoalItem])
    goalItems: UIBriefingGoalItem[] = [];

    @property(Localization)
    l10n: Localization;

    private isFail: boolean = false;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());

        this.butlersGiftInfoPopup.node.on("play", () => this.onPlayBtnClick());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.playRewardedBtn.node.on(Button.EventType.CLICK, this.onPlayRewardedBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.butlersGiftInfoBtn.node.on(Button.EventType.CLICK, this.showButlerGiftInfo, this);

        this.refresh();
    }

    refresh() {
        this.isFail = false;

        this.bgNode.active = true;
        this.goalsFailNode.active = false;

        let levelData = GameData.instance.getCurrentLevel();

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = this.l10n.getLabelByKey("StartFrame.Level") + " " + currentLevelNumber;
        
        if(UserData.instance.getProgress() >= GameData.instance.getMaxProgress()) {
            currentLevelNumber = UserData.instance.getKingLeagueProgress() + 1;
            this.levelLabel.string = this.l10n.getLabelByKey("StartFrame.Level") + " " + currentLevelNumber;
        }

        //this.difficultyLabel.string = levelData ? levelData.difficulty + " Difficulty" : "Common Difficulty";

        if(levelData.difficulty === "hard") {
            this.frame.spriteFrame = this.hard;
            this.header.spriteFrame = this.header_hard;

            this.difficultyLabel.string = this.l10n.getLabelByKey("StartFrame.Difficulty_Hard") + " " + this.l10n.getLabelByKey("StartFrame.Difficulty");
        }
        else if(levelData.difficulty === "superhard") {
            this.frame.spriteFrame = this.superHard;
            this.header.spriteFrame = this.header_superHard;

            this.difficultyLabel.string = this.l10n.getLabelByKey("StartFrame.Difficulty_Superhard") + " " + this.l10n.getLabelByKey("StartFrame.Difficulty");
        }
        else {
            this.frame.spriteFrame = this.common;
            this.header.spriteFrame = this.header_common;

            this.difficultyLabel.string = this.l10n.getLabelByKey("StartFrame.Difficulty_Common") + " " + this.l10n.getLabelByKey("StartFrame.Difficulty");
        }

        for(let i = 0; i < this.minifiedEvents.length; i++) {
            this.minifiedEvents[i].updateData();
        }

        for(let i = 0; i < this.startBonuses.length; i++) {
            this.startBonuses[i].checkAutopick();
        }

        this.levelReqLabel.string = this.l10n.getLabelByKey("events.levelreq") + " 28";
    }

    show() {
        super.show();

        this.refresh();
    }


    init_Fail(goals: GoalData[]) {
        this.isFail = true;

        this.bgNode.active = false;
        this.goalsFailNode.active = true;

        for(let i = 0; i < goals.length || i < this.goalItems.length; i++) {
            if(i < goals.length) {
                this.goalItems[i].refresh(goals[i]);
            }
            else {
                let goalData = new GoalData();
                goalData.id = "common";
                this.goalItems[i].refresh(goalData);
            }
        }
    }


    onPlayBtnClick() {
        if(!UserData.instance.isEndlessLivesActive()) {
            if (gamepush.player.get('energy') <= 0) {
                this.refillEnergyPopup.show();
                return;
            }
        }
        
        this.hide();
        
        this.node.emit("play");

        console.log("Briefing play event");
    }

    onPlayRewardedBtnClick() {
        /*if(!UserData.instance.isEndlessLivesActive()) {
            if (gamepush.player.get('energy') <= 0) {
                this.refillEnergyPopup.show();
                return;
            }
        }*/
        
        this.hide();
        
        this.node.emit("play_rewarded");
    }

    onCloseBtnClick() {
        if(this.isFail) {
            this.node.emit("fail");
        }

        this.hide();
    }

    showButlerGiftInfo() {
        this.butlersGiftInfoPopup.show();
    }
}


