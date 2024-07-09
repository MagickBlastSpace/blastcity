import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Clans } from '../../game/Clans';
import { UIClanItem } from './UIClanItem';
import { UIFrameBase } from '../UIFrameBase';
import { ClanData } from '../../data/ClanData';
import { UIClanInfoPopup } from './UIClanInfoPopup';
const { ccclass, property } = _decorator;

@ccclass('UIClansFrame')
export class UIClansFrame extends UIFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];

    @property(UIClanInfoPopup)
    clanInfoPopup: UIClanInfoPopup = null;

    @property(Button)
    createBtn: Button = null;

    @property(Clans)
    clans: Clans = null;


    start() {
        this.clans.node.on("refresh", (clansData) => this.refresh(clansData));

        this.createBtn.node.on(Button.EventType.CLICK, this.onCreateBtnClick, this);

        this.clanInfoPopup.node.on("join", (id) => this.join(id));
        this.clanInfoPopup.node.on("leave", (id) => this.leave(id));
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

        this.clanInfoPopup.init(data);
        this.clanInfoPopup.refresh();
    }

    show() {
        super.show();

        this.createBtn.node.active = false;

        this.clans.refresh();
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


    onCreateBtnClick() {
        this.clans.createClan();
    }


    showClanInfo(data: ClanData) {
        if(this.clanInfoPopup.node.active) {
            return;
        }

        this.clanInfoPopup.init(data);

        this.clanInfoPopup.show();
    }
}


