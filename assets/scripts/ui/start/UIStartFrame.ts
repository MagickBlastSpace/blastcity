import { _decorator, Component, Node, Button } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { Field } from '../../game/Field';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrame')
export class UIStartFrame extends UIFrameBase {

    @property(Button)
    playBtn: Button = null;

    @property(Field)
    field: Field = null;


    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
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
}


