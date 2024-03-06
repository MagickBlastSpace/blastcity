import { _decorator, Component, Node, Label } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRacePlayerItem')
export class UIEventSkyRacePlayerItem extends Component {

    @property(Label)
    playerName: Label = null;
    @property(Label)
    progressLabel: Label = null;

    @property(Node)
    isPlayer: Node = null;


    refresh(data: PlayerEventData) {
        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.playerName;
    }
}


