import { _decorator, Component, Node, Prefab, instantiate, ScrollView, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UILeaderboardFriendItem } from './UILeaderboardFriendItem';
import { Net } from '../../net/Net';
import { UserData } from '../../data/UserData';
import { PlayerEventData } from '../../data/EventData';
import { UIFriendsRequestsFrame } from '../friends/UIFriendsRequestsFrame';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardFriendsFrame')
export class UILeaderboardFriendsFrame extends UIPopupFrameBase {

    @property([UILeaderboardFriendItem])
    items: UILeaderboardFriendItem[] = [];
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Button)
    requestsBtn: Button = null;

    @property(ScrollView)
    scroll: ScrollView = null;

    @property(UIFriendsRequestsFrame)
    requestsFrame: UIFriendsRequestsFrame;


    start() {
        this.requestsBtn.node.on(Button.EventType.CLICK, this.onRequestsBtnClick, this);
    }

    
    async refresh() {
        let members = [];

        try {
            let ids = [UserData.instance.getPlayerId()];
            let friends = UserData.instance.getFriendsList();
            for(let i = 0; i < friends.length; i++) {
                ids.push(friends[i]);
            }
            
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].state["name"];
                player.progressValue = players[i].state["score"];
                player.clanName = players[i].state["clanname"];
                player.playerId = players[i].state.id;
    
                members.push(player);
            }

            members.sort((a, b) => b.progressValue - a.progressValue);

            for(let i = 0; i < members.length; i++) {
                if(i >= this.items.length) {
                    const itemNode = instantiate(this.itemPrefab);

                    itemNode.on("profile", (data) => this.showProfile(data));

                    this.itemsLayout.addChild(itemNode);
            
                    let item = itemNode.getComponent("UILeaderboardFriendItem");
            
                    this.items.push(item);
                }
    
                this.items[i].init(i + 1);
                this.items[i].refresh(members[i]);
            }

            if (this.scroll) {
                this.scroll.scrollToTop(0.1, true);
            }

        } catch (error) {
            console.log('Error fetching friends:', error);
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    showProfile(playerId: number) {
        this.node.emit("profile", playerId);
    }


    onRequestsBtnClick() {
        this.requestsFrame.show();
    }
}


