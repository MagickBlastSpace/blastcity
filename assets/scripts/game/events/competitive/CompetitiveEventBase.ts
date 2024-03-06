import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('CompetitiveEventBase')
export class CompetitiveEventBase extends WeeklyEventBase {

    @property(Node)
    level: Node = null;

    @property([PlayerEventData])
    players: PlayerEventData[] = [];

    private currentStep: number = 0;

    private isComplete: boolean = false;


    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        let player = new PlayerEventData();
        player.playerName = "Player";
        player.progressValue = this.currentStep;

        sortedPlayers.push(player);
        sortedPlayers = sortedPlayers.concat(this.players);

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
}


