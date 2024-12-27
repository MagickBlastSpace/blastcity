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
    @property(Label)
    registerDate: Label = null;

    @property(Label)
    stat_win: Label = null;
    @property(Label)
    stat_energy_recieved: Label = null;
    @property(Label)
    stat_energy_given: Label = null;
    @property(Label)
    stat_chests_open: Label = null;
    @property(Label)
    stat_collections: Label = null;
    @property(Label)
    stat_collections_finished: Label = null;

    @property(Button)
    addToFriendsBtn: Button = null;
    @property(Button)
    removeFromFriendsBtn: Button = null;
    @property(Button)
    openChatBtn: Button = null;
    @property(Button)
    changeBtn: Button = null;
    @property(Button)
    changeBtn_Duplicate: Button = null;

    @property(Button)
    closeBtn: Button = null;

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;
    @property(Sprite)
    badge: Sprite = null;

    @property([Sprite])
    colors: Sprite[] = [];

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
        this.changeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onChangeBtnClick, this);

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
                this.score.string = players[0].state["score"];
                this.registerDate.string = players[0].state["registration_date"];

                this.stat_win.string = players[0].state["stat_win"];
                this.stat_energy_given.string = players[0].state["stat_energy_given"];
                this.stat_energy_recieved.string = players[0].state["stat_energy_recieved"];
                this.stat_chests_open.string = players[0].state["stat_chests_open"];
                this.stat_collections.string = players[0].state["stat_collections"];
                this.stat_collections_finished.string = players[0].state["stat_collections_finished"];

                let isMe = this.playerId === UserData.instance.getPlayerId();
                if(!isMe) {
                    this.avatar.spriteFrame = this.profile.getAvatarById(players[0].state["avatar_id"]);
                    this.frame.spriteFrame = this.profile.getFrameById(players[0].state["frame_id"]);
                    this.badge.spriteFrame = this.profile.getBadgeById(players[0].state["badge_id"]);

                    for(let i = 0; i < this.colors.length; i++) {
                        this.colors[i].color = this.profile.getColorById(this.profile.getBadgeById(players[0].state["color_id"]));
                    }
                }
            }
        } catch (error) {
            console.log('Error fetching player profile:', error);
        }
    }

    refreshLocalData() {
        let isFriend = UserData.instance.isFriend(this.playerId);
        let isMe = this.playerId === UserData.instance.getPlayerId();
        let isRequested = UserData.instance.isFriendRequested(this.playerId);

        this.addToFriendsBtn.node.active = !isFriend && !isMe && !isRequested;
        this.removeFromFriendsBtn.node.active = isFriend && !isMe;
        this.openChatBtn.node.active = !isMe;
        this.changeBtn.node.active = isMe;

        if(isMe) {
            this.avatar.spriteFrame = this.profile.getCurrentAvatar();
            this.frame.spriteFrame = this.profile.getCurrentFrame();
            this.badge.spriteFrame = this.profile.getCurrentBadge();

            for(let i = 0; i < this.colors.length; i++) {
                this.colors[i].color = this.profile.getCurrentColor();
            }
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    onAddBtnClick() {
        if(this.playerId !== 0) {
            UserData.instance.addFriendRequest(this.playerId);

            gamepush.channels.sendFeedMessage({
                playerId: this.playerId,
                text: "Friend request",
                tags: ['friend_request'],
            });
        }
        
        this.refreshLocalData();
    }

    onRemoveBtnClick() {
        UserData.instance.removeFriend(this.playerId);

        gamepush.channels.sendFeedMessage({
            playerId: this.playerId,
            text: "Friend remove",
            tags: ['friend_remove'],
        });

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


