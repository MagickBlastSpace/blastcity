import { _decorator, Component, Node, Button, Prefab, instantiate, EditBox } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIClanItem } from './UIClanItem';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIClansSearchFrame')
export class UIClansSearchFrame extends UIPopupFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];

    @property(Button)
    searchBtn: Button = null;

    @property(EditBox)
    searchInput: EditBox = null;

    private data: ClanData[] = [];


    start() {
        this.searchBtn.node.on(Button.EventType.CLICK, this.searchClans, this);
    }

    refresh(data: ClanData[]) {
        this.data = data;
    }

    searchClans() {
        const matchingClans = this.findClansBySubstring(this.searchInput.string);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = false;
        }

        for(let i = 0; i < matchingClans.length; i++) {
            if(i >= this.items.length) {
                this.spawnItem();
            }

            this.items[i].node.active = true;
            this.items[i].init(matchingClans[i]);
        }
    }


    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("show_info", (data) => this.showClanInfo(data));

        this.itemsLayout.addChild(itemNode);

        let item = itemNode.getComponent("UIClanItem");

        this.items.push(item);
    }

    showClanInfo(data: ClanData) {
        this.node.emit("show_info", data);
    }


    private findClansBySubstring(substring: string): ClanData[] {
        return this.data.filter(clan => clan.clanName.includes(substring));
    }
}


