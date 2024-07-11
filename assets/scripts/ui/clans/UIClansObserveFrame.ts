import { _decorator, Component, Node, instantiate, Prefab } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIClanItem } from './UIClanItem';
const { ccclass, property } = _decorator;

@ccclass('UIClansObserveFrame')
export class UIClansObserveFrame extends UIPopupFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];


    start() {}


    refresh(data: ClanData[]) {
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = false;
        }

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                this.spawnItem();
            }

            this.items[i].node.active = true;
            this.items[i].init(data[i]);
        }
    }


    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("show_info", (data) => this.showClanInfo(data));

        this.itemsLayout.addChild(itemNode);

        let item = itemNode.getComponent("UIClanItem");

        this.items.push(item);
    }


    join(id: number) {
        this.clans.joinClan(id);
    }

    leave(id: number) {
        this.clans.leaveClan(id);
    }


    showClanInfo(data: ClanData) {
        this.node.emit("show_info", data);
    }
}


