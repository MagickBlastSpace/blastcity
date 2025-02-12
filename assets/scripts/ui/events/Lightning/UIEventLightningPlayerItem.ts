import { _decorator, Component, Node, Button } from 'cc';
import { UILeaderboardFriendItem } from '../../leaderboard/UILeaderboardFriendItem';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
import { Profile } from '../../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UIEventLightningPlayerItem')
export class UIEventLightningPlayerItem extends UILeaderboardFriendItem {

    @property(Button)
    infoRewardBtn: Button = null;
    @property(Button)
    closeInfoRewardBtn: Button = null;

    @property(Node)
    infoReward: Node = null;


    start() {
        super.start();

        if(this.infoRewardBtn && this.infoRewardBtn !== undefined) {
            this.infoRewardBtn.node.on(Button.EventType.CLICK, this.onInfoRewardClick, this);
        }

        if(this.closeInfoRewardBtn && this.closeInfoRewardBtn !== undefined) {
            this.closeInfoRewardBtn.node.on(Button.EventType.CLICK, this.onCloseInfoRewardClick, this);
        }
    }

    refresh(data: PlayerEventData) {
        super.refresh(data);

        if(this.rewardsLayout && this.rewardsLayout !== undefined) {
            this.rewardsLayout.active = this.index === 0;

            if(this.rewardIcon && this.index === 0) {
                this.rewardIcon.spriteFrame = this.rewardIcons[this.index];
            }
        }

        this.loadAvatar(data.playerId);
    }


    async loadAvatar(id: number) {
            try {
                let ids = [id];
                const result = await Net.instance.getPlayersByIds(ids);
                
                const { players } = result;
                
                if(players.length > 0) {
                    if(this.avatar) {
                        this.avatar.spriteFrame = Profile.instance.getAvatarById(players[0].state["avatar_id"]);
                    }
                }
            }
    
            catch (error) {
                console.log('Error fetching players:', error);
            }
        }


    onInfoRewardClick() {
        this.infoReward.active = true;
    }

    onCloseInfoRewardClick() {
        this.infoReward.active = false;
    }
}


