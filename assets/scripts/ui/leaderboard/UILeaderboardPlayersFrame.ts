import { _decorator, Component, Node, Prefab, instantiate, ScrollView} from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UILeaderboardPlayerItem } from './UILeaderboardPlayerItem';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardPlayersFrame')
export class UILeaderboardPlayersFrame extends UIPopupFrameBase {

    @property([UILeaderboardPlayerItem])
    items: UILeaderboardPlayerItem[] = [];
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(ScrollView)
    scroll: ScrollView = null;


    start() {}

    
    async refresh() {
        let members = [];
    
        try {
            const result = await Net.instance.fetchScoreLeaderboardDataUnscoped("SCORE");
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;
    
            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].name;
                player.progressValue = players[i].score;
                player.playerId = players[i].id;
    
                members.push(player);
            }
    
            for(let i = 0; i < members.length; i++) {
                if(i >= this.items.length) {
                    const itemNode = instantiate(this.itemPrefab);
                    this.itemsLayout.addChild(itemNode);
            
                    let item = itemNode.getComponent("UILeaderboardPlayerItem");
            
                    this.items.push(item);
                }
    
                this.items[i].init(i + 1);
                this.items[i].refresh(members[i]);
            }

            if (this.scroll) {
                this.scroll.scrollToTop(0.1, true);
            }
    
        } catch (error) {
            console.log('Error fetching overall players leaderboard data:', error);
        }
    }


    show() {
        super.show();

        this.refresh();
    }
}


