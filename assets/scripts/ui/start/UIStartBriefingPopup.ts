import { _decorator, Component, Node, Label, Button } from 'cc';
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
        let levelData = GameData.instance.levels[UserData.instance.getProgress()];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        this.difficultyLabel.string = levelData ? levelData.difficulty + " Difficulty" : "Common Difficulty";
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
        }
        catch (error) {
            console.log(error);
        }
    }
}


