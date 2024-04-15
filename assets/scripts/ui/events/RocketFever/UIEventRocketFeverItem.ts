import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { RocketFeverEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventRocketFeverItem')
export class UIEventRocketFeverItem extends Component {

    @property(Label)
    numberLabel: Label = null;
    @property(Label)
    rewardLabel: Label = null;

    @property(Sprite)
    rewardIcon: Sprite = null;

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

    @property(Node)
    complete: Node = null;


    refresh(stageNumber: number, data: RocketFeverEventData, currentStage: number) {
        this.numberLabel.string = stageNumber;

        this.rewardLabel.string = "";

        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardIcon.frame = this.gold;
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardIcon.frame = this.bomb;
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardIcon.frame = this.rocket;
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardIcon.frame = this.discoball;
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardIcon.frame = this.hammer;
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardIcon.frame = this.bow;
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardIcon.frame = this.cannon;
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardIcon.frame = this.jester;
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardIcon.frame = this.bomb;
                this.rewardLabel.string = data.rewards[0].bomb_Minutes + " Min";
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardIcon.frame = this.rocket;
                this.rewardLabel.string = data.rewards[0].rocket_Minutes + " Min";
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardIcon.frame = this.discoball;
                this.rewardLabel.string = data.rewards[0].discoball_Minutes + " Min";
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardIcon.frame = this.lives;
                this.rewardLabel.string = data.rewards[0].endlessLives_Minutes + " Min";
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardIcon.frame = this.x2;
                this.rewardLabel.string = data.rewards[0].modifierX2_Minutes + " Min";
            }
        }

        this.complete.active = currentStage >= stageNumber;
    }
}


