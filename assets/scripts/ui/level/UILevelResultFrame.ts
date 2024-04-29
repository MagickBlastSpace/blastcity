declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame } from 'cc';
import { UIStartFrame } from '../start/UIStartFrame';
import { UIFrameBase } from '../UIFrameBase';
import { UILevelMovesShop } from './UILevelMovesShop';
import { SaveData } from '../../data/SaveData';
import { ButlersGift } from '../../game/boosters/ButlersGift';
import { Level } from '../../game/Level';
import { UserData } from '../../data/UserData';
import { GameData } from '../../data/GameData';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UILevelResultFrame')
export class UILevelResultFrame extends UIPopupFrameBase {

    @property(Label)
    resultLabel: Label = null;
    @property(Label)
    buttonLabel: Label = null;
    @property(Label)
    goldLabel: Label = null;
    @property(Label)
    levelLabel: Label = null;

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

    @property(Node)
    progressLose: Node = null;
    @property(Node)
    commonMovesShopPanel: Node = null;

    @property(UIStartFrame)
    startFrame: UIStartFrame = null;

    @property(UILevelMovesShop)
    movesShop: UILevelMovesShop = null;

    @property(ButlersGift)
    butlersGift: ButlersGift = null;

    @property(Level)
    level: Level = null;

    private isSuccess: boolean = false;


    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.movesShop.node.on("buy", () => this.hide());
        this.movesShop.node.on("close", () => this.onPlayBtnClick());
    }
    
    refresh(isSuccess: boolean, goldEarned: number) {
        this.isSuccess = isSuccess;

        let currentLevelNumber = UserData.instance.getProgress();

        this.levelLabel.string = isSuccess ? "Level " + currentLevelNumber : "Continue?";

        this.resultLabel.string = isSuccess ? "Level Complete" : "Level Failed";
        this.buttonLabel.string = isSuccess ? "Next" : "Replay";
        this.goldLabel.string = goldEarned > 0 ? "Gold earned: " + goldEarned : "";

        this.movesShop.node.active = !isSuccess;
        this.progressLose.active = !isSuccess && this.butlersGift.getStreak() > 0;
        this.commonMovesShopPanel.active = !isSuccess && this.butlersGift.getStreak() === 0;

        this.movesShop.refresh();

        try {
            let levelsCount = GameData.instance.levels.length;
            let completedLevelIndex = UserData.instance.getProgress() - 1;
            let levelData = GameData.instance.levels[completedLevelIndex % levelsCount];

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
        } catch (error) {
            console.error('Error setting level result:', error);
        }
    }

    onPlayBtnClick() {
        SaveData.instance.clearLevelProgress();

        if(!this.isSuccess) {
            this.butlersGift.clearStreak();
            this.level.fail();
        }

        this.startFrame.show();

        this.hide();

        //gamepush.ads.showFullscreen();
    }
}


