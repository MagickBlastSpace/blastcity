declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyContestEvent } from './WeeklyContestEvent';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
import { Net } from '../../../net/Net';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('KingsCupEvent')
export class KingsCupEvent extends WeeklyContestEvent {

    private TOTAL_PLAYERS: number = 50;


    onLoad() {
        this.players = [];

        gamepush.channels.on('fetchChannels', (result) => {
            /*for(let i = 0; i < result.items.length; i++) {
                let channel = result.items[i];

                if(channel.tags.includes("lightning")) {
                    console.log("deleting channel lightning: " + channel.id);
                    gamepush.channels.deleteChannel({ channelId: channel.id });
                }
            }*/

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
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;

        this.eventId = "kings_cup";
    }


    activateEvent() {
        if(this.multiplayerChannelId === 0) {
            console.log("Multiplayer is not ready");
            
            Net.instance.requestMoreChannels(this.eventId);

            return;
        }

        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;
        this.isChecked = true;

        this.lastAttemptTimestamp = Date.now();

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.publishScore(this.eventId, "kings_cup_" + this.multiplayerChannelId, this.currentStep);

        this.updateMultiplayerData();
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyRewards(this.unpickedRewards);

        this.unpickedRewards = [];

        this.isComplete = false;
        this.isStarted = false;

        SaveData.instance.saveEvent(this.eventId);
    }

    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        Net.instance.publishScore(this.eventId, "kings_cup_" + this.multiplayerChannelId, this.currentStep);

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }


    getTotalPlayers(): number {
        return this.TOTAL_PLAYERS;
    }

    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        sortedPlayers = this.players;

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
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

            this.playerPlace = this.players.findIndex(player => player.playerId === UserData.instance.getPlayerId());

            this.node.emit("refresh");

            this.isUpdating = false;

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);

            this.isUpdating = false;
        }
    }


    isRewardAvailable(): boolean {
        return this.unpickedRewards.length > 0;
    }

    restartEvent(): void {
        this.unpickedRewards = [];

        this.handleEventCompletion();

        if(this.playerPlace > -1 && this.playerPlace < this.rewards.length) {
            this.unpickedRewards.push(this.rewards[this.playerPlace]);
        }

        this.isChecked = false;

        super.restartEvent();
    }
}


