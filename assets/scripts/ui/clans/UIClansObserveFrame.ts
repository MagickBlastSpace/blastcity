import { _decorator, Node, instantiate, Prefab, Layout, ScrollView } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIClanItem } from './UIClanItem';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIClansObserveFrame')
export class UIClansObserveFrame extends UIFrameBase {

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;
    @property([UIClanItem])
    items: UIClanItem[] = [];
    @property(ScrollView)
    scrollView: ScrollView = null;


    start() {}


    refresh(data: ClanData[]) {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = false;
        }

        for (let i = 0; i < data.length; i++) {
            if (i >= this.items.length) {
                this.spawnItem();
            }

            this.items[i].node.active = true;
            this.items[i].init(data[i]);
        }

        const layout = this.itemsLayout.getComponent(Layout);

        if (layout) {
            layout.updateLayout();
        }

        this.scrollView.stopAutoScroll();
        this.scrollView.scrollToTop(0);
    }

    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("show_info", (data) => this.showClanInfo(data));

        this.itemsLayout.addChild(itemNode);

        const item = itemNode.getComponent(UIClanItem);

        this.items.push(item);

        console.log(
            "[CLANS OBSERVE] spawned",
            itemNode.name,
            "parent =", this.itemsLayout.name
        );
    }


    showClanInfo(data: ClanData) {
        this.node.emit("show_info", data);
    }
}


