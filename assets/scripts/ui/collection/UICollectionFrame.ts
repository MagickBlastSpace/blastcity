import { _decorator, Component, Node, Prefab, Label, instantiate, ProgressBar, tween, Button } from 'cc';
import { UIEventPopupFrameBase } from '../events/UIEventPopupFrameBase';
import { UICollectionItem } from './UICollectionItem';
import { CollectionData } from '../../data/CollectionData';
import { UIFrameBase } from '../UIFrameBase';
import { UICollectionDuplicateExchange } from './UICollectionDuplicateExchange';
const { ccclass, property } = _decorator;

@ccclass('UICollectionFrame')
export class UICollectionFrame extends UIEventPopupFrameBase {

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    progress: Label = null;

    @property([UICollectionItem])
    items: UICollectionItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    itemsLayout: Node = null;

    @property(UIFrameBase)
    collectionInfoPopup: UIFrameBase;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Node)
    isComplete: Node = null;
    @property(Node)
    takeReward: Node = null;
    @property(Button)
    takeRewardBtn: Button = null;

    @property(Button)
    openExchangeBtn: Button = null;

    @property(UICollectionDuplicateExchange)
    duplicateExchange: UICollectionDuplicateExchange;


    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.init(this.eventController);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("click", (data) => this.showCollection(data));
            this.items[i].node.on("reward", (data) => this.onReward(data));
        }

        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
        this.openExchangeBtn.node.on(Button.EventType.CLICK, this.onOpenExchangeBtnClick, this);

        this.duplicateExchange.node.on("exchange", (data) => this.exchangeDuplicates(data));
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

            this.items[i].refresh(data[i], this.eventController.getProgressByCollectionId(data[i].id), this.eventController);
        }

        this.progress.string = this.eventController.getCollectedCardsCount() + "/" + this.eventController.getTotalCardsCount();

        let progressValue = this.eventController.getTotalProgressValue();

        if(this.progressBar) {
            tween(this.progressBar)
                .to(0.8, { progress: progressValue })
                .start();
        }

        this.isComplete.active = this.eventController.isTotalComplete();
        this.takeReward.active = !this.eventController.getIsTotalRewardTaken();

        this.duplicateExchange.init(this.eventController.getTotalDuplicatesStars())
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


    onReward(collection: CollectionData) {
        this.eventController.takeCollectionReward(collection.id);
    }


    onTakeRewardBtnClick() {
        this.eventController.takeTotalReward();
    }

    onOpenExchangeBtnClick() {
        this.duplicateExchange.init(this.eventController.getTotalDuplicatesStars())
        this.duplicateExchange.show();
    }


    exchangeDuplicates(index: number) {
        this.eventController.exchangeDuplicates(index);
    }
}


