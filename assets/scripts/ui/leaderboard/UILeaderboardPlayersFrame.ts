import { _decorator, Component, Node, Prefab, instantiate, ScrollView, EditBox, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UILeaderboardPlayerItem } from './UILeaderboardPlayerItem';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
import { UILeaderboardPlayersAdaptivity } from './adaptivity/UILeaderboardPlayersAdaptivity';
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

    @property(EditBox)
    searchInput: EditBox = null;

    @property(Button)
    searchBtn: Button = null;
    @property(Button)
    cancelSearchBtn: Button = null;

    @property(UILeaderboardPlayersAdaptivity)
    adaptivity: UILeaderboardPlayersAdaptivity;


    start() {
        this.searchBtn.node.on(Button.EventType.CLICK, this.onSearchBtnClick, this);
        this.cancelSearchBtn.node.on(Button.EventType.CLICK, this.onCancelSearchBtnClick, this);
    }

    
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

                    if(this.adaptivity) {
                        this.adaptivity.addItem(item.getComponent("UILeaderboardItemAdaptivity"));
                    }
                    
                    itemNode.on("profile", (data) => this.showProfile(data));
                }
    
                this.items[i].node.active = true;
                
                this.items[i].init(i + 1);
                this.items[i].refresh(members[i]);
            }

            if(this.adaptivity) {
                this.adaptivity.refresh();
            }

            this.loadPlayersInfo(members);

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


    async loadPlayersInfo(data: PlayerEventData[]) {
        try {
            let ids = [];
            for(let i = 0; i < data.length; i++) {
                ids.push(data[i].playerId);
            }
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            for(let i = 0; i < players.length && i < this.items.length; i++) {
                this.items[i].setPlayerInfo(players[i]);
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    showProfile(playerId: number) {
        this.node.emit("profile", playerId);
    }

    onSearchBtnClick() {
        let searchString = this.searchInput.string.trim().toLowerCase();
    
        if (searchString === "") {
            this.onCancelSearchBtnClick();
            return;
        }
    
        for (let i = 0; i < this.items.length; i++) {
            let playerName = this.items[i].getPlayerName().toLowerCase();
    
            this.items[i].node.active = playerName !== "" && playerName.includes(searchString);
        }
    }
    

    onCancelSearchBtnClick() {
        this.show();
    }
}


