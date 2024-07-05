import { _decorator, Component, Node } from 'cc';
import { SkyRaceEvent } from './SkyRaceEvent';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
import { Net } from '../../../net/Net';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('WeeklyContestEvent')
export class WeeklyContestEvent extends SkyRaceEvent {

    onLoad() {
        this.players = [];
    }

    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = true;

        this.eventId = "weekly_contest";
    }


    canParticipate(): boolean {
        return  super.canParticipate();
    }

    activateEvent() {}


    private handleEventCompletion() {
        //let sortedPlayers = this.sortPlayersByProgress(); find place etc.
        this.isComplete = true;

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        Net.instance.publishScore("", "week_" + this.getWeekNumber(this.startTime), this.currentStep);

        SaveData.instance.saveEvent(this.eventId);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.REWARD_COINS);

        this.isComplete = false;

        SaveData.instance.saveEvent(this.eventId);
    }

    isRewardAvailable(): boolean {
        return this.isComplete;
    }


    restartEvent() {
        this.handleEventCompletion();

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);
    }


    public sortPlayersByProgress(): PlayerEventData[] {
        return this.players;
    }


    async updateMultiplayerData() {
        this.players = [];

        try {
            const result = await Net.instance.fetchScoreLeaderboardData("", "week_" + this.getWeekNumber(this.startTime));
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            console.log('Players:', players.length);

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


