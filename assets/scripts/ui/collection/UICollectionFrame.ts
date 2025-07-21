import { _decorator, Component, Node, Prefab, Label, instantiate, ProgressBar, tween, Button, Sprite, SpriteFrame } from 'cc';
import { UIEventPopupFrameBase } from '../events/UIEventPopupFrameBase';
import { UICollectionItem } from './UICollectionItem';
import { CollectionData } from '../../data/CollectionData';
import { UIFrameBase } from '../UIFrameBase';
import { UICollectionDuplicateExchange } from './UICollectionDuplicateExchange';
import { UIEventButton } from '../start/UIEventButton';
import { UICollectionCardRecievePopup } from './UICollectionCardRecievePopup';
import { UserData } from '../../data/UserData';
import { UIEventTutorialPopup } from '../tutorial/UIEventTutorialPopup';
const { ccclass, property } = _decorator;

@ccclass('UICollectionFrame')
export class UICollectionFrame extends UIEventPopupFrameBase {

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    progress: Label = null;

    @property(Label)
    mainReward_1: Label = null;
    @property(Label)
    mainReward_2: Label = null;

    @property(Sprite)
    badge: Sprite = null;

    @property([SpriteFrame])
    sw_badges: SpriteFrame[] = [];
    @property([SpriteFrame])
    as_badges: SpriteFrame[] = [];

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

    @property(Node)
    commonInfoPopup: Node = null;
    @property([Node])
    rewardPopups: Node[] = [];

    @property(Button)
    commonInfoBtn: Button = null;
    @property(Button)
    rewardInfoBtn: Button = null;

    @property([UIEventButton])
    eventBtns: UIEventButton[] = [];

    @property(Button)
    badgeInfoBtn: Button = null;

    @property([UIEventTutorialPopup])
    badgeInfoPopups: UIEventTutorialPopup[] = [];


    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.init(this.eventController);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("click", (data) => this.showCollection(data, i));
            this.items[i].node.on("reward", (data) => this.onReward(data));
        }

        this.collectionInfoPopup.node.on("send", (player, card) => this.sendCard(player, card));
        this.collectionInfoPopup.node.on("check", (card) => this.checkCard(card));

        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
        this.openExchangeBtn.node.on(Button.EventType.CLICK, this.onOpenExchangeBtnClick, this);

        this.duplicateExchange.node.on("exchange", (data) => this.exchangeDuplicates(data));

        this.commonInfoBtn.node.on(Button.EventType.CLICK, this.onCommonInfoBtnClick, this);
        this.rewardInfoBtn.node.on(Button.EventType.CLICK, this.onRewardInfoBtnClick, this);

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].node.on("click", () => this.onEventBtnClick(i), this);
            //this.eventBtns[i].node.on("play", () => this.onEventPlay());
            //this.eventBtns[i].node.on("event_play", () => this.onEventPlay());
        }

        this.badgeInfoBtn.node.on(Button.EventType.CLICK, this.onBadgeInfoBtnClick, this);
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

                itemNode.on("click", (data) => this.showCollection(data, i));
        
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

        this.duplicateExchange.init(this.eventController.getTotalDuplicatesStars());

        let curStage = this.eventController.getCurrentStage();

        this.mainReward_1.string = curStage === 0 ? "10000" : "15000";
        this.mainReward_2.string = curStage === 0 ? "x10" : "x15";

        let season = this.eventController.getSeasonPrefix();

        if(season === "sw_") {
            this.badge.spriteFrame = this.sw_badges[curStage];
        }
        else {
            this.badge.spriteFrame = this.as_badges[curStage];
        }
        
    }


    show() {
        super.show();

        this.refresh();

        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].refresh();
        }
    }


    getRemainingTimeString(): string {
        return this.eventController.getRemainingTimeString();
    }


    showCollection(collection: CollectionData, pageNumber: number) {
        this.collectionInfoPopup.init(collection, this.eventController, pageNumber);

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


    sendCard(player: string, card: string) {
        this.eventController.sendCard(player, card);
    }


    onCommonInfoBtnClick() {
        this.commonInfoPopup.active = true;
    }

    onRewardInfoBtnClick() {
        let stage = this.eventController.getCurrentStage();

        if(stage < this.rewardPopups.length) {
            this.rewardPopups[stage].active = true;
        }
    }


    checkCard(card: string) {
        this.eventController.checkCard(card);
    }


    onEventBtnClick(index: number) {
        this.hideAllPopups();

        this.eventBtns[index].showEventPrefab();
    }

    hideAllPopups() {
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].hideClean();
        }
    }


    showNextTutorialPage() {}

    onInfoBtnClick() {
        let curStage = this.eventController.getCurrentStage();

        if(curStage === 0) {
            this.infoPopups[0].show();
        }
        else {
            this.infoPopups[1].show();
        }
    }

    onBadgeInfoBtnClick() {
        let curStage = this.eventController.getCurrentStage();

        if(curStage === 0) {
            this.badgeInfoPopups[0].show();
        }
        else {
            this.badgeInfoPopups[1].show();
        }
    }
}


