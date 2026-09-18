import { _decorator, Node, Prefab, instantiate, ScrollView,  } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { Net } from '../../net/Net';
import { UILeaderboardClanItem } from './UILeaderboardClanItem';
import { Clans } from '../../game/Clans';
import { ClanData, ClanLeaderboardData } from '../../data/ClanData';
import { UILeaderboardClansAdaptivity } from './adaptivity/UILeaderboardClansAdaptivity';
import { UILeaderboardItemAdaptivity } from './adaptivity/UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;

@ccclass('UILeaderboardClansFrame')
export class UILeaderboardClansFrame extends UIFrameBase {

    @property([UILeaderboardClanItem])
    items: UILeaderboardClanItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    itemsLayout: Node = null;

    @property(Clans)
    clans: Clans = null;

    @property(ScrollView)
    scroll: ScrollView = null;

    @property(UILeaderboardClansAdaptivity)
    adaptivity: UILeaderboardClansAdaptivity = null;



    private teams: ClanLeaderboardData[] = [];

    private isDataLoaded: boolean = false;
    private isLoading: boolean = false;
    private preloadPromise: Promise<void> = null;

    private batchSize: number = 5;


    start() {
        for(let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            if(!item) {
                continue;
            }

            const itemAdaptivity = item.getComponent(UILeaderboardItemAdaptivity);

            if(this.adaptivity && itemAdaptivity) {
                this.adaptivity.addItem(itemAdaptivity);
            }

            item.node.on("show_info", (data) => this.showClan(data));
        }
    }


    public async preload(force: boolean = false): Promise<void> {
        if(this.isDataLoaded && !force) {
            console.log("[LEADERBOARD CLANS] Background data already loaded");
            return;
        }

        if(this.preloadPromise) {
            await this.preloadPromise;

            if(!force) {
                return;
            }
        }

        this.preloadPromise = this.performPreload();

        try {
            await this.preloadPromise;
        }
        finally {
            this.preloadPromise = null;
        }
    }


    private async performPreload(): Promise<void> {
        if(this.isLoading) {
            return;
        }

        this.isLoading = true;

        console.log("[LEADERBOARD CLANS] Background DATA preload started");

        try {
            const clansData = this.clans ? this.clans.getAllClans() : [];

            if(!clansData || clansData.length === 0) {
                console.warn("[LEADERBOARD CLANS] Clan list is empty");
                this.isDataLoaded = false;
                return;
            }

            const loadedTeams: ClanLeaderboardData[] = [];

            for(let start = 0; start < clansData.length; start += this.batchSize) {
                const batch = clansData.slice(start, start + this.batchSize);

                const batchResults = await Promise.all(batch.map((clanData) => this.loadClanScore(clanData)));

                for(let i = 0; i < batchResults.length; i++) {
                    loadedTeams.push(batchResults[i]);
                }
            }

            loadedTeams.sort((a, b) => b.score - a.score);

            this.teams = loadedTeams;
            this.isDataLoaded = true;

            console.log("[LEADERBOARD CLANS] Background DATA preload finished. Count: " + this.teams.length);
        }
        catch(error) {
            console.error("[LEADERBOARD CLANS] Background preload failed", error);
            this.isDataLoaded = false;
        }
        finally {
            this.isLoading = false;
        }
    }


    private async loadClanScore(clanData: ClanData): Promise<ClanLeaderboardData> {
        const data = new ClanLeaderboardData();

        data.clanData = clanData;
        data.score = 0;

        try {
            const result = await Net.instance.fetchScoreLeaderboardData("clan", "clan_" + clanData.clanId);
            const players = result && result.players ? result.players : [];

            for(let i = 0; i < players.length; i++) {
                data.score += Number(players[i].score) || 0;
            }
        }
        catch(error) {
            console.log("[LEADERBOARD CLANS] Error loading clan score: " + clanData.clanName, error);
        }

        return data;
    }


    private renderCachedData() {
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < this.teams.length;
        }

        for(let i = 0; i < this.teams.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);

                this.itemsLayout.addChild(itemNode);

                const item = itemNode.getComponent(UILeaderboardClanItem);

                if(!item) {
                    console.error("[LEADERBOARD CLANS] UILeaderboardClanItem component not found");
                    itemNode.destroy();
                    return;
                }

                this.items.push(item);

                const itemAdaptivity = item.getComponent(UILeaderboardItemAdaptivity);

                if(this.adaptivity && itemAdaptivity) {
                    this.adaptivity.addItem(itemAdaptivity);
                }

                itemNode.on("show_info", (data) => this.showClan(data));
            }

            const item = this.items[i];

            item.node.active = true;
            item.setIndex(i);
            item.setScore(this.teams[i].score);
            item.init(this.teams[i].clanData);
        }

        if(this.adaptivity) {
            this.adaptivity.refresh();
        }
    }


    public async refresh() {
        await this.preload(true);

        if(this.node.activeInHierarchy) {
            this.renderCachedData();
        }
    }


    show() {
        super.show();

        if(this.isDataLoaded) {
            this.renderCachedData();
            return;
        }

        void this.loadAndShow();
    }


    private async loadAndShow() {
        await this.preload();

        if(!this.node.activeInHierarchy || !this.isDataLoaded) {
            return;
        }

        this.renderCachedData();
    }


    showClan(clanData: ClanData) {
        this.node.emit("clan", clanData);
    }
}