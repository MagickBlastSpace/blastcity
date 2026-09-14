import {
    _decorator,
    Node,
    Prefab,
    instantiate,
    ScrollView,
    EditBox,
    Button,
    Layout
} from 'cc';

import { UIFrameBase } from '../UIFrameBase';
import { UILeaderboardPlayerItem } from './UILeaderboardPlayerItem';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
import { UILeaderboardPlayersAdaptivity } from './adaptivity/UILeaderboardPlayersAdaptivity';
import { UILeaderboardItemAdaptivity } from './adaptivity/UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;


@ccclass('UILeaderboardPlayersFrame')
export class UILeaderboardPlayersFrame extends UIFrameBase {

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
    adaptivity: UILeaderboardPlayersAdaptivity = null;


    private isLoaded: boolean = false;

    private isLoading: boolean = false;

    private isPrepared: boolean = false;

    private cachedMembers: PlayerEventData[] = [];


    start() {

        if (this.searchBtn) {
            this.searchBtn.node.on(
                Button.EventType.CLICK,
                this.onSearchBtnClick,
                this
            );
        }


        if (this.cancelSearchBtn) {
            this.cancelSearchBtn.node.on(
                Button.EventType.CLICK,
                this.onCancelSearchBtnClick,
                this
            );
        }

        if (this.adaptivity) {

            for (let i = 0; i < this.items.length; i++) {

                const item = this.items[i];

                if (!item) {
                    continue;
                }


                const itemAdaptivity =
                    item.getComponent(
                        UILeaderboardItemAdaptivity
                    );


                if (itemAdaptivity) {
                    this.adaptivity.addItem(
                        itemAdaptivity
                    );
                }
            }
        }
    }


    async refresh(
        force: boolean = false,
        prepareAfterLoad: boolean = true
    ): Promise<void> {

        if (this.isLoaded && !force) {

            if (prepareAfterLoad && !this.isPrepared) {
                this.prepareCachedData();
            }

            return;
        }

        if (this.isLoading) {
            return;
        }


        this.isLoading = true;


        console.log(
            "[LEADERBOARD PLAYERS] Loading started"
        );


        try {

            const result =
                await Net.instance
                    .fetchScoreLeaderboardDataUnscoped(
                        "SCORE"
                    );


            if (
                !result ||
                !result.players
            ) {

                console.warn(
                    "[LEADERBOARD PLAYERS] " +
                    "Empty leaderboard response"
                );

                return;
            }


            const players =
                result.players;


            const members:
                PlayerEventData[] = [];


            for (
                let i = 0;
                i < players.length;
                i++
            ) {

                const member =
                    new PlayerEventData();


                member.playerName =
                    players[i].name;

                member.progressValue =
                    players[i].score;

                member.playerId =
                    players[i].id;


                members.push(
                    member
                );
            }


            this.cachedMembers =
                members;


            this.isLoaded =
                true;

            this.isPrepared =
                false;


            console.log(
                `[LEADERBOARD PLAYERS] ` +
                `Loaded. Count: ${members.length}`
            );


            if (prepareAfterLoad) {
                this.prepareCachedData();
            }

        }
        catch (error) {

            console.error(
                "[LEADERBOARD PLAYERS] " +
                "Loading failed:",
                error
            );

        }
        finally {

            this.isLoading =
                false;
        }
    }


    private prepareCachedData() {

        if (!this.isLoaded) {
            return;
        }


        const data =
            this.cachedMembers;

        while (
            this.items.length <
            data.length
        ) {

            const itemNode =
                instantiate(
                    this.itemPrefab
                );


            itemNode.active =
                false;


            this.itemsLayout.addChild(
                itemNode
            );


            const item =
                itemNode.getComponent(
                    UILeaderboardPlayerItem
                );


            if (!item) {

                console.error(
                    "[LEADERBOARD PLAYERS] " +
                    "UILeaderboardPlayerItem " +
                    "component not found"
                );


                itemNode.destroy();

                break;
            }


            this.items.push(
                item
            );


            if (this.adaptivity) {

                const itemAdaptivity =
                    item.getComponent(
                        UILeaderboardItemAdaptivity
                    );


                if (itemAdaptivity) {

                    this.adaptivity.addItem(
                        itemAdaptivity
                    );
                }
            }


            itemNode.on(
                "profile",
                (playerId) =>
                    this.showProfile(
                        playerId
                    )
            );
        }

        for (
            let i = 0;
            i < this.items.length;
            i++
        ) {

            const item =
                this.items[i];


            item.node.active =
                false;


            if (i < data.length) {

                item.init(
                    i + 1
                );


                item.refresh(
                    data[i]
                );
            }
        }


        this.isPrepared =
            true;


        console.log(
            `[LEADERBOARD PLAYERS] ` +
            `UI prepared in background. Items: ${data.length}`
        );
    }


