import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { Field } from '../../game/Field';
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

    @property(Field)
    field: Field = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());

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
        try {
            let levelsCount = GameData.instance.levels.length;
            this.field.spawnInitialBoard(GameData.instance.levels[UserData.instance.getProgress() % levelsCount]);

            this.hide();
        }
        catch (error) {
            console.log(error);
        }
    }


    refresh() {
        let levelData = GameData.instance.levels[UserData.instance.getProgress()];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        this.difficultyLabel.string = levelData ? "Difficulty\n" + levelData.difficulty : "Difficulty\nCommon";
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


