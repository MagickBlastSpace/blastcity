import { _decorator, Component, Node, Label, Button, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { Field } from '../../game/Field';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('UIStartBriefingPopup')
export class UIStartBriefingPopup extends UIFrameBase {

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

    @property(Field)
    field: Field = null;

    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.hide, this);

        this.refresh();
    }

    refresh() {
        let levelsCount = GameData.instance.levels.length;
        let levelData = GameData.instance.levels[UserData.instance.getProgress() % levelsCount];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        this.difficultyLabel.string = levelData ? levelData.difficulty + " Difficulty" : "Common Difficulty";

        if(levelData.difficulty === "Hard") {
            this.frame.spriteFrame = this.hard;
            this.header.spriteFrame = this.header_hard;
        }
        else if(levelData.difficulty === "SuperHard") {
            this.frame.spriteFrame = this.superHard;
            this.header.spriteFrame = this.header_superHard;
        }
        else {
            this.frame.spriteFrame = this.common;
            this.header.spriteFrame = this.header_common;
        }
    }

    show() {
        super.show();

        this.refresh();
    }


    onPlayBtnClick() {
        try {
            let levelsCount = GameData.instance.levels.length;
            this.field.spawnInitialBoard(GameData.instance.levels[UserData.instance.getProgress() % levelsCount]);

            this.hide();

            this.node.emit("play");
        }
        catch (error) {
            console.log(error);
        }
    }
}


