import { _decorator, Component, Node, Label, Slider, tween } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRacePlayerItem')
export class UIEventSkyRacePlayerItem extends Component {

    @property(Label)
    playerName: Label = null;
    @property(Label)
    progressLabel: Label = null;

    @property(Slider)
    slider: Slider | null = null;

    @property(Node)
    isPlayer: Node = null;


    refresh(data: PlayerEventData) {
        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.playerName || data.playerName === "My Team";

        if (!this.slider) {
            //console.warn("Slider component is not assigned.");
            return;
        }

        tween(this.slider)
            .to(2, { progress: data.progressValue / 15 }, { easing: 'quadInOut' })
            .start();
    }
}


