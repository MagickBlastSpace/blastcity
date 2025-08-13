import { _decorator, Component, Node, Button, Label, ProgressBar, tween, Sprite, SpriteFrame, assetManager, UIOpacity } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { CollectionCardData, CollectionData } from '../../data/CollectionData';
import { UICollectionCard } from './UICollectionCard';
import { EventBase } from '../../game/events/EventBase';
import { UICollectionDuplicateSend } from './UICollectionDuplicateSend';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UICollectionInfoPopup')
export class UICollectionInfoPopup extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(Button)
    nextBtn: Button = null;
    @property(Button)
    prevBtn: Button = null;

    @property(Label)
    pageLabel: Label = null;

    @property(Label)
    name_: Label = null;
    @property(Label)
    progress: Label = null;

    @property(Label)
    rewardLabel: Label = null;
    @property(Sprite)
    rewardIcon: Sprite = null;

    @property(SpriteFrame)
    gold: SpriteFrame = null;
    @property(SpriteFrame)
    rocket: SpriteFrame = null;
    @property(SpriteFrame)
    bomb: SpriteFrame = null;
    @property(SpriteFrame)
    discoball: SpriteFrame = null;
    @property(SpriteFrame)
    hammer: SpriteFrame = null;
    @property(SpriteFrame)
    cannon: SpriteFrame = null;
    @property(SpriteFrame)
    bow: SpriteFrame = null;
    @property(SpriteFrame)
    jester: SpriteFrame = null;
    @property(SpriteFrame)
    x2: SpriteFrame = null;
    @property(SpriteFrame)
    lives: SpriteFrame = null;

    @property(Sprite)
    bg: Sprite = null;

    @property([UICollectionCard])
    cards: UICollectionCard[] = [];

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Node)
    progressNode: Node = null;
    @property(Node)
    complete: Node = null;

    @property(UICollectionDuplicateSend)
    sendPopup: UICollectionDuplicateSend;

    @property(Label)
    cardSendText: Label = null;

    private curPage: number = 0;

    private collections: CollectionData[] = [];

    private eventController: EventBase;

    private collectionId: string = "";


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.nextBtn.node.on(Button.EventType.CLICK, this.onNextBtnClick, this);
        this.prevBtn.node.on(Button.EventType.CLICK, this.onPrevBtnClick, this);

        for(let i = 0; i < this.cards.length; i++) {
            this.cards[i].node.on("send", (collectionId, data, isCollected, duplicates) => this.showSendPopup(collectionId, data, isCollected, duplicates));
        }

        this.sendPopup.node.on("send", (player, card) => this.sendCard(player, card));
    }

    init(data: CollectionData, controller: EventBase, pageNumber: number) {
        this.collectionId = data.id;
        this.name_.string = data.name_;

        this.eventController = controller;

        this.curPage = pageNumber;
        this.collections = this.eventController.getCollections();

        this.pageLabel.string = (this.curPage + 1) + "/" + this.collections.length;

        this.progress.string = controller.getProgressByCollectionId(data.id) + "/" + data.cards.length;

        const season_Prefix = controller.getSeasonPrefix();

        for(let i = 0; i < this.cards.length && i < data.cards.length; i++) {
            let isCollected = controller.isCollected(data.cards[i].id);
            let duplicates = controller.getDuplicatesCountById(data.cards[i].id);

            let isNew = controller.isCardUnchecked(data.cards[i].id);

            this.cards[i].init(season_Prefix + data.id, data.cards[i], isCollected, duplicates);
            this.cards[i].setNewMarker(isNew);
        }

        let progressValue = controller.getProgressByCollectionId(data.id) / data.cards.length;
        
        this.progressBar.progress = progressValue;
        /*if(this.progressBar) {
            tween(this.progressBar)
                .to(0.8, { progress: progressValue })
                .start();
        }*/

        this.rewardLabel.string = "";

        this.name_.string = Localization.instance.getLabelByKey("collection_data." + season_Prefix + data.id);

        this.complete.active = controller.isCollectionComplete(data.id);
        this.progressNode.active = !controller.isCollectionComplete(data.id);

        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
                this.rewardLabel.string = data.rewards[0].gold;
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].gold;
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].startBonus_Rocket;
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].startBonus_Discoball;
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
                this.rewardLabel.string = data.rewards[0].booster_Hammer;
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
                this.rewardLabel.string = data.rewards[0].booster_Bow;
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
                this.rewardLabel.string = data.rewards[0].booster_Cannon;
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
                this.rewardLabel.string = data.rewards[0].booster_Jester;
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].bomb_Minutes + " Min";
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].rocket_Minutes + " Min";
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].discoball_Minutes + " Min";
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
                this.rewardLabel.string = data.rewards[0].endlessLives_Minutes + " Min";
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
                this.rewardLabel.string = data.rewards[0].modifierX2_Minutes + " Min";
            }
        }

        const parts = data.id.split("_");
        const colNum = parts[parts.length - 1];

        this.eventController.checkCollection(this.collectionId);

        assetManager.loadBundle("collection_bg", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: collection_bg`, err);
                return;
            }

            console.log(`Successfully loaded bundle: collection_bg`);

            bundle.load("bg_" + colNum + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: ` + "bg_" + colNum, err);
                    return;
                }

                console.log(`Successfully loaded prefab: ` + "bg_" + colNum);

                this.bg.spriteFrame = spriteFrame;
            });
        });
    }


    onCloseBtnClick() {
        this.hide();
    }


    showSendPopup(collectionId: string, data: CollectionCardData, isCollected: boolean, duplicates: number) {
        this.sendPopup.init(collectionId, data, isCollected, duplicates);

        this.sendPopup.show();

        this.node.emit("check", data.id);
    }

    sendCard(player: number, card: string) {
        this.node.emit("send", player, card);

        this.showCardSendTextWithFade();

        this.init(this.collections[this.curPage], this.eventController, this.curPage);
    }


    show() {
        super.show();
    }

    hide() {
        super.hide();
    }


    onNextBtnClick() {
        if(this.curPage >= this.collections.length - 1) {
            return;
        }

        this.curPage = this.curPage + 1;

        this.init(this.collections[this.curPage], this.eventController, this.curPage);
    }

    onPrevBtnClick() {
        if(this.curPage <= 0) {
            return;
        }

        this.curPage = this.curPage - 1;

        this.init(this.collections[this.curPage], this.eventController, this.curPage);
    }


    showCardSendTextWithFade() {
        const durationFade = 0.5;
        const holdTime = 3.0;

        const uiOpacity = this.cardSendText.getComponent(UIOpacity) 
            || this.cardSendText.addComponent(UIOpacity);

        uiOpacity.opacity = 0;

        tween(uiOpacity)
            .to(durationFade, { opacity: 255 })         
            .delay(holdTime)                            
            .to(durationFade, { opacity: 0 })           
            .start();
    }
}


