import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { CollectionCardData } from '../../data/CollectionData';
import { UICollectionCard } from './UICollectionCard';
import { UICollectionDuplicateSendPlayers } from './UICollectionDuplicateSendPlayers';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateSend')
export class UICollectionDuplicateSend extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(Button)
    sendBtn: Button = null;

    @property(UICollectionCard)
    card: UICollectionCard;

    @property(UICollectionDuplicateSendPlayers)
    playersPopup: UICollectionDuplicateSendPlayers;

    @property(Node)
    silver_not_collected: Node = null;
    @property(Node)
    silver_single: Node = null;
    @property(Node)
    silver_collected: Node = null;

    @property(Node)
    gold_not_collected: Node = null;
    @property(Node)
    gold_collected: Node = null;

    private data: CollectionCardData;

    private colId: string;


    start() {
        this.sendBtn.node.on(Button.EventType.CLICK, this.onSendBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.playersPopup.node.on("profile", (data) => this.sendCard(data));
    }

    init(collectionId: string, data: CollectionCardData, isCollected: boolean, duplicates: number) {
        this.data = data;
        this.colId = collectionId;

        this.card.init(collectionId, data, isCollected, duplicates);

        //this.sendBtn.node.active = duplicates > 0;
        this.silver_not_collected.active = !isCollected && data.type === "silver";
        this.silver_single.active = isCollected && duplicates === 0 && data.type === "silver";
        this.silver_collected.active = isCollected && duplicates > 0 && data.type === "silver";

        this.gold_not_collected.active = !isCollected && data.type === "gold";
        this.gold_collected.active = isCollected && data.type === "gold";
    }


    onSendBtnClick() {
        this.playersPopup.show();

        this.playersPopup.init(this.data, this.colId);
    }

    onCloseBtnClick() {
        this.hide();
    }

    sendCard(playerId: number) {
        this.node.emit("send", playerId, this.data.id);

        this.hide();
    }


    show() {
        super.show();

        this.playersPopup.hideClean();
    }
}


