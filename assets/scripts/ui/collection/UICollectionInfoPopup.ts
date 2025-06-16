import { _decorator, Component, Node, Button, Label, ProgressBar, tween, Sprite, SpriteFrame } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { CollectionCardData, CollectionData } from '../../data/CollectionData';
import { UICollectionCard } from './UICollectionCard';
import { EventBase } from '../../game/events/EventBase';
import { UICollectionDuplicateSend } from './UICollectionDuplicateSend';
const { ccclass, property } = _decorator;

@ccclass('UICollectionInfoPopup')
export class UICollectionInfoPopup extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

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

    @property([UICollectionCard])
    cards: UICollectionCard[] = [];

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(UICollectionDuplicateSend)
    sendPopup: UICollectionDuplicateSend;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        for(let i = 0; i < this.cards.length; i++) {
            this.cards[i].node.on("send", (collectionId, data, isCollected, duplicates) => this.showSendPopup(collectionId, data, isCollected, duplicates));
        }

        this.sendPopup.node.on("send", (player, card) => this.sendCard(player, card));
    }

    init(data: CollectionData, controller: EventBase) {
        this.name_.string = data.name_;

        this.progress.string = controller.getProgressByCollectionId(data.id) + "/" + data.cards.length;

        const season_Prefix = controller.getSeasonPrefix();

        for(let i = 0; i < this.cards.length && i < data.cards.length; i++) {
            let isCollected = controller.isCollected(data.cards[i].id);
            let duplicates = controller.getDuplicatesCountById(data.cards[i].id);

            this.cards[i].init(season_Prefix + data.id, data.cards[i], isCollected, duplicates);
        }

        let progressValue = controller.getProgressByCollectionId(data.id) / data.cards.length;
        
        if(this.progressBar) {
            tween(this.progressBar)
                .to(0.8, { progress: progressValue })
                .start();
        }

        this.rewardLabel.string = "";

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
    }
}


