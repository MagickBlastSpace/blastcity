declare const gamepush: any;

import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIMyClanFrame')
export class UIMyClanFrame extends UIPopupFrameBase {

    @property(Button)
    showInfoBtn: Button = null;

    @property(Label)
    clanName: Label = null;

    @property(Button)
    openChatBtn: Button = null;
    @property(Button)
    askForEnergyBtn: Button = null;

    private data: ClanData = null;


    start() {
        this.showInfoBtn.node.on(Button.EventType.CLICK, this.showInfo, this);

        this.openChatBtn.node.on(Button.EventType.CLICK, this.openChat, this);
        this.askForEnergyBtn.node.on(Button.EventType.CLICK, this.askForEnergy, this);
    }

    refresh(data: ClanData) {
        this.data = data;

        this.clanName.string = data.clanName;
    }


    showInfo() {
        this.node.emit("show_info", this.data);
    }


    openChat() {
        gamepush.channels.openChat({ id: this.data.clanId });
    }

    askForEnergy() {}
}


