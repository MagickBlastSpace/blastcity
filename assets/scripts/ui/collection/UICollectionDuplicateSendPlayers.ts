declare const gamepush: any;

import { _decorator, Component, Node, Button, instantiate } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UILeaderboardFriendsFrame } from '../leaderboard/UILeaderboardFriendsFrame';
import { UITab } from '../main/UITab';
import { UIFrameBase } from '../UIFrameBase';
import { ClanMemberData } from '../../data/ClanData';
import { PlayerEventData } from '../../data/EventData';
import { Net } from '../../net/Net';
import { UILeaderboardFriendItem } from '../leaderboard/UILeaderboardFriendItem';
import { UserData } from '../../data/UserData';
import { Clans } from '../../game/Clans';
import { UICollectionDuplicateSendPlayersConfirm } from './UICollectionDuplicateSendPlayersConfirm';
import { CollectionCardData } from '../../data/CollectionData';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateSendPlayers')
export class UICollectionDuplicateSendPlayers extends UILeaderboardFriendsFrame {

    @property(Button)
    closeBtn: Button = null;

    @property([UITab])
    tabs: UITab = [];
    
    @property([Node])
    frames: Node = [];

    @property([UILeaderboardFriendItem])
    clanItems: UILeaderboardFriendItem[] = [];
    @property(Node)
    clanItemsLayout: Node = null;

    @property(UICollectionDuplicateSendPlayersConfirm)
    confirmPopup: UICollectionDuplicateSendPlayersConfirm;

    @property(Clans)
    clans: Clans;

    private cardData: CollectionCardData;

    private colId: string;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        gamepush.channels.on('fetchMembers', (result) => {
            this.refreshClanMembers(result);
        });

        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => this.showFrame(index));
        }

        this.confirmPopup.node.on("send", (playerId) => this.sendCard(playerId));
    }


    init(data: CollectionCardData, collectionId: string) {
        this.cardData = data;

        this.colId = collectionId;
    }


    show() {
        super.show();

        Net.instance.fetchMembersOfChannel(this.clans.getClanId());

        this.showFrame(0);
    }


    onCloseBtnClick() {
        this.hide();
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].active = true;
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].active = false;
        }
    }


    async refreshClanMembers(result: any) {
        let members = [];

        try {
            for(let i = 0; i < result.items.length; i++) {
                let player = new PlayerEventData();
                player.playerName = result.items[i].state.name;
                player.progressValue = result.items[i].state.score;
                player.playerId = result.items[i].id;
    
                members.push(player);
            }

            members.sort((a, b) => b.progressValue - a.progressValue);

            for(let i = 0; i < members.length; i++) {
                if(i >= this.clanItems.length) {
                    const itemNode = instantiate(this.itemPrefab);

                    itemNode.on("profile", (data) => this.showProfile(data));

                    this.clanItemsLayout.addChild(itemNode);
            
                    let item = itemNode.getComponent("UILeaderboardFriendItem");
            
                    this.clanItems.push(item);
                }
    
                this.clanItems[i].init(i + 1);
                this.clanItems[i].refresh(members[i]);
            }

            this.loadClanPlayersInfo(members);

        } catch (error) {
            console.log('Error fetching friends:', error);
        }
    }

    async loadClanPlayersInfo(data: PlayerEventData[]) {
        try {
            let ids = [];
            for(let i = 0; i < data.length; i++) {
                ids.push(data[i].playerId);
            }
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            for(let i = 0; i < players.length && i < this.items.length; i++) {
                this.clanItems[i].setPlayerInfo(players[i]);
            }
        }
    
        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    showProfile(playerId: number) {
        this.confirmPopup.init(this.cardData, this.colId, playerId);

        this.confirmPopup.show();
    }

    sendCard(playerId: number) {
        this.node.emit("profile", playerId);

        this.hide();
    }
}


