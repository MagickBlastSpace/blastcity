import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIEventKingsCupPlayerItem } from '../events/KingsCup/UIEventKingsCupPlayerItem';
import { PlayerEventData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardFriendItem')
export class UILeaderboardFriendItem extends UIEventKingsCupPlayerItem {

    @property(Label)
    clanLabel: Label = null;

    @property(Button)
    profileBtn: Button = null;

    private friendId: number = 0;


    start() {
        this.profileBtn.node.on(Button.EventType.CLICK, this.onProfileBtnClick, this);
    }
    
    refresh(data: PlayerEventData) {
        super.refresh(data);

        this.clanLabel.string = data.clanName;

        this.friendId = data.playerId;
    }


    onProfileBtnClick() {
        this.node.emit("profile", this.friendId);
    }
}


