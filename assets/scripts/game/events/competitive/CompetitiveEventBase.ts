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
            if(this.multiplayerChannelId > 0) {
                return;
            }

            if(!this.isEventAvailable() || this.isStarted) {
                return;
            }

            for(let i = 0; i < result.items.length; i++) {
                let channel = result.items[i];

                if(!channel.tags.includes("event")) {
                    return;
                }

                if(channel.tags.includes(this.eventId)) {
                    if(channel.membersCount < channel.capacity) {
                        this.tryToJoinMultiplayerChannel(channel.id);
                        return;
                    }
                }
            }

            if(result.canLoadMore) {
                this.requestMoreChannels();
            }
            else {
                this.createChannel();
            }
        });

        gamepush.channels.on('error:fetchChannels', (err) => {
            console.log("Error fetch multiplayer channel for: " + this.eventId + ": " + err);
        });


        gamepush.channels.on('fetchMoreChannels', (result) => {
            if(this.multiplayerChannelId > 0) {
                return;
            }

            for(let i = 0; i < result.items.length; i++) {
                let channel = result.items[i];

                if(!channel.tags.includes("event")) {
                    return;
                }

                if(channel.tags.includes(this.eventId)) {
                    if(channel.membersCount < channel.capacity) {
                        this.tryToJoinMultiplayerChannel(channel.id);
                        return;
                    }
                }
            }

            if(result.canLoadMore) {
                this.requestMoreChannels();
            }
            else {
                this.createChannel();
            }
        });

        gamepush.channels.on('error:fetchMoreChannels', (err) => {
            console.log("Error fetch more multiplayer channel for: " + this.eventId);
        });

        gamepush.channels.on('fetchMembers', (result) => {
            this.players = [];
            console.log("Fetching members: " + result.items.length);

            for(let i = 0; i < result.items.length; i++) {
                let member = result.items[i];

                let memberData = new PlayerEventData();
                memberData.playerName = member.state.name;
                memberData.progressValue = member.state["score_" + this.eventId];

                memberData.playerName = memberData.playerName !== "" ? memberData.playerName : "Player" + member.state.id;

                this.players.push(memberData);
            }

            this.node.emit("refresh");
        });

        gamepush.channels.on('error:fetchMembers', (err) => {
            console.log("Error fetching members: " + err);
        });


        gamepush.channels.on('createChannel', (channel) => {
            console.log("Created MP channel: " + channel.id);

            if(!channel.tags.includes(this.eventId)) {
                return;
            }

            if(this.multiplayerChannelId > 0) {
                gamepush.channels.deleteChannel({ channelId: channel.id });
                return;
            }

            this.multiplayerChannelId = channel.id;

            SaveData.instance.saveEvent(this.eventId);
        });

        gamepush.channels.on('error:createChannel', (err) => {
            console.log("Error creating MP channel: " + err);
        });

        gamepush.channels.on('deleteChannel', () => {
            this.requestChannels();
        });
    }


    activateEvent() {
        if(this.multiplayerChannelId === 0) {
            console.log("Multiplayer is not ready");
            return;
        }

        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;

            this.lastAttemptTimestamp = Date.now();

            this.updateMultiplayerData();
        }
    }

    
    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

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


    async createChannel() {
        try {
            const response = await gamepush.channels.createChannel({ template: this.eventId });
        } catch (error) {
            console.log('Error create channels:', error);
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

        SaveData.instance.saveEvent(this.eventId);

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


    public updateMultiplayerData() {
        if(this.multiplayerChannelId > 0 && this.isStarted) {
            this.fetchMembersOfChannel(this.multiplayerChannelId);
        }
        else {
            this.node.emit("refresh");
        }
    }


    restartEvent(): void {
        console.log("Restarting Multiplayer Event: " + this.eventId);
        this.init(this.startTime.getUTCHours(), this.getEventDuration());

        gamepush.channels.deleteChannel({ channelId: this.multiplayerChannelId });
        this.multiplayerChannelId = 0;

        gamepush.player.set('score_' + this.eventId, 0);
        gamepush.player.sync();

        SaveData.instance.saveEvent(this.eventId);
    }
}


