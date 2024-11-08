declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { Field } from '../../game/Field';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIEventMinified } from '../events/UIEventMinified';
const { ccclass, property } = _decorator;

@ccclass('UIStartBriefingPopup')
export class UIStartBriefingPopup extends UIPopupFrameBase {

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;

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

    @property(UIFrameBase)
    butlersGiftInfoPopup: UIFrameBase = null;
    @property(UIFrameBase)
    refillEnergyPopup: UIFrameBase = null;

    @property([UIEventMinified])
    minifiedEvents: UIEventMinified[] = [];


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());

        this.butlersGiftInfoPopup.node.on("play", () => this.onPlayBtnClick());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.hide, this);
        this.butlersGiftInfoBtn.node.on(Button.EventType.CLICK, this.showButlerGiftInfo, this);

        this.refresh();
    }

    refresh() {
        let levelData = GameData.instance.getCurrentLevel();

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;
        
        if(UserData.instance.getProgress() >= GameData.instance.getMaxProgress()) {
            currentLevelNumber = UserData.instance.getKingLeagueProgress() + 1;
            this.levelLabel.string = "Round " + currentLevelNumber;
        }

        this.difficultyLabel.string = levelData ? levelData.difficulty + " Difficulty" : "Common Difficulty";

        if(levelData.difficulty === "hard") {
            this.frame.spriteFrame = this.hard;
            this.header.spriteFrame = this.header_hard;
        }
        else if(levelData.difficulty === "superhard") {
            this.frame.spriteFrame = this.superHard;
            this.header.spriteFrame = this.header_superHard;
        }
        else {
            this.frame.spriteFrame = this.common;
            this.header.spriteFrame = this.header_common;
        }

        for(let i = 0; i < this.minifiedEvents.length; i++) {
            this.minifiedEvents[i].updateData();
        }
    }

    show() {
        super.show();

        this.refresh();
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
    }

    showButlerGiftInfo() {
        this.butlersGiftInfoPopup.show();
    }
}


