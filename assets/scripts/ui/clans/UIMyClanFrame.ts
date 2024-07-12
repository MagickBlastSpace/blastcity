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

    private data: ClanData = null;


    start() {
        this.showInfoBtn.node.on(Button.EventType.CLICK, this.showInfo, this);
    }

    refresh(data: ClanData) {
        this.data = data;

        this.clanName.string = data.clanName;
    }


    showInfo() {
        this.node.emit("show_info", this.data);
    }
}


