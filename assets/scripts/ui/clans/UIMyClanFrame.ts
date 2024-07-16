declare const gamepush: any;

import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
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

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    private data: ClanData = null;


    start() {
        this.showInfoBtn.node.on(Button.EventType.CLICK, this.showInfo, this);

        this.openChatBtn.node.on(Button.EventType.CLICK, this.openChat, this);
        this.askForEnergyBtn.node.on(Button.EventType.CLICK, this.askForEnergy, this);

        gamepush.channels.on('event:message', (message) => {
            if(message.channelId !== this.data.clanId) {
                return;
            }

            if(message.tags.includes("ask_for_energy")) {
                this.spawnAskForEnergyItem(message);
            }
        });

        gamepush.channels.on('sendMessage', (message) => {
            if(message.channelId !== this.data.clanId) {
                return;
            }

            if(message.tags.includes("ask_for_energy")) {
                this.spawnAskForEnergyItem(message);
            }
        });
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

    askForEnergy() {
        gamepush.channels.sendMessage({
            channelId: this.data.clanId,
            text: 'Asking for energy',
            tags: ['ask_for_energy'],
        });

        this.askForEnergyBtn.node.active = false; //TBD Timing
    }

    spawnAskForEnergyItem(message: any) {
        const itemNode = instantiate(this.itemPrefab);
        this.itemsLayout.addChild(itemNode);
            
        let item = itemNode.getComponent("UIClansAskForEnergyItem");
            
        item.init(message);
    }
}


