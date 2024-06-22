declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { PlayerEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('CompetitiveEventBase')
export class CompetitiveEventBase extends WeeklyEventBase {

    @property(Node)
    level: Node = null;

    @property([PlayerEventData])
    players: PlayerEventData[] = [];

    private currentStep: number = 0;

    private isComplete: boolean = false;

    private multiplayerChannelId: number = 0;


    onLoad() {
        this.players = [];

        gamepush.channels.on('fetchChannels', (result) => {
            result.items.forEach((channel) => {
                if(channel.membersCount < channel.capacity) {
                    this.tryToJoinMultiplayerChannel(this.multiplayerChannelId);
                    return;
                }
            });

            if(result.canLoadMore) {
                this.requestMoreChannels();
            }
            else {
                gamepush.channels.createChannel({ template: this.eventId });
            }
        });

        gamepush.channels.on('error:fetchChannels', (err) => {
            console.log("Error fetch multiplayer channel for: " + this.eventId);
        });


        gamepush.channels.on('fetchMoreChannels', (result) => {
            result.items.forEach((channel) => {
                if(channel.membersCount < channel.capacity) {
                    this.tryToJoinMultiplayerChannel(this.multiplayerChannelId);
                    return;
                }
            });

            if(result.canLoadMore) {
                this.requestMoreChannels();
            }
            else {
                gamepush.channels.createChannel({ template: this.eventId });
            }
        });

        gamepush.channels.on('error:fetchMoreChannels', (err) => {
            console.log("Error fetch more multiplayer channel for: " + this.eventId);
        });


        gamepush.channels.on('join', () => {
            console.log("Successfully joined channel: " + this.multiplayerChannelId);

            this.isStarted = true;
            this.lastAttemptTimestamp = Date.now();

            SaveData.instance.saveEvent(this.eventId);

            this.fetchMembersOfChannel(this.multiplayerChannelId);
        });

        gamepush.channels.on('error:join', (err) => {
            console.log("Error joining channel: " + err);

            if(err === "already_in_channel") {
                this.isStarted = true;
                this.lastAttemptTimestamp = Date.now();

                SaveData.instance.saveEvent(this.eventId);

                this.fetchMembersOfChannel(this.multiplayerChannelId);
                return;
            }

            this.multiplayerChannelId = 0;
        });


        gamepush.channels.on('fetchMembers', (result) => {
            this.players = [];
            console.log("Fetching members: " + result.items.length);

            result.items.forEach((member) => {
                let memberData = new PlayerEventData();
                memberData.playerName = member.state.name;
                memberData.progressValue = member.state.score;

                console.log("Member: " + member.state.name + " --- " + member.state.score);

                this.players.push(memberData);

                this.node.emit("refresh");
            });
        });

        gamepush.channels.on('error:fetchMembers', (err) => {
            console.log("Error fetching members: " + err);

            this.fetchMembersOfChannel(this.multiplayerChannelId);
        });


        gamepush.channels.on('createChannel', (channel) => {
            console.log("Created MP channel: " + channel.id);
            /*this.multiplayerChannelId = channel.id;

            this.isStarted = true;
            this.lastAttemptTimestamp = Date.now();

            SaveData.instance.saveEvent(this.eventId);*/

            //this.fetchMembersOfChannel(this.multiplayerChannelId);
            this.tryToJoinMultiplayerChannel(channel.id);
        });

        gamepush.channels.on('error:createChannel', (err) => {
            console.log("Error creating MP channel: " + err);
        });
    }


    activateEvent() {
        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.requestChannels();
            /*this.isStarted = true;

            this.lastAttemptTimestamp = Date.now();*/
        }
    }

    
    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        /*let player = new PlayerEventData();
        player.playerName = "Player";
        player.progressValue = this.currentStep;

        sortedPlayers.push(player);
        sortedPlayers = sortedPlayers.concat(this.players);*/
        sortedPlayers = this.players;

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
    }


    getIsComplete(): boolean {
        return this.isComplete;
    }

    setIsComplete(isComplete: boolean) {
        this.isComplete = isComplete;
    }


    getCurrentStage(): number {
        return this.currentStep;
    }

    setCurrentStage(stage: number) {
        this.currentStep = stage;
    }

    getMultiplayerChannel(): number {
        return this.multiplayerChannelId;
    }

    setMultiplayerChannel(id: number) {
        this.multiplayerChannelId = id;
    }


    async requestChannels() {
        try {
            const response = await gamepush.channels.fetchChannels({
                tags: [this.eventId],
                limit: 100
            });
        } catch (error) {
            console.log('Error requestChannels:', error);
        }
    }

    async requestMoreChannels() {
        try {
            const response = await gamepush.channels.fetchMoreChannels({
                tags: [this.eventId],
                limit: 100
            });
        } catch (error) {
            console.log('Error requestMoreChannels:', error);
        }
    }

    async tryToJoinMultiplayerChannel(id: number) {
        this.multiplayerChannelId = id;

        
        try {
            const response = await gamepush.channels.join({ channelId: id });
        } catch (error) {
            console.log('Error tryToJoinMultiplayerChannel:', error);
        }
    }

    async fetchMembersOfChannel(id: number) {
        console.log("Fetching members of channel: " + id);

        try {
            const response = await gamepush.channels.fetchMembers({
                channelId: id,
            });
        } catch (error) {
            console.log('Error fetchMembersOfChannel:', error);
        }
    }
}


