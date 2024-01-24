import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
const { ccclass, property } = _decorator;

@ccclass('UserData')
export class UserData extends Component {

    private currentProgress: number = 0;
    private levelsCount: number = 0;

    public static instance: UserData = null;


    onLoad() {
        UserData.instance = this;
    }
    
    start() {
        this.currentProgress = 0;
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
}


