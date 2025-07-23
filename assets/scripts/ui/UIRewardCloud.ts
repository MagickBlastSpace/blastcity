import { _decorator, Component, Node, Vec3, tween, UITransform, SpriteFrame, Sprite, Label } from 'cc';
import { EventRewardData } from '../data/EventData';
import { Localization } from '../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIRewardCloud')
export class UIRewardCloud extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Label)
    count: Label = null;

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


    public showReward(reward: EventRewardData, startWorldPos: Vec3) {
        this.initData(reward);

        const parent = this.node.parent!;
        const localPos = parent.getComponent(UITransform)?.convertToNodeSpaceAR(startWorldPos) ?? startWorldPos;

        this.node.setPosition(localPos);
        this.node.setScale(Vec3.ONE);
        this.node.opacity = 0;

        const midOpacity = 204;
        const endPos = localPos.clone();
        endPos.y += 200;

        tween(this.node)
            .to(0.2, { opacity: midOpacity })
            .to(0.8, {
                position: endPos,
                scale: new Vec3(1.1, 1.1, 1),
                opacity: 0
            }, { easing: 'quadOut' })
            .call(() => this.node.destroy())
            .start();
    }


    public initData(data: EventRewardData) {
        let minString = Localization.instance.getLabelByKey("misc.min");

        this.icon.spriteFrame = null;
        this.count.string = "";

        if(data) {
            if(data.gold > 0) {
                this.icon.spriteFrame = this.gold;
                this.count.string = "+" + data.gold;
            }

            if(data.startBonus_Bomb > 0) {
                this.icon.spriteFrame = this.bomb;
                this.count.string = "+" + data.startBonus_Bomb;
            }
            if(data.startBonus_Rocket > 0) {
                this.icon.spriteFrame = this.rocket;
                this.count.string = "+" + data.startBonus_Rocket;
            }
            if(data.startBonus_Discoball > 0) {
                this.icon.spriteFrame = this.discoball;
                this.count.string = "+" + data.startBonus_Discoball;
            }

            if(data.booster_Hammer > 0) {
                this.icon.spriteFrame = this.hammer;
                this.count.string = "+" + data.booster_Hammer;
            }
            if(data.booster_Bow > 0) {
                this.icon.spriteFrame = this.bow;
                this.count.string = "+" + data.booster_Bow;
            }
            if(data.booster_Cannon > 0) {
                this.icon.spriteFrame = this.cannon;
                this.count.string = "+" + data.booster_Cannon;
            }
            if(data.booster_Jester > 0) {
                this.icon.spriteFrame = this.jester;
                this.count.string = "+" + data.booster_Jester;
            }

            if(data.bomb_Minutes > 0) {
                this.icon.spriteFrame = this.bomb;
                this.count.string = data.bomb_Minutes + " " + minString;
            }
            if(data.rocket_Minutes > 0) {
                this.icon.spriteFrame = this.rocket;
                this.count.string = data.rocket_Minutes + " " + minString;
            }
            if(data.discoball_Minutes > 0) {
                this.icon.spriteFrame = this.discoball;
                this.count.string = data.discoball_Minutes + " " + minString;
            }

            if(data.endlessLives_Minutes > 0) {
                this.icon.spriteFrame = this.lives;
                this.count.string = data.endlessLives_Minutes + " " + minString;
            }
            if(data.modifierX2_Minutes > 0) {
                this.icon.spriteFrame = this.x2;
                this.count.string = data.modifierX2_Minutes + " " + minString;
            }

            if(data.battlepass > 0) {
                this.icon.spriteFrame = this.battlepass;
                this.count.string = "";
            }
        }
    }
}
