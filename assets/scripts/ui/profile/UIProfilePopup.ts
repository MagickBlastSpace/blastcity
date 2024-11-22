declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, Sprite } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Net } from '../../net/Net';
import { UserData } from '../../data/UserData';
import { UIProfileChangePopup } from './UIProfileChangePopup';
import { Profile } from '../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UIProfilePopup')
export class UIProfilePopup extends UIPopupFrameBase {

    @property(Label)
    clanName: Label = null;
    @property(Label)
    playerName: Label = null;
    @property(Label)
    score: Label = null;

    @property(Button)
    addToFriendsBtn: Button = null;
    @property(Button)
    removeFromFriendsBtn: Button = null;
    @property(Button)
    openChatBtn: Button = null;
    @property(Button)
    changeBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;

    @property(Profile)
    profile: Profile;

    @property(UIProfileChangePopup)
    profileChangePopup: UIProfileChangePopup;

    private playerId: number = 0;


    start() {
        this.addToFriendsBtn.node.on(Button.EventType.CLICK, this.onAddBtnClick, this);
        this.removeFromFriendsBtn.node.on(Button.EventType.CLICK, this.onRemoveBtnClick, this);
        this.openChatBtn.node.on(Button.EventType.CLICK, this.onOpenChatBtnClick, this);
        this.changeBtn.node.on(Button.EventType.CLICK, this.onChangeBtnClick, this);

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.profile.node.on("refresh", () => {
            this.refresh();
        });

        this.profileChangePopup.node.on("refresh", () => {
            this.refresh();
        });
    }


    init(id: number) {
        this.playerId = id;
    }
    
    async refresh() {
        this.playerName.string = "";
        this.clanName.string = "";
        this.score.string = "";

        this.addToFriendsBtn.node.active = false;
        this.removeFromFriendsBtn.node.active = false;
        this.openChatBtn.node.active = false;

        if(!this.playerId || this.playerId === undefined || this.playerId === 0) {
            return;
        }

        this.refreshLocalData();
    
        try {
            let ids = [this.playerId];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                this.playerName.string = players[0].state["name"];
                this.clanName.string = players[0].state["clanname"];
                this.score.string = "Level " + players[0].state["score"];

                let isMe = this.playerId === UserData.instance.getPlayerId();
                if(!isMe) {
                    this.avatar.spriteFrame = this.profile.getAvatarById(players[0].state["avatar_id"]);
                    this.frame.spriteFrame = this.profile.getAvatarById(players[0].state["frame_id"]);
                }
            }
        } catch (error) {
            console.log('Error fetching player profile:', error);
        }
    }

    refreshLocalData() {
        let isFriend = UserData.instance.isFriend(this.playerId);
        let isMe = this.playerId === UserData.instance.getPlayerId();

        this.addToFriendsBtn.node.active = !isFriend && !isMe;
        this.removeFromFriendsBtn.node.active = isFriend && !isMe;
        this.openChatBtn.node.active = !isMe;
        this.changeBtn.node.active = isMe;

        if(isMe) {
            this.avatar.spriteFrame = this.profile.getCurrentAvatar();
            this.frame.spriteFrame = this.profile.getCurrentFrame();
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    onAddBtnClick() {
        if(this.playerId !== 0) {
            UserData.instance.addFriend(this.playerId);
        }
        
        this.refreshLocalData();
    }

    onRemoveBtnClick() {
        UserData.instance.removeFriend(this.playerId);

        this.refreshLocalData();
    }

    onOpenChatBtnClick() {
        gamepush.channels.openPersonalChat({
            playerId: this.playerId,
        });
    }

    onChangeBtnClick() {
        this.profileChangePopup.show();
    }


    onCloseBtnClick() {
        this.hide();
    }
}


