import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { CollectionData } from '../../data/CollectionData';
import { UICollectionCard } from './UICollectionCard';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionInfoPopup')
export class UICollectionInfoPopup extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    name_: Label = null;
    @property(Label)
    progress: Label = null;

    @property([UICollectionCard])
    cards: UICollectionCard[] = [];


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    init(data: CollectionData, controller: EventBase) {
        this.name_.string = data.name_;

        this.progress.string = controller.getProgressByCollectionId(data.id) + "/" + data.cards.length;

        for(let i = 0; i < this.cards.length && i < data.cards.length; i++) {
            let isCollected = controller.isCollected(data.cards[i].id);
            let duplicates = controller.getDuplicatesCountById(data.cards[i].id);

            this.cards[i].init(data.cards[i], isCollected, duplicates);
        }
    }


    onCloseBtnClick() {
        this.hide();
    }
}


