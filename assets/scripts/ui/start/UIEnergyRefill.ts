declare const gamepush: any;

import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIEnergyRefill')
export class UIEnergyRefill extends UIPopupFrameBase {

    @property(Button)
    refillBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    private isRefilling: boolean = false;


    start() {
        this.refillBtn.node.on(Button.EventType.CLICK, this.onRefillBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.isRefilling = false;
    }


    async onRefillBtnClick() {
        this.isRefilling = true;

        gamepush.player.set('energy', gamepush.player.getMaxValue('energy'));
    
        await gamepush.player.sync();
    
        UserData.instance.subResource("gold", 1000);

        this.isRefilling = false;

        this.hide();
    }


    onCloseBtnClick() {
        if(this.isRefilling) {
            return;
        }
        
        this.hide();
    }
}


