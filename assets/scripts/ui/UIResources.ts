declare const gamepush: any;

import { _decorator, Component, Node, Label } from 'cc';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIResources')
export class UIResources extends Component {

    @property(Label)
    goldLabel: Label = null;
    @property(Label)
    starsLabel: Label = null;

    @property(Label)
    energyLabel: Label = null;
    @property(Label)
    energyTimer: Label = null;

    @property(Label)
    endlessLivesTimer: Label = null;
    @property(Node)
    endlessLivesPanel: Node = null;

    //private lastEnergySeconds: number = 0;


    start() {
        UserData.instance.node.on("resources_update", (gold, stars) => this.refresh(gold, stars));

        if(this.energyLabel) {
            this.energyLabel.string = gamepush.player.get('energy');
        }
        
        if(this.goldLabel) {
            this.goldLabel.string = UserData.instance.getResource("gold");
        }
        
        if(this.starsLabel) {
            this.starsLabel.string = UserData.instance.getResource("stars");
        }
    }

    update(deltaTime: number) {
        if(this.endlessLivesTimer) {
            this.endlessLivesTimer.string = UserData.instance.getRemainingTimeString("endless_lives");
        }

        let energySeconds = gamepush.player.get('energy:secondsLeft');

        if(this.energyTimer) {
            this.energyTimer.string = energySeconds <= 0 ? "MAX" : this.getSecondsLeftHuman();
        }
        if(this.energyLabel) {
            this.energyLabel.string = gamepush.player.get('energy');
        }
        
        if(this.endlessLivesTimer) {
            if(this.endlessLivesTimer.string !== "") {
                this.endlessLivesPanel.active = true;
    
                return;
            }
        }
        
        this.endlessLivesPanel.active = false;
    }

    refresh(gold: number, stars: number) {
        if(this.goldLabel) {
            this.goldLabel.string = gold;
        }
        
        if(this.starsLabel) {
            this.starsLabel.string = stars;
        }
        
        if(this.energyLabel) {
            this.energyLabel.string = gamepush.player.get('energy');
        }
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


