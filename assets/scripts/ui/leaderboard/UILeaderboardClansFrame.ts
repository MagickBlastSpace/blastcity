import { _decorator, Component, Node, Prefab, instantiate, ScrollView } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
import { UILeaderboardClanItem } from './UILeaderboardClanItem';
import { Clans } from '../../game/Clans';
import { ClanLeaderboardData } from '../../data/ClanData';
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

    @property([ClanLeaderboardData])
    teams: ClanLeaderboardData[] = [];

    @property(ScrollView)
    scroll: ScrollView = null;


    start() {}

    
    async refresh() {
        this.teams = [];

        let clansData = this.clans.getAllClans();

        for(let i = 0; i < clansData.length; i++) {
            let data = new ClanLeaderboardData();
            data.clanData = clansData[i];
            data.score = 0;

            try {
                const result = await Net.instance.fetchScoreLeaderboardData("clan", "clan_" + clansData[i].clanId);
                const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;
    
                for(let i = 0; i < players.length; i++) {
                    data.score += players[i].score;
                }

                this.teams.push(data);

                this.updateTeams();

                if (this.scroll) {
                    this.scroll.scrollToTop(0.1, true);
                }
    
            } catch (error) {
                console.log('Error fetching clans leaderboard data:', error);
            }
        }
    }


    updateTeams() {
        this.teams.sort((a, b) => b.score - a.score);

        for(let i = 0; i < this.teams.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.itemsLayout.addChild(itemNode);
        
                let item = itemNode.getComponent("UILeaderboardClanItem");
        
                this.items.push(item);
            }

            this.items[i].setIndex(i);
            this.items[i].setScore(this.teams[i].score);

            this.items[i].init(this.teams[i].clanData);
        }
    }


    show() {
        super.show();

        this.refresh();
    }
}


