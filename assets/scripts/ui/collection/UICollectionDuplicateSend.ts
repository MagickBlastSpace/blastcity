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

    private data: CollectionCardData;


    start() {
        this.sendBtn.node.on(Button.EventType.CLICK, this.onSendBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.playersPopup.node.on("profile", (data) => this.sendCard(data));
    }

    init(collectionId: string, data: CollectionCardData, isCollected: boolean, duplicates: number) {
        this.data = data;

        this.card.init(collectionId, data, isCollected, duplicates);

        this.sendBtn.node.active = duplicates > 0;
    }


    onSendBtnClick() {
        this.playersPopup.show();
    }

    onCloseBtnClick() {
        this.hide();
    }

    sendCard(playerId: number) {
        this.node.emit("send", playerId, this.data.id);

        this.hide();
    }
}


