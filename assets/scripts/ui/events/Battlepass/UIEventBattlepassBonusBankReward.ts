import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassBonusBankReward')
export class UIEventBattlepassBonusBankReward extends UIPopupFrameBase {

    @property(Label)
    gold: Label = null;

    @property(Button)
    tapBtn: Button = null;


    init(count: number) {
        this.gold.string = count;
        
        this.tapBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    onCloseBtnClick() {
        this.hide();
    }
}


