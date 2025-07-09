import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UICollectionCard } from './UICollectionCard';
import { Profile } from '../../game/Profile';
import { Net } from '../../net/Net';
import { CollectionCardData } from '../../data/CollectionData';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionCardRecievePopup')
export class UICollectionCardRecievePopup extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(UICollectionCard)
    card: UICollectionCard;

    @property(Label)
    nickName: Label = null;

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;
    @property(Sprite)
    badge: Sprite = null;

    @property(EventBase)
    controller: EventBase = null;

    private cardId: string = "";


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    init(cardId: string, playerId: number) {
        this.cardId = cardId;

        let card = this.controller.findCardDataByCard(cardId);
        let collectionId = this.controller.findCollectionIdByCard(cardId);

        const season_Prefix = this.controller.getSeasonPrefix();

        this.card.init(season_Prefix + collectionId, card, true, 0);

        this.loadAvatar(playerId);
    }


    onCloseBtnClick() {
        this.hideClean();

        this.node.emit("check", this.cardId);
    }


    async loadAvatar(id: number) {
        if(id === 0) {
            return;
        }
        
        try {
            let ids = [id];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                this.avatar.spriteFrame = Profile.instance.getAvatarById(players[0].state["avatar_id"]);
                this.nickName.string = players[0].state["name"];
                this.frame.spriteFrame = Profile.instance.getFrameById(players[0].state["frame_id"]);
                this.badge.spriteFrame = Profile.instance.getBadgeById(players[0].state["badge_id"]);
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }
}


