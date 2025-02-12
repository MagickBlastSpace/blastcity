declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { PlayerEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
import { Net } from '../../../net/Net';
import { UserData } from '../../../data/UserData';
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

    private isUpdating: boolean = false;


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

        gamepush.channels.on('error:fetchMoreChannels', (err) => {
            console.log("Error fetch more multiplayer channel for: " + this.eventId);
        });


        gamepush.channels.on('createChannel', (channel) => {
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
            Net.instance.requestEventsChannels();
        });
    }


    activateEvent() {
        if(this.multiplayerChannelId === 0) {
            console.log("Multiplayer is not ready");
            Net.instance.requestMoreChannels(this.eventId);
            return;
        }

        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;

            this.lastAttemptTimestamp = Date.now();
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


    createChannel() {
        Net.instance.createChannel(this.eventId);
    }

    requestMoreChannels() {
        Net.instance.requestMoreChannels(this.eventId);
    }

    tryToJoinMultiplayerChannel(id: number) {
        this.multiplayerChannelId = id;

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.tryToJoinMultiplayerChannel(id);
    }


    async updateMultiplayerData() {
        if(this.isUpdating) {
            return;
        }

        this.players = [];
        let ids = [];

        this.isUpdating = true;

        try {
            const result = await Net.instance.fetchScoreLeaderboardData(this.eventId, this.eventId + "_" + this.multiplayerChannelId);
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].name;
                player.progressValue = players[i].score;
                player.playerId = players[i].id;

                let id = players[i].id;

                if(!ids.includes(id)) {
                    ids.push(id);

                    this.players.push(player);
                }
            }

            this.node.emit("refresh");

            this.isUpdating = false;

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);

            this.isUpdating = false;
        }
    }


    restartEvent(): void {
        console.log("Restarting Multiplayer Event: " + this.eventId);
        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);

        gamepush.channels.deleteChannel({ channelId: this.multiplayerChannelId });
        this.multiplayerChannelId = 0;

        SaveData.instance.saveEvent(this.eventId);
    }
}


