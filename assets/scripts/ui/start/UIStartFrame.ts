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

    @property(Field)
    field: Field = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.refresh();
    }

    onPlayBtnClick() {
        try {
            this.field.spawnInitialBoard(GameData.instance.levels[UserData.instance.getProgress()]);

            this.hide();
        }
        catch (error) {
            console.log(error);
        }
    }


    refresh() {
        console.log("user data refresh");
        let levelData = GameData.instance.levels[UserData.instance.getProgress()];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        this.difficultyLabel.string = levelData ? "Difficulty\n" + levelData.difficulty : "Difficulty\nCommon";
    }

    show() {
        super.show();

        this.refresh();
    }
}


