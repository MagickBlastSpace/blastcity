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
            this.requestChannels();
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
            return;
        }

        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.lastAttemptTimestamp = Date.now();

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.publishScore(this.eventId, "kings_cup_" + this.multiplayerChannelId, this.currentStep);

        this.updateMultiplayerData();
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.REWARD_COINS);

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
        this.players = [];

        try {
            const result = await Net.instance.fetchScoreLeaderboardData(this.eventId, this.eventId + "_" + this.multiplayerChannelId);
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].name;
                player.progressValue = players[i].score;

                this.players.push(player);
            }

            this.node.emit("refresh");

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);
        }
    }
}


