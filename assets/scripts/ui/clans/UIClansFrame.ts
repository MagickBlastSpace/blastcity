import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Clans } from '../../game/Clans';
import { UIClanItem } from './UIClanItem';
import { UIFrameBase } from '../UIFrameBase';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIClansFrame')
export class UIClansFrame extends UIFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];

    @property(Button)
    createBtn: Button = null;

    @property(Clans)
    clans: Clans = null;


    start() {
        this.clans.node.on("refresh", (clansData) => this.refresh(clansData));

        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);
    }


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

        this.createBtn.node.active = !this.clans.isJoined();
    }

    show() {
        super.show();

        this.createBtn.node.active = false;

        this.clans.refresh();
    }


    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("join", (id) => this.join(id));
        itemNode.on("leave", (id) => this.leave(id));

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


    onCreateBtnClick() {
        this.clans.createClan();
    }
}


