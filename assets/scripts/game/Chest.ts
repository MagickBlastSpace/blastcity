import { _decorator, Component, Node } from 'cc';
import { ChestData, ChestRewardData } from '../data/ChestData';
import { UserData } from '../data/UserData';
import { SaveData } from '../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('Chest')
export class Chest extends Component {

    @property([ChestData])
    data: ChestData[] = [];

    private stage: number = 0;
    private collectables: number = 0;


    onLoad() {
        this.stage = 0;
        this.collectables = 0;
    }

    start() {
        UserData.instance.node.on("stars", (value) => this.addCollectables(value));

        SaveData.instance.loadChest();
    }


    completeStage() {
        if(this.isStageComplete()) {
            console.log("start collectables: " + this.collectables);
            this.collectables = this.collectables - this.data[this.stage].stageStep;

            console.log("end collectables: " + this.collectables);

            this.applyRewards(this.data[this.stage].rewards);

            console.log("complete stage: " + this.stage);
            console.log("complete stage step: " + this.data[this.stage].stageStep);

            if(this.stage < this.data.length - 1) {
                this.stage = this.stage + 1;
            }

            console.log("new stage: " + this.stage);

            SaveData.instance.saveChest();

            this.node.emit("refresh");
        }
    }

    isStageComplete() {
        return this.collectables >= this.data[this.stage].stageStep;
    }

    addCollectables(value: number) {
        this.collectables += value;

        console.log("add collectables: " + this.collectables);

        SaveData.instance.saveChest();

        this.node.emit("refresh");
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
        return this.data[this.stage].stageStep;
    }


    getData(): ChestData[] {
        return this.data;
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
}


