import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { RocketFeverEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventRocketFeverRewardIcon')
export class UIEventRocketFeverRewardIcon extends Component {
    
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


    refresh(data: RocketFeverEventData) {
        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
            }
        }
    }
}


