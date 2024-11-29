import { _decorator, Component, Node, Label, Sprite, Button } from 'cc';
import { UIEventKingsCupPlayerItem } from '../KingsCup/UIEventKingsCupPlayerItem';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
import { Profile } from '../../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UIEventWeeklyContestPlayerItem')
export class UIEventWeeklyContestPlayerItem extends UIEventKingsCupPlayerItem {

    @property(Label)
    clanLabel: Label = null;

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;

    @property(Node)
    rewardInfoLayout: Node = null;
    @property(Node)
    profilePopup: Node = null;

    @property(Button)
    rewardInfoBtn: Button = null;
    @property(Button)
    showProfilePopupBtn: Button = null;
    @property(Button)
    showProfileBtn: Button = null;

    private playerId: number = 0;


    start() {
        if(this.rewardInfoBtn) {
            this.rewardInfoBtn.node.on(Button.EventType.CLICK, this.onRewardInfoBtnClick, this);
        }
        
        if(this.showProfilePopupBtn) {
            this.showProfilePopupBtn.node.on(Button.EventType.CLICK, this.onShowProfilePopupBtnClick, this);
        }

        if(this.showProfileBtn) {
            this.showProfileBtn.node.on(Button.EventType.CLICK, this.onShowProfileBtnClick, this);
        }
    }
    
    async refresh(data: PlayerEventData) {
        super.refresh(data);

        this.clanLabel.string = "";
        this.playerId = data.playerId;

        try {
            let ids = [data.playerId];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                this.clanLabel.string = players[0].state["clanname"];

                if(this.avatar) {
                    this.avatar.spriteFrame = Profile.instance.getAvatarById(players[0].state["avatar_id"]);
                }

                if(this.frame) {
                    this.frame.spriteFrame = Profile.instance.getFrameById(players[0].state["frame_id"]);
                }
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    onRewardInfoBtnClick() {
        if(this.rewardInfoLayout.active) {
            this.rewardInfoLayout.active = false;
        }
        else {
            this.rewardInfoLayout.active = true;
        }
    }

    onShowProfilePopupBtnClick() {
        if(this.profilePopup.active) {
            this.profilePopup.active = false;
        }
        else {
            this.profilePopup.active = true;
        }
    }

    onShowProfileBtnClick() {
        this.node.emit("profile", this.playerId);
    }
}


