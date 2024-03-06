import { _decorator, Component, Node } from 'cc';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
import { UserData } from '../../../data/UserData';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventSpaceMissionPlayerItem')
export class UIEventSpaceMissionPlayerItem extends UIEventSkyRacePlayerItem {
    refresh(data: PlayerEventData, totalSteps: number) {
        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue + "/" + totalSteps;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.playerName;
    }
}


