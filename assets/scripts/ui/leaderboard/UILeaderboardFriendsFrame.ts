import { _decorator, Node, Prefab, instantiate, ScrollView, view, Widget  } from 'cc';
import { UILeaderboardFriendItem } from './UILeaderboardFriendItem';
import { UIFriendsRequestsFrame } from '../friends/UIFriendsRequestsFrame';
import { UILeaderboardItemAdaptivity } from './adaptivity/UILeaderboardItemAdaptivity';
import { Net } from '../../net/Net';
import { UserData } from '../../data/UserData';
import { PlayerEventData } from '../../data/EventData';
import { UITab } from '../main/UITab';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardFriendsFrame')
export class UILeaderboardFriendsFrame extends UIFrameBase {

    @property([UILeaderboardFriendItem])
    items: UILeaderboardFriendItem[] = [];
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(ScrollView)
    scroll: ScrollView = null;

    @property([UITab])
    tabs: UITab[] = [];
    
    @property([UIFrameBase])
    frames: UIFrameBase[] = [];

    @property(Node)
    tabsFrame: Node = null;

    private cachedMembers: PlayerEventData[] = [];

    private cachedPlayersInfo: {
        [playerId: string]: any
    } = {};

    private isDataLoaded: boolean = false;
    private isLoading: boolean = false;

    private preloadPromise: Promise<void> = null;

    private resizeRefreshScheduled = false;

    protected onEnable() {
        view.on('canvas-resize', this.onCanvasResize, this);
    }

    protected onDisable() {
        view.off('canvas-resize', this.onCanvasResize, this);
    }

    private onCanvasResize() {
        if (this.resizeRefreshScheduled) {
            return;
        }

        this.resizeRefreshScheduled = true;

        this.scheduleOnce(() => {
            this.resizeRefreshScheduled = false;

            for (let i = 0; i < this.items.length; i++) {
                const itemNode = this.items[i].node;

                const itemAdaptivity =
                    itemNode.getComponent(UILeaderboardItemAdaptivity);

                if (itemAdaptivity) {
                    itemAdaptivity.refresh();
                }

                const widgets = itemNode.getComponentsInChildren(Widget);

                for (let j = 0; j < widgets.length; j++) {
                    widgets[j].updateAlignment();
                }
            }
        }, 0);
    }


    start() {
        this.bringTabsToFront();

        for (let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => {
                console.log("[FRIENDS TAB] clicked:", index);
                this.showFrame(index);
            });
        }
    }

    private bringTabsToFront() {
        if (!this.tabsFrame || !this.tabsFrame.parent) {
            return;
        }

        this.tabsFrame.setSiblingIndex(
            this.tabsFrame.parent.children.length - 1
        );
    }


    public async preload(
        force: boolean = false
    ): Promise<void> {

        if(this.isDataLoaded && !force) {
            console.log(
                "[LEADERBOARD FRIENDS] Background data already loaded"
            );

            await this.preloadRequests();
            return;
        }

        if(this.preloadPromise) {
            await this.preloadPromise;

            if(!force) {
                await this.preloadRequests();
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

        await this.preloadRequests();
    }


    private async performPreload(): Promise<void> {
        if(this.isLoading) {
            return;
        }

        this.isLoading = true;

        console.log(
            "[LEADERBOARD FRIENDS] Background DATA preload started"
        );

        try {
            const ids = [
                UserData.instance.getPlayerId(),
                ...UserData.instance.getFriendsList()
            ];

            const result =
                await Net.instance.getPlayersByIds(ids);

            const players =
                result?.players ?? [];

            const members: PlayerEventData[] = [];

            this.cachedPlayersInfo = {};

            for(let i = 0; i < players.length; i++) {
                const playerInfo = players[i];

                const player =
                    new PlayerEventData();

                player.playerName =
                    playerInfo.state["name"];

                player.progressValue =
                    playerInfo.state["score"];

                player.clanName =
                    playerInfo.state["clanname"];

                player.playerId =
                    playerInfo.state.id;

                members.push(player);

                this.cachedPlayersInfo[
                    String(player.playerId)
                ] = playerInfo;
            }

            members.sort(
                (a, b) =>
                    b.progressValue -
                    a.progressValue
            );

            this.cachedMembers = members;
            this.isDataLoaded = true;

            console.log(
                "[LEADERBOARD FRIENDS] Background DATA preload finished. Count: " +
                members.length
            );
        }
        catch(error) {
            console.error(
                "[LEADERBOARD FRIENDS] Background preload failed:",
                error
            );

            this.isDataLoaded = false;
        }
        finally {
            this.isLoading = false;
        }
    }

    async refresh() {
        await this.preload(true);

        if(this.node.activeInHierarchy) {
            this.renderCachedData();
        }
    }


    show() {
        super.show();

        this.bringTabsToFront();
        this.showFrame(0);

        if(this.isDataLoaded) {
            this.renderCachedData();
            return;
        }

        void this.loadAndShow();
    }

    private async loadAndShow() {
        await this.preload();

        if(
            !this.node.activeInHierarchy ||
            !this.isDataLoaded
        ) {
            return;
        }

        this.renderCachedData();
    }


    showProfile(playerId: number) {
        this.node.emit("profile", playerId);
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].hideClean();
        }
    }



    private async preloadRequests() {
        for(let i = 0; i < this.frames.length; i++) {
            const requestsFrame =
                this.frames[i].node.getComponent(
                    UIFriendsRequestsFrame
                );

            if(requestsFrame) {
                await requestsFrame.preload();
                return;
            }
        }
    }

    private renderCachedData() {
        const members = this.cachedMembers;

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active =
                i < members.length;
        }

        for(let i = 0; i < members.length; i++) {
            if(i >= this.items.length) {
                const itemNode =
                    instantiate(this.itemPrefab);

                this.itemsLayout.addChild(itemNode);

                const item =
                    itemNode.getComponent(
                        UILeaderboardFriendItem
                    );

                if(!item) {
                    console.error(
                        "[LEADERBOARD FRIENDS] UILeaderboardFriendItem component not found"
                    );

                    itemNode.destroy();
                    continue;
                }

                itemNode.on(
                    "profile",
                    (playerId) =>
                        this.showProfile(playerId)
                );

                this.items.push(item);
            }

            const item = this.items[i];

            item.node.active = true;

            item.init(i + 1);
            item.refresh(members[i]);

            const itemAdaptivity =
                item.getComponent(
                    UILeaderboardItemAdaptivity
                );

            if(itemAdaptivity) {
                itemAdaptivity.refresh();
            }

            const playerInfo =
                this.cachedPlayersInfo[
                    String(members[i].playerId)
                ];

            if(playerInfo) {
                item.setPlayerInfo(playerInfo);
            }
        }

        if(this.scroll) {
            this.scroll.scrollToTop(
                0.1,
                true
            );
        }
    }
}


