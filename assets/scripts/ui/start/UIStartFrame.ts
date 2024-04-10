import { _decorator, Component, Node, Button, Label, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrame')
export class UIStartFrame extends UIFrameBase {

    @property(Button)
    playBtn: Button = null;

    @property([Button])
    eventBtns: Button[] = [];
    @property([UIFrameBase])
    eventPopups: UIFrameBase[] = [];

    @property(UIFrameBase)
    briefingPopup: UIFrameBase = null;

    @property(Sprite)
    sidePanel_Left: Sprite = null;
    @property(Sprite)
    sidePanel_Right: Sprite = null;

    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());
        this.briefingPopup.node.on("play", () => this.hide());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.refresh();

        SaveData.instance.loadLevelProgressData();
        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        for(let i = 0; i < this.eventBtns.length && i < this.eventPopups.length; i++) {
            this.eventBtns[i].node.on(Button.EventType.CLICK, () => this.onEventBtnClick(i), this);
        }

        GameData.instance.node.on("levels_loaded", () => this.unlockPlay());

        this.playBtn.node.active = false;
    }

    onPlayBtnClick() {
        this.briefingPopup.show();
    }


    refresh() {
        let levelsCount = GameData.instance.levels.length;
        let levelData = GameData.instance.levels[UserData.instance.getProgress() % levelsCount];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        if(levelData.difficulty === "Hard") {
            this.sidePanel_Left.spriteFrame = this.hard;
            this.sidePanel_Right.spriteFrame = this.hard;
        }
        else if(levelData.difficulty === "SuperHard") {
            this.sidePanel_Left.spriteFrame = this.superHard;
            this.sidePanel_Right.spriteFrame = this.superHard;
        }
        else {
            this.sidePanel_Left.spriteFrame = this.common;
            this.sidePanel_Right.spriteFrame = this.common;
        }
    }

    show() {
        super.show();

        this.refresh();
    }


    onEventBtnClick(index: number) {
        this.eventPopups[index].show();
    }


    unlockPlay() {
        this.refresh();

        this.playBtn.node.active = true;
    }
}


