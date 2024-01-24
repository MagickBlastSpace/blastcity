import { _decorator, Component, Node, Label } from 'cc';
import { UIStartFrame } from '../start/UIStartFrame';
const { ccclass, property } = _decorator;

@ccclass('UILevelResultFrame')
export class UILevelResultFrame extends UIStartFrame {

    @property(Label)
    resultLabel: Label = null;

    @property(Label)
    buttonLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    refresh(isSuccess: boolean, goldEarned: number) {
        this.resultLabel.string = isSuccess ? "Level Complete" : "Level Failed";
        this.buttonLabel.string = isSuccess ? "Next" : "Replay";
        this.goldLabel.string = goldEarned > 0 ? "Gold earned: " + goldEarned : "";
    }
}


