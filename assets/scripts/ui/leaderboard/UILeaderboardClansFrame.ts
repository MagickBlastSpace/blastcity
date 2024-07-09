import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
import { UILeaderboardClanItem } from './UILeaderboardClanItem';
import { Clans } from '../../game/Clans';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardClansFrame')
export class UILeaderboardClansFrame extends UIPopupFrameBase {

    @property([UILeaderboardClanItem])
    items: UILeaderboardClanItem[] = [];
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Clans)
    clans: Clans = null;

    @property([PlayerEventData])
    teams: PlayerEventData[] = [];


    start() {}

    
    async refresh() {
        this.teams = [];

        let clansData = this.clans.getAllClans();

        for(let i = 0; i < clansData.length; i++) {
            let data = new PlayerEventData();
            data.playerName = clansData[i].clanName;
            data.progressValue = 0;

            try {
                const result = await Net.instance.fetchScoreLeaderboardDataUnscoped("clan", "clan_" + clansData[i].clanId);
                const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;
    
                for(let i = 0; i < players.length; i++) {
                    data.progressValue += players[i].score;
                }

                this.teams.push(data);

                this.updateTeams();
    
            } catch (error) {
                console.log('Error fetching clans leaderboard data:', error);
            }
        }
    }


    updateTeams() {
        this.teams.sort((a, b) => b.progressValue - a.progressValue);

        for(let i = 0; i < this.teams.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.itemsLayout.addChild(itemNode);
        
                let item = itemNode.getComponent("UILeaderboardClanItem");
        
                this.items.push(item);
            }

            this.items[i].init(i + 1);
            this.items[i].refresh(this.teams[i]);
        }
    }


    show() {
        super.show();

        this.refresh();
    }
}


