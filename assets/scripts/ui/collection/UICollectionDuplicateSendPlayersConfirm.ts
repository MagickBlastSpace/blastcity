import { _decorator, Component, Node, Button, Label, Sprite, SpriteFrame } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { CollectionCardData } from '../../data/CollectionData';
import { UICollectionCard } from './UICollectionCard';
import { Net } from '../../net/Net';
import { Profile } from '../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateSendPlayersConfirm')
export class UICollectionDuplicateSendPlayersConfirm extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    sendBtn: Button = null;

    @property(UICollectionCard)
    card: UICollectionCard;

    @property(Label)
    nickName: Label = null;
    /*@property(Label)
    sendLabel: Label = null;*/

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;
    @property(Sprite)
    badge: Sprite = null;

    private playerId: number = 0;


    start() {
        this.sendBtn.node.on(Button.EventType.CLICK, this.onSendBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    init(card: CollectionCardData, collectionId: string, playerId: number) {
        this.playerId = playerId;

        this.card.init(collectionId, card, true, 0);

        this.loadAvatar(playerId);
    }

    onSendBtnClick() {
        this.node.emit("send", this.playerId)
    }

    onCloseBtnClick() {
        this.hide();
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