    private renderCachedData() {

        if (!this.isLoaded) {
            return;
        }


        if (!this.isPrepared) {
            this.prepareCachedData();
        }


        const data =
            this.cachedMembers;


        for (
            let i = 0;
            i < this.items.length;
            i++
        ) {

            this.items[i].node.active =
                i < data.length;
        }

        const layout =
            this.itemsLayout.getComponent(Layout);


        if (layout) {
            layout.updateLayout();
        }


        this.scheduleOnce(() => {

            if (!this.node.activeInHierarchy) {
                return;
            }

            if (layout) {
                layout.updateLayout();
            }


            if (this.adaptivity) {
                this.adaptivity.refresh();
            }

        }, 0);

        this.scheduleOnce(() => {

            if (!this.node.activeInHierarchy) {
                return;
            }


            this.adaptivity?.debugGeometry(
                "FRAME +1"
            );

        }, 0);


        this.scheduleOnce(() => {

            if (!this.node.activeInHierarchy) {
                return;
            }


            this.adaptivity?.debugGeometry(
                "FRAME +0.2 SEC"
            );

        }, 0.2);


        this.scheduleOnce(() => {

            if (!this.node.activeInHierarchy) {
                return;
            }


            this.adaptivity?.debugGeometry(
                "FRAME +0.5 SEC"
            );

        }, 0.5);
    }

    show() {

        super.show();


        if (this.isLoaded) {

            this.renderCachedData();

            return;
        }

        void this.loadAndShow();
    }


    private async loadAndShow() {

        if (this.isLoading) {

            await this.waitUntilLoadingFinished();

        }
        else {

            await this.refresh(
                false,
                true
            );
        }


        if (!this.node.active) {
            return;
        }


        if (this.isLoaded) {
            this.renderCachedData();
        }
    }


    private async waitUntilLoadingFinished():
        Promise<void> {

        while (this.isLoading) {

            await new Promise<void>(
                resolve => {
                    setTimeout(
                        resolve,
                        16
                    );
                }
            );
        }
    }


    showProfile(
        playerId: number
    ) {

        this.node.emit(
            "profile",
            playerId
        );
    }


    onSearchBtnClick() {

        const searchString =
            this.searchInput
                .string
                .trim()
                .toLowerCase();


        if (searchString === "") {

            this.onCancelSearchBtnClick();

            return;
        }


        for (
            let i = 0;
            i < this.items.length;
            i++
        ) {

            if (
                i >=
                this.cachedMembers.length
            ) {

                this.items[i]
                    .node
                    .active = false;

                continue;
            }


            const playerName =
                this.items[i]
                    .getPlayerName()
                    .toLowerCase();


            this.items[i]
                .node
                .active =
                playerName !== "" &&
                playerName.includes(
                    searchString
                );
        }

        const layout =
            this.itemsLayout
                .getComponent(Layout);


        if (layout) {
            layout.updateLayout();
        }


        if (this.adaptivity) {
            this.adaptivity.refresh();
        }
    }


    onCancelSearchBtnClick() {

        if (this.searchInput) {

            this.searchInput.string =
                "";
        }


        if (this.isLoaded) {

            for (
                let i = 0;
                i < this.items.length;
                i++
            ) {

                this.items[i]
                    .node
                    .active =
                    i <
                    this.cachedMembers.length;
            }


            const layout =
                this.itemsLayout
                    .getComponent(Layout);


            if (layout) {
                layout.updateLayout();
            }


            if (this.adaptivity) {
                this.adaptivity.refresh();
            }
        }
    }


    async preload(): Promise<void> {

        if (this.isLoaded) {

            console.log(
                "[LEADERBOARD PLAYERS] " +
                "Background data already loaded"
            );

            return;
        }


        console.log(
            "[LEADERBOARD PLAYERS] " +
            "Background DATA preload started"
        );


        if (this.isLoading) {

            await this.waitUntilLoadingFinished();

            console.log(
                "[LEADERBOARD PLAYERS] " +
                "Background DATA preload finished"
            );

            return;
        }


        await this.refresh(
            false,
            false
        );


        console.log(
            "[LEADERBOARD PLAYERS] " +
            "Background DATA preload finished",
            {
                loaded: this.isLoaded,
                cached: this.cachedMembers.length,
                prepared: this.isPrepared
            }
        );
    }


    async forceRefresh() {

        await this.refresh(
            true,
            true
        );


        if (this.node.active) {
            this.renderCachedData();
        }
    }


    isDataLoaded():
        boolean {

        return this.isLoaded;
    }
}