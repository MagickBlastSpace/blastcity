import { _decorator, Component, Node, Label, Sprite, SpriteFrame, sp, Button } from 'cc';
import { RocketFeverEventData } from '../../../data/EventData';
import { Localization } from '../../../utils/Localization';
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
    @property(SpriteFrame)
    cards: SpriteFrame = null;
    @property(SpriteFrame)
    chestIcon: SpriteFrame = null;

    @property(Node)
    complete: Node = null;
    @property(Node)
    current: Node = null;
    @property(Node)
    locked: Node = null;

    @property(Sprite)
    numberIcon: Sprite = null;

    @property(SpriteFrame)
    complete_number: SpriteFrame = null;
    @property(SpriteFrame)
    current_number: SpriteFrame = null;
    @property(SpriteFrame)
    next_number: SpriteFrame = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(Button)
    takeBtn: Button = null;

    private stageIndex: number = 0;
    private isComplete: boolean = false;


    start() {
        this.takeBtn.node.on(Button.EventType.CLICK, this.onTakeBtnClick, this);
    }


    refresh(stageNumber: number, data: RocketFeverEventData, currentStage: number) {
        this.numberLabel.string = stageNumber;

        this.rewardLabel.string = "";

        let minString = Localization.instance.getLabelByKey("misc.min");

        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
                this.rewardLabel.string = data.rewards[0].gold;
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].startBonus_Bomb;
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].startBonus_Rocket;
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].startBonus_Discoball;
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
                this.rewardLabel.string = data.rewards[0].booster_Hammer;
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
                this.rewardLabel.string = data.rewards[0].booster_Bow;
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
                this.rewardLabel.string = data.rewards[0].booster_Cannon;
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
                this.rewardLabel.string = data.rewards[0].booster_Jester;
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].bomb_Minutes + " " + minString;
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].rocket_Minutes + " " + minString;
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].discoball_Minutes + " " + minString;
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
                this.rewardLabel.string = data.rewards[0].endlessLives_Minutes + " " + minString;
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
                this.rewardLabel.string = data.rewards[0].modifierX2_Minutes + " " + minString;
            }
            if(data.rewards[0].cardsPack > 0) {
                this.rewardIcon.spriteFrame = this.cards;
                this.rewardLabel.string = "";
            }
            if(data.rewards[0].isChest) {
                this.rewardIcon.spriteFrame = this.chestIcon;
                this.rewardLabel.string = "";
            }
        }

        this.complete.active = currentStage >= stageNumber;
        this.locked.active = currentStage < stageNumber - 1;
        this.current.active = currentStage === stageNumber - 1;

        if(currentStage >= stageNumber) {
            this.numberIcon.spriteFrame = this.complete_number;
        }
        else if(currentStage === stageNumber - 1) {
            this.numberIcon.spriteFrame = this.current_number;

            /*if(this.spine) {
                this.spine.setAnimation(0, "animation", true);
            }*/
        }
        else {
            this.numberIcon.spriteFrame = this.next_number;
        }

        this.stageIndex = stageNumber;
        
        this.isComplete = currentStage >= stageNumber;
    }


    onTakeBtnClick() {
        this.node.emit("take", this.stageIndex);
    }
}


