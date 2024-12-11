import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UILeaderboardFriendsFrame } from '../leaderboard/UILeaderboardFriendsFrame';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateSendPlayers')
export class UICollectionDuplicateSendPlayers extends UILeaderboardFriendsFrame {
    @property(Button)
    closeBtn: Button = null;

    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    onCloseBtnClick() {
        this.hide();
    }
}


