declare const gamepush: any;

import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { ClanData } from '../../data/ClanData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { Net } from '../../net/Net';
import { UIClanRequestItem } from './UIClanRequestItem';
import { UIClansAskForEnergyItem } from './UIClansAskForEnergyItem';
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
    @property([UIClansAskForEnergyItem])
    helpItems: UIClansAskForEnergyItem[] = [];

    @property(Label)
    cooldownTimeLabel: Label = null;

    private data: ClanData = null;

    private itemsToClean: Node[] = [];


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

            if(message.tags.includes("help")) {
                this.updateHelpProgress(message);
            }
        });

        gamepush.channels.on('fetchJoinRequests', (result) => {
            this.refreshJoinRequests(result.items);
        });

        gamepush.channels.on('event:rejectJoinRequest', (joinRequest) => {
            this.refresh(this.data);
        });

        gamepush.channels.on('event:acceptJoinRequest', (joinRequest) => {
            this.refresh(this.data);
        });

        gamepush.channels.on('event:join', (member) => {
            this.refresh(this.data);
        });

        gamepush.channels.on('event:cancelJoin', (joinRequest) => {
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

        for(let i = this.itemsToClean.length - 1; i >= 0; i--) {
            this.itemsToClean[i].destroy();
        }

        this.itemsToClean = [];
        this.helpItems = []; 

        this.checkForAskEnergyRequests();
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
        // Check if an item with this message ID already exists
        if (this.helpItems.some(item => item.getMessageId() === message.id)) {
            console.warn(`Duplicate message prevented: ${message.id}`);
            return; // Skip duplicate
        }
    
        const itemNode = instantiate(this.itemPrefab);
        this.itemsLayout.addChild(itemNode);
    
        let item = itemNode.getComponent("UIClansAskForEnergyItem");
        item.init(message);
    
        itemNode.on('help', (playerName, messageId) => {
            gamepush.channels.sendMessage({
                channelId: this.data.clanId,
                text: 'Help ' + playerName + ' energy request ' + messageId,
                tags: ['help'],
            });
    
            UserData.instance.addHelpedMessageId(messageId);
        });
    
        item.refreshAvailability(UserData.instance.isHelped(message.id));
    
        this.checkAuthor(message.authorId);

        this.helpItems.push(item);
        this.itemsToClean.push(itemNode);
    }

    checkAuthor(id: number) {
        for(let i = 0; i < this.helpItems.length; i++) {
            if(this.helpItems[i].getPlayerId() === id) {
                gamepush.channels.deleteMessage({ messageId: this.helpItems[i].getMessageId() });
                this.helpItems[i].node.active = false;
            }
        }
    }


    updateHelpProgress(message: any) {
        const parts = message.text.split(" ");
        const id = parts[parts.length - 1];

        console.log("update help progress: " + id);

        for(let i = 0; i < this.helpItems.length; i++) {
            if(this.helpItems[i].getMessageId() === id) {
                this.helpItems[i].addHelpProgress();
            }
        }
    }


    spawnRequestItem() {
        const itemNode = instantiate(this.requestPrefab);
        this.itemsLayout.addChild(itemNode);
            
        let item = itemNode.getComponent("UIClanRequestItem");
            
        this.requests.push(item);
    }


    async checkForAskEnergyRequests() {

        const response = await gamepush.channels.fetchMessages({
            channelId: this.data.clanId,
            tags: ['ask_for_energy'],
            limit: 50,
            offset: 0,
        });
    
        // Track existing message IDs to prevent duplicates
        const existingIds = new Set<string>();
    
        response.items.forEach((message) => {
            if (!existingIds.has(message.id)) {
                existingIds.add(message.id);
                this.spawnAskForEnergyItem(message);
            }
        });
    
        // Fetch help messages
        const response2 = await gamepush.channels.fetchMessages({
            channelId: this.data.clanId,
            tags: ['help'],
            limit: 200,
            offset: 0,
        });
    
        response2.items.forEach((message) => {
            this.updateHelpProgress(message);
        });
    }
}


