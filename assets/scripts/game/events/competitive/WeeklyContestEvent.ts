import { _decorator, Component, Node } from 'cc';
import { SkyRaceEvent } from './SkyRaceEvent';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
import { Net } from '../../../net/Net';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('WeeklyContestEvent')
export class WeeklyContestEvent extends SkyRaceEvent {

    @property([PlayerEventData])
    bots: PlayerEventData[] = [];

    private playerPlace: number = -1;


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
        this.updateMultiplayerData();

        this.isComplete = true;

        this.playerPlace = this.players.findIndex(player => player.playerName === UserData.instance.getPlayerName());

        this.takeReward();

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

        this.applyReward(this.rewards[this.playerPlace]);

        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete && this.playerPlace > -1 && this.playerPlace < this.rewards.length;
    }


    restartEvent() {
        this.handleEventCompletion();

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);
    }


    public sortPlayersByProgress(): PlayerEventData[] {
        return this.players.sort((a, b) => b.progressValue - a.progressValue);
    }


    async updateMultiplayerData() {
        if(this.isUpdating) {
            return;
        }

        this.players = [];
        let ids = [];

        this.isUpdating = true;

        try {
            const result = await Net.instance.fetchScoreLeaderboardData("", "week_" + this.getWeekNumber(this.startTime));
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            //console.log('Players:', players.length);

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

            //TEMP
            if(this.players.length < 10) {
                let botsRequired = 10 - this.players.length;
                if(this.bots.length < botsRequired) {
                    this.bots = UserData.instance.getRandomPlayers(10 - this.players.length);

                    for(let i = 0; i < this.bots.length; i++) {
                        this.bots[i].progressValue = Math.floor(Math.random() * 30) + 10;
                    }

                    SaveData.instance.saveEvent(this.eventId);
                }
                
                for(let i = 0; i < botsRequired; i++) {
                    this.players.push(this.bots[i]);
                }
            }
            //TEMP

            this.node.emit("refresh");

            this.isUpdating = false;

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);

            this.isUpdating = false;
        }
    }

    getBots(): PlayerEventData[] {
        return this.bots;
    }

    setBots(bots: PlayerEventData[]) {
        this.bots = [];

        for(let i = 0; i < bots.length; i++) {
            this.bots.push(bots[i]);
        }
    }
}


