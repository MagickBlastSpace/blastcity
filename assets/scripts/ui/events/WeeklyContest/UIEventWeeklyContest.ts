import { _decorator, Node, Label, Prefab, instantiate } from 'cc';

import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventWeeklyContestPlayerItem } from './UIEventWeeklyContestPlayerItem';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
import { UIEventWeeklyContestAdaptivity } from './UIEventWeeklyContestAdaptivity';
import { UILeaderboardItemAdaptivity } from '../../leaderboard/adaptivity/UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;

@ccclass('UIEventWeeklyContest')
export class UIEventWeeklyContest extends UIEventPopupFrameBase {

    @property(Label)
    timeLabel: Label = null;

    @property([UIEventWeeklyContestPlayerItem])
    items: UIEventWeeklyContestPlayerItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    playerItemsLayout: Node = null;

    @property(UIEventWeeklyContestAdaptivity)
    adaptivity: UIEventWeeklyContestAdaptivity = null;

    private cachedData: PlayerEventData[] = [];
    private cachedPlayersInfo: { [playerId: string]: any } = {};

    private isDataLoaded: boolean = false;
    private isLoading: boolean = false;

    private preloadPromise: Promise<void> = null;


    start() {
        this.init(this.eventController);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("profile", (data) => this.showProfile(data));
        }
    }


    update(deltaTime: number) {
        if(!this.node.active) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.cacheCurrentData();

        if(this.isLoading || !this.node.activeInHierarchy) {
            return;
        }

        this.renderCachedData();

        void this.loadPlayersInfo(this.cachedData);
    }


    private cacheCurrentData() {
        if(!this.eventController) {
            this.cachedData = [];
            return;
        }

        const controller: any = this.eventController;
        const data = controller.sortPlayersByProgress();

        this.cachedData = data ? [...data] : [];
    }


    private renderCachedData() {
        const data = this.cachedData;

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);

                this.playerItemsLayout.addChild(itemNode);

                const item = itemNode.getComponent(UIEventWeeklyContestPlayerItem);

                if(!item) {
                    console.error("[LEADERBOARD WEEKLY] UIEventWeeklyContestPlayerItem component not found");
                    itemNode.destroy();
                    continue;
                }

                item.init(i + 1);

                this.items.push(item);

                const itemAdaptivity = item.getComponent(UILeaderboardItemAdaptivity);

                if(this.adaptivity && itemAdaptivity) {
                    this.adaptivity.addItem(itemAdaptivity);
                }

                itemNode.on("profile", (playerId) => this.showProfile(playerId));
            }

            this.items[i].refresh(data[i]);
        }

        this.applyCachedPlayersInfo();

        if(this.adaptivity) {
            this.adaptivity.refresh();
        }
    }


    public async preload(): Promise<void> {
        if(this.isDataLoaded) {
            console.log("[LEADERBOARD WEEKLY] Background data already loaded");
            return;
        }

        if(this.preloadPromise) {
            await this.preloadPromise;
            return;
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
        this.isLoading = true;

        console.log("[LEADERBOARD WEEKLY] Background DATA preload started");

        try {
            const controller: any = this.eventController;

            await controller.updateMultiplayerData();

            this.cacheCurrentData();

            await this.loadPlayersInfoToCache(this.cachedData);

            this.isDataLoaded = true;

            console.log("[LEADERBOARD WEEKLY] Background DATA preload finished. Count: " + this.cachedData.length);
        }
        catch(error) {
            console.error("[LEADERBOARD WEEKLY] Background preload failed", error);
        }
        finally {
            this.isLoading = false;
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

        if(!this.node.activeInHierarchy) {
            return;
        }

        this.renderCachedData();
    }


    async loadPlayersInfo(data: PlayerEventData[]) {
        await this.loadPlayersInfoToCache(data);

        if(this.node.activeInHierarchy) {
            this.applyCachedPlayersInfo();
        }
    }


    private async loadPlayersInfoToCache(data: PlayerEventData[]) {
        try {
            const ids: number[] = [];

            for(let i = 0; i < data.length; i++) {
                const id = Number(data[i].playerId);

                if(isNaN(id) || id <= 0 || ids.indexOf(id) !== -1) {
                    continue;
                }

                ids.push(id);
            }

            if(ids.length === 0) {
                this.cachedPlayersInfo = {};
                return;
            }

            const result = await Net.instance.getPlayersByIds(ids);
            const players = result && result.players ? result.players : [];

            this.cachedPlayersInfo = {};

            for(let i = 0; i < players.length && i < ids.length; i++) {
                this.cachedPlayersInfo[String(ids[i])] = players[i];
            }
        }
        catch(error) {
            console.log("[LEADERBOARD WEEKLY] Error fetching players:", error);
        }
    }


    private applyCachedPlayersInfo() {
        for(let i = 0; i < this.cachedData.length && i < this.items.length; i++) {
            const playerId = Number(this.cachedData[i].playerId);

            if(isNaN(playerId) || playerId <= 0) {
                continue;
            }

            const playerInfo = this.cachedPlayersInfo[String(playerId)];

            if(!playerInfo) {
                continue;
            }

            this.items[i].setPlayerInfo(playerInfo);
        }
    }


    getRemainingTimeString(): string {
        return this.eventController.getRemainingTimeString();
    }


    showProfile(playerId: number) {
        this.node.emit("profile", playerId);
    }
}
