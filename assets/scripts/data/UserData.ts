import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('UserData')
export class UserData extends Component {

    private currentProgress: number = 0;
    private levelsCount: number = 0;

    private Gold: number = 0;

    public static instance: UserData = null;


    onLoad() {
        UserData.instance = this;
    }
    
    start() {
        this.currentProgress = 0;

        this.Gold = 5000;
        this.node.emit("resources_update", this.Gold);
    }


    addProgress() {
        if(this.currentProgress < this.levelsCount - 1) {
            this.currentProgress++;
        }
    }

    getProgress(): number {
        return this.currentProgress;
    }

    setLevelsCount(levelsCount: number) {
        this.levelsCount = levelsCount;
    }


    addResource(resourceType: string, value: number) {
        switch(resourceType) {
            case "gold":
                this.Gold += value;
                break;
        }

        this.node.emit("resources_update", this.Gold);
    }

    subResource(resourceType: string, value: number) {
        switch(resourceType) {
            case "gold":
                this.Gold -= value;
                break;
        }

        this.node.emit("resources_update", this.Gold);
    }
}


