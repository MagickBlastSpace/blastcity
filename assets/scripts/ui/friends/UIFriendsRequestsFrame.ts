declare const gamepush: any;

import { _decorator, Component, Node, Button, instantiate, Prefab } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIFriendsRequestItem } from './UIFriendsRequestItem';
const { ccclass, property } = _decorator;

@ccclass('UIFriendsRequestsFrame')
export class UIFriendsRequestsFrame extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(Node)
    itemsLayout: Node = null;

    @property(Prefab)
    requestPrefab: Prefab = null;
    @property([UIFriendsRequestItem])
    requests: UIFriendsRequestItem[] = [];


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        gamepush.channels.on('event:message', (message) => {
            if(message.target === "PERSONAL" && message.tags.includes("friend_request")) {
                this.spawnRequestItem(message);
            }
        });
    }


    show() {
        super.show();

        this.refresh();
    }

    hide() {
        super.hide();

        for(let i = this.requests.length - 1; i >= 0; i--) {
            if(this.requests[i] && this.requests[i].node) {
                this.requests[i].node.destroy();
            }
        }

        this.requests = [];
    }

    refresh() {
        this.checkForFriendsRequests();
    }

    
    onCloseBtnClick() {
        this.hide();
    }


    async checkForFriendsRequests() {
        const response = await gamepush.channels.fetchPersonalMessages({
            //playerId: this.friendsList[i],
            tags: ['friend_request'],
            limit: 100,
            offset: 0,
        });

        response.items.forEach((message) => {
            this.spawnRequestItem(message);
        });
    }


    spawnRequestItem(message: any) {
        const itemNode = instantiate(this.requestPrefab);
        this.itemsLayout.addChild(itemNode);
            
        let item = itemNode.getComponent("UIFriendsRequestItem");
            
        this.requests.push(item);

        item.init(message);
    }
}


