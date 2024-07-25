declare const gamepush: any;

import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIEnergyRefill')
export class UIEnergyRefill extends UIPopupFrameBase {

    @property(Button)
    refillBtn: Button = null;


    start() {
        this.refillBtn.node.on(Button.EventType.CLICK, this.onRefillBtnClick, this);
    }


    async onRefillBtnClick() {
        gamepush.player.set('energy', gamepush.player.getMaxValue('energy'));
    
        await gamepush.player.sync();
    
        UserData.instance.subResource("gold", 1000);

        this.hide();
    }
}


