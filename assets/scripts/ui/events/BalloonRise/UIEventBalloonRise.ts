import { _decorator, Component, Node, Label } from 'cc';
import { UIEventTeamTreasure } from '../TeamTreasure/UIEventTeamTreasure';
const { ccclass, property } = _decorator;

@ccclass('UIEventBalloonRise')
export class UIEventBalloonRise extends UIEventTeamTreasure {

    @property(Label)
    hp: Label = null;


    refresh() {
        super.refresh();

        this.hp.string = "Lives " + this.eventController.getHp();
    }
}


