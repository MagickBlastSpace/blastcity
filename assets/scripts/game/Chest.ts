declare const gamepush: any;

import { _decorator, Component } from 'cc';
import { ChestData, ChestRewardData } from '../data/ChestData';
import { GameData } from '../data/GameData';
import { SaveData } from '../data/SaveData';
import { UserData } from '../data/UserData';
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

        UserData.instance.node.on("stars", (value) => {
            this.updateStageData(true);

            this.node.emit("progress", value);
        });
        GameData.instance.node.on("levels_loaded", () => this.updateStageData(false));
    }


    completeStage() {

        if(!this.isComplete) {
            return;
        }

        const currentStage = this.getStage();

        const currentData = this.data[currentStage];

        if(!currentData) {
            return;
        }

        this.applyRewards(currentData.rewards);

        if(!this.pickedRewards.includes(currentStage)) {
            this.pickedRewards.push(currentStage);
        }

        if(currentStage < this.data.length - 1) {
            this.stage = currentStage + 1;
        }
        else {
            this.stage = currentStage;
        }

        this.isComplete = false;

        SaveData.instance.saveChest();

        this.updateStageData(true);

        this.node.emit("complete");
    }

    isStageComplete(): boolean {
        return this.isComplete;
    }


    getStage(): number {

        if(!this.data || this.data.length === 0) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(
                this.stage,
                this.data.length - 1
            )
        );
    }


    setStage(stage: number) {

        if(!this.data || this.data.length === 0) {
            this.stage = 0;
        }
        else {
            this.stage =
                Math.max(
                    0,
                    Math.min(
                        stage,
                        this.data.length - 1
                    )
                );
        }

        this.node.emit("refresh");
    }

    getLocationCount(): number {
        return this.data.length;
    }


    getLastLocationStage(): number {
        return Math.max(
            0,
            this.data.length - 1
        );
    }


    getLocationStartLevel(stage: number): number {

        const safeStage =
            Math.max(
                0,
                Math.min(
                    stage,
                    this.getLastLocationStage()
                )
            );

        if(safeStage === 0) {
            return 1;
        }

        return this.data[safeStage - 1].level + 1;
    }


    getLocationEndLevel(stage: number): number {

        const safeStage =
            Math.max(
                0,
                Math.min(
                    stage,
                    this.getLastLocationStage()
                )
            );

        return this.data[safeStage].level;
    }


    getMainLocationsEndLevel(): number {

        if(!this.data || this.data.length === 0) {
            return 0;
        }

        return this.data[this.data.length - 1].level;
    }

    getCurrentLocationProgress(): number {

        if(!this.data || this.data.length === 0) {
            return 0;
        }

        const currentStage =
            this.getStage();

        const startBoundary =
            currentStage === 0
                ? 0
                : this.data[currentStage - 1].level;

        const endBoundary =
            this.data[currentStage].level;

        const currentProgress =
            UserData.instance.getProgress();

        const locationLength =
            endBoundary - startBoundary;

        if(locationLength <= 0) {
            return 0;
        }

        const completedInLocation =
            currentProgress - startBoundary;

        return Math.max(
            0,
            Math.min(
                1,
                completedInLocation / locationLength
            )
        );
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

        if(!rewards) {
            return;
        }

        for(let i = 0; i < rewards.length; i++) {

            const rewardStage = rewards[i];

            if(
                rewardStage < 0 ||
                rewardStage >= this.data.length ||
                this.pickedRewards.includes(rewardStage)
            ) {
                continue;
            }

            this.pickedRewards.push(rewardStage);
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

        gamepush.player.add('stat_chests_open', 1);

        this.node.emit("reward", reward);
    }


    updateStageData(updateComplete: boolean) {
        console.log("updating chest data...");

        let progress = UserData.instance.getProgress();

        let starsCounter = 0;
        let starsCollected = 0;

        const lastLocationStage = this.data.length - 1;

        const finalLocationRewardPicked =
            this.pickedRewards.includes(
                lastLocationStage
            );

        /*
        king league mode
        */
        if(progress >= GameData.instance.getMaxProgress() && finalLocationRewardPicked) {
            let levelsData = GameData.instance.getLevels();

            progress = UserData.instance.getKingLeagueProgress() % levelsData.length;

            if(progress === 0) {
                console.log("complete level cycle in king league mode: " + progress);

                this.isComplete = updateComplete;
            }

            for(let i = 0; i < levelsData.length; i++) {
                if(levelsData[i] && levelsData[i] !== undefined) {
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
        }

        /*
        main progress complete, but new levels not done
        */
        else if(progress > this.data[this.data.length - 1].level && finalLocationRewardPicked) {
            if(progress % 100 === 0) {
                this.isComplete = updateComplete;

                console.log("complete level cycle in  after main mode: " + progress);
            }

            let startLevel = this.closestLowerHundred(progress);
            let endLevel = this.closestUpperHundred(progress);

            for(let i = startLevel; i < endLevel; i++) {
                let levelData = GameData.instance.getLevelDataByNumber(i);

                if(levelData && levelData !== undefined) {
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
        }

        /*
        main progress not complete
        */
        else {
            if(progress >= this.data[this.stage].level) {

                if(!this.pickedRewards.includes(this.stage)) {

                    this.isComplete = true;
                }
                else if(this.stage < this.data.length - 1) {

                    this.stage = this.stage + 1;

                    SaveData.instance.saveChest();

                    this.updateStageData(updateComplete);
                    return;
                }
                else {
                    this.isComplete = false;
                }

            }

            let startLevel = 0;

            if(this.stage > 0) {
                startLevel = this.data[this.stage - 1].level;
            }

            let endLevel = this.data[this.stage].level;

            for(let i = startLevel; i < endLevel; i++) {
                let levelData = GameData.instance.getLevelDataByNumber(i);

                if(levelData && levelData !== undefined) {
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


    getCurrentReward(): ChestRewardData {
        return this.data[this.stage].rewards[0];
    }
}


