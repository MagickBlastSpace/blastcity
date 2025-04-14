import { _decorator, Component, Node, Sprite, SpriteFrame, Label } from 'cc';
import { EventRewardData } from '../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIRewardInfo')
export class UIRewardInfo extends Component {

    @property([Sprite])
    rewardIcons: Sprite[] = [];
    @property([Node])
    rewardNodes: Node[] = [];
    @property([Label])
    rewardLabels: Label[] = [];

    @property(SpriteFrame)
    gold: SpriteFrame = null;
    @property(SpriteFrame)
    rocket: SpriteFrame = null;
    @property(SpriteFrame)
    bomb: SpriteFrame = null;
    @property(SpriteFrame)
    discoball: SpriteFrame = null;
    @property(SpriteFrame)
    hammer: SpriteFrame = null;
    @property(SpriteFrame)
    cannon: SpriteFrame = null;
    @property(SpriteFrame)
    bow: SpriteFrame = null;
    @property(SpriteFrame)
    jester: SpriteFrame = null;
    @property(SpriteFrame)
    x2: SpriteFrame = null;
    @property(SpriteFrame)
    lives: SpriteFrame = null;
    @property(SpriteFrame)
    battlepass: SpriteFrame = null;
    @property(SpriteFrame)
    chest: SpriteFrame = null;

    private curIdx: number = 0;


    init(data: EventRewardData) {
        this.setAllInactive();

        this.curIdx = 0;

        if(data) {
            if(data.gold > 0) {
                this.setNextReward(this.gold, data.gold);
            }

            if(data.startBonus_Bomb > 0) {
                this.setNextReward(this.bomb, data.startBonus_Bomb);
            }

            if(data.startBonus_Rocket > 0) {
                this.setNextReward(this.rocket, data.startBonus_Rocket);
            }

            if(data.startBonus_Discoball > 0) {
                this.setNextReward(this.discoball, data.startBonus_Discoball);
            }


            if(data.bomb_Minutes > 0) {
                this.setNextReward(this.bomb, data.bomb_Minutes);
            }

            if(data.rocket_Minutes > 0) {
                this.setNextReward(this.rocket, data.rocket_Minutes);
            }

            if(data.discoball_Minutes > 0) {
                this.setNextReward(this.discoball, data.discoball_Minutes);
            }


            if(data.booster_Hammer > 0) {
                this.setNextReward(this.hammer, data.booster_Hammer);
            }

            if(data.booster_Bow > 0) {
                this.setNextReward(this.bow, data.booster_Bow);
            }

            if(data.booster_Cannon > 0) {
                this.setNextReward(this.cannon, data.booster_Cannon);
            }

            if(data.booster_Jester > 0) {
                this.setNextReward(this.jester, data.booster_Jester);
            }

            if(data.endlessLives_Minutes > 0) {
                this.setNextReward(this.lives, data.endlessLives_Minutes);
            }

            if(data.modifierX2_Minutes > 0) {
                this.setNextReward(this.x2, data.modifierX2_Minutes);
            }
        }
    }


    setNextReward(sp: SpriteFrame, count: number) {
        if(this.curIdx >= this.rewardNodes.length) {
            return;
        }

        this.rewardNodes[this.curIdx].active = true;
        this.rewardIcons[this.curIdx].spriteFrame = sp;
        this.rewardLabels[this.curIdx].string = "x" + count;

        this.curIdx = this.curIdx + 1;
    }


    setAllInactive() {
        for(let i = 0; i < this.rewardNodes.length; i++) {
            this.rewardNodes[i].active = false;
        }
    }
}


