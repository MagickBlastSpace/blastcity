import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { Field } from '../../game/Field';
import { StartBonuses } from '../../game/boosters/StartBonuses';
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
        let levelData = GameData.instance.levels[UserData.instance.getProgress()];

        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;

        this.difficultyLabel.string = "Difficulty\n" + levelData.difficulty;
    }

    show() {
        super.show();

        this.refresh();
    }
}


