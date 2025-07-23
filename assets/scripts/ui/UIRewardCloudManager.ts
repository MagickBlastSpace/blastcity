import { _decorator, Component, Node, instantiate, Prefab, Vec3 } from 'cc';
import { EventRewardData } from '../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIRewardCloudManager')
export class UIRewardCloudManager extends Component {

    @property(Prefab)
    rewardPrefab: Prefab = null;

    private rewardsPool: EventRewardData[] = [];
    private rewardIndex: number = 0;

    private pos: Vec3;


    init(data: EventRewardData, pos: Vec3) {
        this.pos = pos;

        this.rewardsPool = [];
        this.rewardIndex = 0;

        if(data) {
            if(data.gold > 0) {
                let newData = new EventRewardData();
                newData.gold = data.gold;

                this.rewardsPool.push(newData);
            }

            if(data.startBonus_Bomb > 0 || data.startBonus_Rocket > 0 || data.startBonus_Discoball > 0) {
                let newData = new EventRewardData();

                newData.startBonus_Bomb = data.startBonus_Bomb;
                newData.startBonus_Rocket = data.startBonus_Rocket;
                newData.startBonus_Discoball = data.startBonus_Discoball;

                this.rewardsPool.push(newData);
            }

            if(data.booster_Hammer > 0 || data.booster_Bow > 0 || data.booster_Cannon > 0 || data.booster_Jester > 0) {
                let newData = new EventRewardData();

                newData.booster_Hammer = data.booster_Hammer;
                newData.booster_Bow = data.booster_Bow;
                newData.booster_Cannon = data.booster_Cannon;
                newData.booster_Jester = data.booster_Jester;

                this.rewardsPool.push(newData);
            }

            if(data.bomb_Minutes > 0 || data.rocket_Minutes > 0 || data.discoball_Minutes > 0) {
                let newData = new EventRewardData();

                newData.bomb_Minutes = data.bomb_Minutes;
                newData.rocket_Minutes = data.rocket_Minutes;
                newData.discoball_Minutes = data.discoball_Minutes;

                this.rewardsPool.push(newData);
            }

            if(data.endlessLives_Minutes > 0) {
                let newData = new EventRewardData();
                newData.endlessLives_Minutes = data.endlessLives_Minutes;

                this.rewardsPool.push(newData);
            }
            if(data.modifierX2_Minutes > 0) {
                let newData = new EventRewardData();
                newData.modifierX2_Minutes = data.modifierX2_Minutes;

                this.rewardsPool.push(newData);
            }
            if(data.cards && data.cards !== undefined) {
                if(data.cards.length > 0) {
                    let newData = new EventRewardData();
                    newData.cards = data.cards;
    
                    this.rewardsPool.push(newData);
                }
            }
        }

        this.showNext();
    }


    showNext() {
        if(this.rewardIndex >= this.rewardsPool.length) {
            return;
        }
        
        let data = this.rewardsPool[this.rewardIndex];

        const rewardNode = instantiate(this.rewardPrefab);
        this.node.addChild(rewardNode);

        const rewardComp = rewardNode.getComponent("UIRewardCloud");
        rewardComp?.showReward(data, new Vec3(this.pos.x + this.rewardIndex * 150, this.pos.y, 0));

        this.rewardIndex = this.rewardIndex + 1;

        this.scheduleOnce(() => {
            this.showNext();
        }, 0.2);
    }
}


