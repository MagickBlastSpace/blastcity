import { _decorator, Component, Node } from 'cc';
import { ChestData, ChestRewardData } from '../data/ChestData';
import { UserData } from '../data/UserData';
import { SaveData } from '../data/SaveData';
import { GameData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('Chest')
export class Chest extends Component {

    @property([ChestData])
    data: ChestData[] = [];

    private stage: number = 0;

    private collectables: number = 0;
    private stageStep: number = 0;

    private isComplete: boolean = false;

    private pickedRewards: number[] = [];


    onLoad() {
        this.stage = 0;
        this.collectables = 0;
    }

    start() {
        SaveData.instance.loadChest();

        UserData.instance.node.on("stars", (value) => this.updateStageData(true));
        GameData.instance.node.on("levels_loaded", () => this.updateStageData(false));
    }


    completeStage() {
        if(this.isComplete) {
            this.applyRewards(this.data[this.stage].rewards);

            this.pickedRewards.push(this.stage);

            if(this.stage < this.data.length - 1) {
                this.stage = this.stage + 1;
            }

            this.isComplete = false;

            SaveData.instance.saveChest();

            this.updateStageData(true);

            this.node.emit("complete");
        }
    }

    isStageComplete(): boolean {
        return this.isComplete;
    }

    
    getStage(): number {
        return this.stage;
    }


    setStage(stage: number) {
        this.stage = stage;

        this.node.emit("refresh");
    }


    getCollectables(): number {
        return this.collectables;
    }

    setCollectables(value: number) {
        this.collectables = value;

        this.node.emit("refresh");
    }


    getStageStep(): number {
        return this.stageStep;
    }


    getData(): ChestData[] {
        return this.data;
    }


    getPickedRewards(): number[] {
        return this.pickedRewards;
    }

    setPickedRewards(rewards: number[]) {
        this.pickedRewards = [];

        if(!rewards || rewards === undefined) {
            return;
        }

        for(let i = 0; i < rewards.length; i++) {
            this.pickedRewards.push(rewards[i]);
        }
    }


    private applyRewards(rewards: ChestRewardData[]) {
        for(let i = 0; i < rewards.length; i++) {
            this.applyReward(rewards[i]);
        }
    }

    private applyReward(reward: ChestRewardData) {
        UserData.instance.addResource("gold", reward.gold);

        UserData.instance.addResource("bomb", reward.startBonus_Bomb);
        UserData.instance.addResource("rocket", reward.startBonus_Rocket);
        UserData.instance.addResource("discoball", reward.startBonus_Discoball);

        UserData.instance.addResource("hammer", reward.booster_Hammer);
        UserData.instance.addResource("bow", reward.booster_Bow);
        UserData.instance.addResource("cannon", reward.booster_Cannon);
        UserData.instance.addResource("jester", reward.booster_Jester);

        UserData.instance.addResource("bomb_minutes", reward.bomb_Minutes);
        UserData.instance.addResource("rocket_minutes", reward.rocket_Minutes);
        UserData.instance.addResource("discoball_minutes", reward.discoball_Minutes);
        UserData.instance.addResource("endless_lives_minutes", reward.endlessLives_Minutes);
        UserData.instance.addResource("modifier_x2_minutes", reward.modifierX2_Minutes);
    }


    updateStageData(updateComplete: boolean) {
        console.log("updating chest data...");

        let progress = UserData.instance.getProgress();

        let starsCounter = 0;
        let starsCollected = 0;

        /*
        king league mode
        */
        if(progress >= GameData.instance.getMaxProgress()) {
            let levelsData = GameData.instance.getLevels();

            progress = UserData.instance.getKingLeagueProgress() % levelsData.length;

            if(progress === 0) {
                console.log("complete level cycle in king league mode: " + progress);

                this.isComplete = updateComplete;
            }

            for(let i = 0; i < levelsData.length; i++) {
                switch(levelsData[i].difficulty) {
                    case "common":
                        starsCounter = starsCounter + 1;
                        if(progress > i) {
                            starsCollected = starsCollected + 1;
                        }
                        break;
                    case "hard":
                        starsCounter = starsCounter + 3;
                        if(progress > i) {
                            starsCollected = starsCollected + 3;
                        }
                        break;
                    case "superhard":
                        starsCounter = starsCounter + 5;
                        if(progress > i) {
                            starsCollected = starsCollected + 5;
                        }
                        break;
                }
            }
        }

        /*
        main progress complete, but new levels not done
        */
        else if(progress > this.data[this.data.length - 1].level) {
            if(progress % 100 === 0) {
                this.isComplete = updateComplete;

                console.log("complete level cycle in  after main mode: " + progress);
            }

            let startLevel = this.closestLowerHundred(progress);
            let endLevel = this.closestUpperHundred(progress);

            for(let i = startLevel; i < endLevel; i++) {
                let levelData = GameData.instance.getLevelDataByNumber(i);

                switch(levelData.difficulty) {
                    case "common":
                        starsCounter = starsCounter + 1;
                        if(progress > i) {
                            starsCollected = starsCollected + 1;
                        }
                        break;
                    case "hard":
                        starsCounter = starsCounter + 3;
                        if(progress > i) {
                            starsCollected = starsCollected + 3;
                        }
                        break;
                    case "superhard":
                        starsCounter = starsCounter + 5;
                        if(progress > i) {
                            starsCollected = starsCollected + 5;
                        }
                        break;
                }
            }
        }

        /*
        main progress not complete
        */
        else {
            if(progress >= this.data[this.stage].level) {
                if(!this.pickedRewards.includes(this.stage)) {
                    this.isComplete = true;
                }
                else {
                    if(this.stage < this.data.length - 1) {
                        this.stage = this.stage + 1;
                    }

                    SaveData.instance.saveChest();

                    this.updateStageData(updateComplete);

                    return;
                }
            }

            let startLevel = 0;

            if(this.stage > 0) {
                startLevel = this.data[this.stage - 1].level;
            }

            let endLevel = this.data[this.stage].level;

            for(let i = startLevel; i < endLevel; i++) {
                let levelData = GameData.instance.getLevelDataByNumber(i);

                switch(levelData.difficulty) {
                    case "common":
                        starsCounter = starsCounter + 1;
                        if(progress > i) {
                            starsCollected = starsCollected + 1;
                        }
                        break;
                    case "hard":
                        starsCounter = starsCounter + 3;
                        if(progress > i) {
                            starsCollected = starsCollected + 3;
                        }
                        break;
                    case "superhard":
                        starsCounter = starsCounter + 5;
                        if(progress > i) {
                            starsCollected = starsCollected + 5;
                        }
                        break;
                }
            }
        }

        this.stageStep = starsCounter;
        this.collectables = starsCollected;

        console.log("stage step: " + this.stageStep);
        console.log("collected: " + this.collectables);

        this.node.emit("refresh");
    }


    closestLowerHundred(num: number): number {
        return Math.floor(num / 100) * 100;
    }
    
    closestUpperHundred(num: number): number {
        return Math.ceil(num / 100) * 100;
    }
}


