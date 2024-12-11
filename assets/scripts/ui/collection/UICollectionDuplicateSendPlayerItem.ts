import { _decorator, Component, Node } from 'cc';
import { UILeaderboardFriendItem } from '../leaderboard/UILeaderboardFriendItem';
import { UserData } from '../../data/UserData';
import { PlayerEventData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateSendPlayerItem')
export class UICollectionDuplicateSendPlayerItem extends UILeaderboardFriendItem {
    refresh(data: PlayerEventData) {
        super.refresh(data);

        this.node.active = data.playerId !== UserData.instance.getPlayerId();
    }
}


