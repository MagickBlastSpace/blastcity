import { _decorator, Node, instantiate, Prefab, Layout, ScrollView } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIClanItem } from './UIClanItem';
import { UIClanItemAdaptivity } from './UIClanItemAdaptivity';
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


    refresh(data: ClanData[]) {
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = false;
        }

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                this.spawnItem();
            }

            const item = this.items[i];

            item.node.active = true;
            item.init(data[i]);

            const adaptivity = item.getComponent(UIClanItemAdaptivity);

            if(adaptivity) {
                adaptivity.refresh();
            }
        }

        this.updateLayout();

        this.scheduleOnce(() => {
            if(!this.node.activeInHierarchy) {
                return;
            }

            for(let i = 0; i < this.items.length; i++) {
                if(!this.items[i].node.active) {
                    continue;
                }

                const adaptivity = this.items[i].getComponent(UIClanItemAdaptivity);

                if(adaptivity) {
                    adaptivity.refresh();
                }
            }

            this.updateLayout();
            this.scrollView.stopAutoScroll();
            this.scrollView.scrollToTop(0);
        }, 0);
    }


    private updateLayout() {
        const layout = this.itemsLayout.getComponent(Layout);

        if(layout) {
            layout.affectedByScale = true;
            layout.updateLayout();
        }
    }


    spawnItem() {
        const itemNode = instantiate(this.itemPrefab);

        itemNode.on("show_info", (data) => this.showClanInfo(data));

        this.itemsLayout.addChild(itemNode);

        const item = itemNode.getComponent(UIClanItem);

        this.items.push(item);

        console.log("[CLANS OBSERVE] spawned", itemNode.name, "parent =", this.itemsLayout.name);
    }


    showClanInfo(data: ClanData) {
        this.node.emit("show_info", data);
    }
}