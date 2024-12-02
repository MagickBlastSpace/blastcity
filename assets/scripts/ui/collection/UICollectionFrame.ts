import { _decorator, Component, Node, Prefab, Label, instantiate } from 'cc';
import { UIEventPopupFrameBase } from '../events/UIEventPopupFrameBase';
import { UICollectionItem } from './UICollectionItem';
import { CollectionData } from '../../data/CollectionData';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionFrame')
export class UICollectionFrame extends UIEventPopupFrameBase {

    @property(Label)
    timeLabel: Label = null;

    @property([UICollectionItem])
    items: UICollectionItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    itemsLayout: Node = null;

    @property(UIFrameBase)
    collectionInfoPopup: UIFrameBase;


    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.init(this.eventController);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("click", (data) => this.showCollection(data));
        }
    }

    update(deltaTime: number) {
        if(!this.node.active) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        let data = this.eventController.getCollections();

        for(let i = 0; i < data.length; i++) {

            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.itemsLayout.addChild(itemNode);
        
                let item = itemNode.getComponent("UICollectionItem");

                itemNode.on("click", (data) => this.showCollection(data));
        
                this.items.push(item);
            }

            this.items[i].refresh(data[i], this.eventController.getProgressByCollectionId(data[i].id));
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    getRemainingTimeString(): string {
        return this.eventController.getRemainingTimeString();
    }


    showCollection(collection: CollectionData) {
        this.collectionInfoPopup.init(collection, this.eventController);

        this.collectionInfoPopup.show();
    }
}


