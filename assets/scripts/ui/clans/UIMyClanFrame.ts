declare const gamepush: any;

import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { ClanData } from '../../data/ClanData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { Net } from '../../net/Net';
import { UIClanRequestItem } from './UIClanRequestItem';
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

    @property(Prefab)
    requestPrefab: Prefab = null;
    @property([UIClanRequestItem])
    requests: UIClanRequestItem[] = [];

    @property(Label)
    cooldownTimeLabel: Label = null;

    private data: ClanData = null;


    start() {
        this.showInfoBtn.node.on(Button.EventType.CLICK, this.showInfo, this);

        this.openChatBtn.node.on(Button.EventType.CLICK, this.openChat, this);
        this.askForEnergyBtn.node.on(Button.EventType.CLICK, this.askForEnergy, this);

        gamepush.channels.on('event:message', (message) => {
            console.log("event message: " + message.text + message.tags[0]);

            if(message.channelId !== this.data.clanId) {
                return;
            }

            if(message.tags.includes("ask_for_energy")) {
                this.spawnAskForEnergyItem(message);
            }
        });

        gamepush.channels.on('fetchJoinRequests', (result) => {
            this.refreshJoinRequests(result.items);
        });

        gamepush.channels.on('event:rejectJoinRequest', (joinRequest) => {
            if(this.data.clanId !== joinRequest.channelId) {
                return;
            }
            
            this.refresh(this.data);
        });

        gamepush.channels.on('event:acceptJoinRequest', (joinRequest) => {
            if(this.data.clanId !== joinRequest.channelId) {
                return;
            }
            
            this.refresh(this.data);
        });

        gamepush.channels.on('event:join', (member) => {
            if(this.data.clanId !== member.channelId) {
                return;
            }
            
            this.refresh(this.data);
        });

        gamepush.channels.on('event:cancelJoin', (joinRequest) => {
            if(this.data.clanId !== joinRequest.channelId) {
                return;
            }
            
            this.refresh(this.data);
        });
    }

    update(deltaTime: number) {
        if(UserData.instance.isEnergyAskAvailable()) {
            this.askForEnergyBtn.node.active = true;
            this.cooldownTimeLabel.string = "";
        }
        else {
            this.askForEnergyBtn.node.active = false;
            this.cooldownTimeLabel.string = UserData.instance.getEnergyCooldownTimeString();
        }
    }


    refresh(data: ClanData) {
        this.data = data;

        this.clanName.string = data.clanName;

        if(data.ownerId === UserData.instance.getPlayerId()) {
            Net.instance.fetchClanJoinRequests(data.clanId);
        }
    }

    refreshJoinRequests(items: any) {
        for(let i = 0; i < this.requests.length; i++) {
            this.requests[i].node.active = false;
        }

        for(let i = 0; i < items.length; i++) {
            if(i >= this.requests.length) {
                this.spawnRequestItem();
            }

            this.requests[i].node.active = true;
            this.requests[i].init(items[i], this.data.clanId);
        }
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

        UserData.instance.setEnergyAskTimestamp(Date.now());
        SaveData.instance.saveUserData();
    }

    spawnAskForEnergyItem(message: any) {
        const itemNode = instantiate(this.itemPrefab);
        this.itemsLayout.addChild(itemNode);
            
        let item = itemNode.getComponent("UIClansAskForEnergyItem");
            
        item.init(message);
    }

    spawnRequestItem() {
        const itemNode = instantiate(this.requestPrefab);
        this.itemsLayout.addChild(itemNode);
            
        let item = itemNode.getComponent("UIClanRequestItem");
            
        this.requests.push(item);
    }
}


