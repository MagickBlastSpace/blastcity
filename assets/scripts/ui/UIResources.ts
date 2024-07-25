declare const gamepush: any;

import { _decorator, Component, Node, Label } from 'cc';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIResources')
export class UIResources extends Component {

    @property(Label)
    goldLabel: Label = null;

    @property(Label)
    energyLabel: Label = null;
    @property(Label)
    energyTimer: Label = null;

    private lastEnergySeconds: number = 0;


    start() {
        UserData.instance.node.on("resources_update", (gold) => this.refresh(gold));

        this.energyLabel.string = gamepush.player.get('energy');
    }

    update(deltaTime: number) {
        let energySeconds = gamepush.player.get('energy:secondsLeft');

        this.energyTimer.string = energySeconds <= 0 ? "" : "+1 in: " + this.getSecondsLeftHuman();
        this.energyLabel.string = gamepush.player.get('energy');
    }

    refresh(gold: number) {
        this.goldLabel.string = gold;

        this.energyLabel.string = gamepush.player.get('energy');
    }


    getSecondsLeftHuman() {
        const secondsLeft = gamepush.player.get('energy:secondsLeft');
        return this.formatTime(secondsLeft);
    }

    formatTime(seconds: number) {
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
    }

    pad(num: number) {
        return String(num).padStart(2, '0');
    }
}


