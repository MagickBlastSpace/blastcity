declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { PlayerEventData } from '../../../data/EventData';
import { Clans } from '../../Clans';
import { Net } from '../../../net/Net';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('TeamEventBase')
export class TeamEventBase extends WeeklyEventBase {

    @property(Node)
    level: Node = null;

    @property([PlayerEventData])
    players: PlayerEventData[] = [];

    @property(Clans)
    clans: Clans = null;

    private currentStep: number = 0;

    private isComplete: boolean = false;


    onLoad() {
        this.players = [];

        gamepush.channels.on('fetchMembers', (result) => {
            this.players = [];

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
    }


    activateEvent() {
        if(!this.clans.isJoined()) { //TBD 10 players in clan minimum
            return;
        }

        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.currentStep = 0;

            gamepush.player.set('score_' + this.eventId, 0); //TBD: Set 0 for all
            gamepush.player.sync();

            this.isStarted = true;

            this.isComplete = false;

            this.updateMultiplayerData();

            SaveData.instance.saveEvent(this.eventId);
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


    fetchMembersOfChannel(id: number) {
        Net.instance.fetchMembersOfChannel(id);
    }


    public updateMultiplayerData() {
        let clanId = this.clans.getClanId();
        if(clanId === 0) {
            this.node.emit("refresh");
            return;
        }

        this.fetchMembersOfChannel(clanId);
    }


    restartEvent(): void {
        console.log("Restarting Multiplayer Event: " + this.eventId);
        this.init(this.startTime.getUTCHours(), this.getEventDuration());

        SaveData.instance.saveEvent(this.eventId);
    }


    getTotalPlayers(): number {
        return this.players.length;
    }

    isJoinedClan(): boolean {
        return this.clans.isJoined();
    }

    getClanName(): string {
        return this.clans.getClanName();
    }
}


