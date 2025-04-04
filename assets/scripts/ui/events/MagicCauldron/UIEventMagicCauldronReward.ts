import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { EventRewardData } from '../../../data/EventData';
import { Localization } from '../../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronReward')
export class UIEventMagicCauldronReward extends Component {
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


    refresh(data: EventRewardData) {
        this.rewardLabel.string = "";
        this.rewardIcon.spriteFrame = null;

        let minString = Localization.instance.getLabelByKey("misc.min");

        if(data) {
            if(data.gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
                this.rewardLabel.string = "x" + data.gold;
            }

            if(data.startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = "x1";
            }
            if(data.startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = "x1";
            }
            if(data.startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = "x1";
            }

            if(data.booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
                this.rewardLabel.string = "x1";
            }
            if(data.booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
                this.rewardLabel.string = "x1";
            }
            if(data.booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
                this.rewardLabel.string = "x1";
            }
            if(data.booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
                this.rewardLabel.string = "x1";
            }

            if(data.bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.bomb_Minutes + " " + minString;
            }
            if(data.rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rocket_Minutes + " " + minString;
            }
            if(data.discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.discoball_Minutes + " " + minString;
            }

            if(data.endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
                this.rewardLabel.string = data.endlessLives_Minutes + " " + minString;
            }
            if(data.modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
                this.rewardLabel.string = data.modifierX2_Minutes + " " + minString;
            }
        }
    }
}


