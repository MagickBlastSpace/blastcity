declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { ClanData, ClanMemberData } from '../data/ClanData';
import { Net } from '../net/Net';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;


@ccclass('Clans')
export class Clans extends Component {

    private clans: ClanData[] = [];

    private playerClanId: number = 0;
    private playerClanName: string = "";

    private clansUpdate: ClanData[] = [];


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
    
        gamepush.channels.on('fetchMembers', (result) => {});
    
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

            this.clansUpdate.push(clanData);

            if(channel.isJoined) {
                this.playerClanId = channel.id;
                this.playerClanName = channel.name;

                UserData.instance.setClanName(this.playerClanName);
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
        Net.instance.tryToJoinClanChannel(clanId, this.playerClanId);
    }

    leaveClan(clanId: number) {
        Net.instance.tryToLeaveClanChannel(clanId);

        this.playerClanId = 0;
        this.playerClanName = "";
    }

    createClan() {
        if(this.isJoined()) {
            return;
        }

        Net.instance.createClanChannel();
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

    getPlayerClanMembers(): ClanMemberData[] {
        let members = [];

        if(this.playerClanId > 0) {
            let playerClan = this.clans.find(clan => clan.clanId === this.playerClanId);
            if(playerClan && playerClan !== undefined) {
                for(let i = 0; i < playerClan.members.length; i++) {
                    members.push(playerClan.members[i]);
                }
            }
        }

        return members;
    }
}


