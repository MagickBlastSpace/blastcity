declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { ClanData, ClanMemberData } from '../data/ClanData';
import { Net } from '../net/Net';
import { UserData } from '../data/UserData';
import { EventRewardData } from '../data/EventData';
const { ccclass, property } = _decorator;


@ccclass('Clans')
export class Clans extends Component {

    @property(Node)
    level: Node = null;

    private clans: ClanData[] = [];
    private myClan: ClanData = null;

    private playerClanId: number = 0;
    private playerClanName: string = "";

    private joinRequestId: number = 0;

    private clansUpdate: ClanData[] = [];

    private gifts: EventRewardData[] = [];

    private isItemsFromTeamChecked: boolean = false;


    onLoad() {
        this.clans = [];
        this.isMemberFetchAvailable = false;
    
        gamepush.channels.on('fetchChannels', (result) => {
            this.fetchChannelsResult(result);
        });
    
        gamepush.channels.on('error:fetchChannels', (err) => {
            console.log("Error fetch multiplayer channel for clans: " + err);
        });
    
    
        gamepush.channels.on('fetchMoreChannels', (result) => {
            this.fetchChannelsResult(result);
        });
    
        gamepush.channels.on('fetchMembers', (result) => {

            this.checkForItemsFromTeam(result);

            if(this.gifts.length > 0) {
                for(let i = 0; i < result.items.length; i++) {
                    let playerId = result.items[i].id;
        
                    for(let j = 0; j < this.gifts.length; j++) {
                        if(this.gifts[j].endlessLives_Minutes > 0) {
                            gamepush.channels.sendPersonalMessage({
                                playerId: playerId,
                                text: UserData.instance.getPlayerName() + " gives you " + this.gifts[j].endlessLives_Minutes + " endless lives minutes!",
                                tags: ['gift_lives_minutes_' + this.gifts[j].endlessLives_Minutes],
                            });
                        }
                    }
                }

                this.gifts = [];
            }
        });
    
        gamepush.channels.on('createChannel', (channel) => {
            if(!channel.tags.includes("clan")) {
                return;
            }
    
            if(this.playerClanId > 0) {
                gamepush.channels.deleteChannel({ channelId: channel.id });
                return;
            }
    
            this.refresh();
        });
    
        gamepush.channels.on('deleteChannel', () => {});

        gamepush.channels.on('leave', () => {
            this.refresh();
        });

        gamepush.channels.on('join', () => {
            this.refresh();
        });

        gamepush.channels.on('kick', () => {
            this.refresh();
        });

        gamepush.channels.on('event:leave', (memberLeave) => {
            this.refresh();
        });

        gamepush.channels.on('event:join', (member) => {
            if(this.playerClanId === member.channelId || UserData.instance.getPlayerId() === member.playerId) {
                this.refresh();
            }
        });

        gamepush.channels.on('event:rejectJoinRequest', (joinRequest) => {
            if(UserData.instance.getPlayerId() !== joinRequest.playerId) {
                return;
            }

            this.joinRequestId = 0;

            this.refresh();
        });
    }


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.isJoined()) {
            return;
        }

        Net.instance.publishScore("clan", "clan_" + this.playerClanId, UserData.instance.getProgress());
    }

    
    refresh() {
        this.clansUpdate = [];
        Net.instance.requestClansChannels();
    }

    
    private fetchChannelsResult(result: any) {
        for(let i = 0; i < result.items.length; i++) {
            let channel = result.items[i];

            if(!channel.tags.includes("clan")) {
                return;
            }

            let clanData = new ClanData();
            clanData.clanName = channel.name;
            clanData.clanId = channel.id;
            clanData.capacity = channel.capacity;
            clanData.membersCount = channel.membersCount;
            clanData.isJoined = channel.isJoined;
            clanData.ownerId = channel.ownerId;
            clanData.isPrivate = channel.private;

            this.clansUpdate.push(clanData);

            if(channel.isJoined) {
                this.playerClanId = channel.id;
                this.playerClanName = channel.name;

                this.joinRequestId = 0;

                Net.instance.publishScore("clan", "clan_" + this.playerClanId, UserData.instance.getProgress());

                UserData.instance.setClanName(this.playerClanName);

                this.myClan = clanData;
            }
        }

        if(result.canLoadMore) {
            Net.instance.requestMoreClansChannels();
            return;
        }

        this.clans = [];
            for(let i = 0; i < this.clansUpdate.length; i++) {
                this.clans.push(this.clansUpdate[i]);
            }
        this.clansUpdate = [];

        this.node.emit("refresh", this.clans);
    }


    joinClan(clanId: number) {
        if(this.isJoinRequested() || this.isJoined()) {
            return;
        }
        
        Net.instance.tryToJoinClanChannel(clanId, this.playerClanId);
    }

    joinPrivateClan(clanId: number) {
        if(this.isJoinRequested() || this.isJoined()) {
            return;
        }
        
        this.joinRequestId = clanId;

        Net.instance.tryToJoinClanChannel(clanId, this.playerClanId);
    }

    cancelJoinClan(clanId: number) {
        Net.instance.tryToCancelJoinClanChannel(clanId);

        //this.leaveClan(clanId);

        this.joinRequestId = 0;
    }

    leaveClan(clanId: number) {
        Net.instance.removeScore("clan", "clan_" + this.playerClanId);
        Net.instance.tryToLeaveClanChannel(clanId);

        this.playerClanId = 0;
        this.playerClanName = "";

        UserData.instance.setClanName(this.playerClanName);
    }

    createClan(data: string, isPrivate: boolean) {
        if(this.isJoined()) {
            return;
        }

        Net.instance.createClanChannel(data, isPrivate);
    }


    isJoined(): boolean {
        return this.playerClanId > 0;
    }


    getClanId(): number {
        return this.playerClanId;
    }

    getClanName(): string {
        return this.playerClanName;
    }


    getAllClans(): ClanData[] {
        return this.clans;
    }

    getMyClan(): ClanData {
        return this.myClan;
    }


    isJoinRequested(): boolean {
        return this.joinRequestId > 0;
    }

    getJoinRequestId(): number {
        return this.joinRequestId;
    }


    sendGiftToClanMembers(gift: EventRewardData) {
        this.gifts.push(gift);

        Net.instance.fetchMembersOfChannel(this.myClan.clanId);
    }


    async checkForItemsFromTeam(result: any) {
        /*if(this.isItemsFromTeamChecked) {
            return;
        }

        this.isItemsFromTeamChecked = true;*/



        for(let i = 0; i < result.items.length; i++) {
            let id = result.items[i].id;

            const response = await gamepush.channels.fetchPersonalMessages({
                playerId: id,
                tags: ['collection_card'],
                limit: 100,
                offset: 0,
            });

            response.items.forEach((message) => {
                UserData.instance.addRecievedCard(message.text, id);

                gamepush.channels.deleteMessage({ messageId: message.id });
            });
        }
    }
}


