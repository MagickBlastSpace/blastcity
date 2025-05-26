import { _decorator, Component, Node, Label, Sprite, Button, SpriteFrame, ProgressBar, tween } from 'cc';
import { UIEventRocketFeverItem } from '../RocketFever/UIEventRocketFeverItem';
import { RocketFeverEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
import { Localization } from '../../../utils/Localization';
import { UIRewardInfoMinified } from '../../UIRewardInfoMinified';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassItem')
export class UIEventBattlepassItem extends UIEventRocketFeverItem {

    @property(Label)
    rewardLabel_Premium: Label = null;

    @property(Sprite)
    rewardIcon_Premium: Sprite = null;

    @property([SpriteFrame])
    chestsIcons: SpriteFrame[] = [];

    @property(Node)
    complete_Premium: Node = null;

    @property(Node)
    block: Node = null;

    @property(Button)
    takeBtn_Premium: Button = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(SpriteFrame)
    specialPremium: SpriteFrame = null;

    @property(Node)
    stage_Complete: Node = null;

    @property(Button)
    showInfo_Premium: Button = null;

    @property(Node)
    info_Done: Node = null;
    @property(Node)
    info_Done_Premium: Node = null;
    @property(Node)
    info_Common_Premium: Node = null;
    @property(Node)
    info_x2_Premium: Node = null;
    @property(Node)
    info_Chest_Premium: Node = null;
    @property(UIRewardInfoMinified)
    info_Chest_Comp_Premium: UIRewardInfoMinified;

    private data: RocketFeverEventData;


    start() {
        this.takeBtn.node.on(Button.EventType.CLICK, this.onTakeBtnClick, this);
        this.takeBtn_Premium.node.on(Button.EventType.CLICK, this.onTakePremiumBtnClick, this);

        if(this.showInfoBtn) {
            this.showInfoBtn.node.on(Button.EventType.CLICK, this.onShowInfoBtnClick, this);
        }
        if(this.showInfo_Premium) {
            this.showInfo_Premium.node.on(Button.EventType.CLICK, this.onShowInfoBtnClick_Premium, this);
        }
    }


    refresh(stageNumber: number, data: RocketFeverEventData, currentStage: number) {
        super.refresh(stageNumber, data, currentStage);

        this.data = data;

        this.stageIndex = stageNumber;

        let isPremium = UserData.instance.getIsPremium();

        this.isComplete = currentStage > stageNumber;

        this.complete_Premium.active = this.isComplete && isPremium;

        this.block.active = !isPremium;

        this.rewardLabel_Premium.string = "";

        let minString = Localization.instance.getLabelByKey("misc.min");

        if(data.rewards.length > 1) {
            if(data.rewards[1].gold > 0) {
                this.rewardIcon_Premium.spriteFrame = this.gold;
                this.rewardLabel_Premium.string = data.rewards[1].gold;
            }

            if(data.rewards[1].startBonus_Bomb > 0) {
                this.rewardIcon_Premium.spriteFrame = this.bomb;
                this.rewardLabel_Premium.string = data.rewards[1].startBonus_Bomb;
            }
            if(data.rewards[1].startBonus_Rocket > 0) {
                this.rewardIcon_Premium.spriteFrame = this.rocket;
                this.rewardLabel_Premium.string = data.rewards[1].startBonus_Rocket;
            }
            if(data.rewards[1].startBonus_Discoball > 0) {
                this.rewardIcon_Premium.spriteFrame = this.discoball;
                this.rewardLabel_Premium.string = data.rewards[1].startBonus_Discoball;
            }

            if(data.rewards[1].booster_Hammer > 0) {
                this.rewardIcon_Premium.spriteFrame = this.hammer;
                this.rewardLabel_Premium.string = data.rewards[1].booster_Hammer;
            }
            if(data.rewards[1].booster_Bow > 0) {
                this.rewardIcon_Premium.spriteFrame = this.bow;
                this.rewardLabel_Premium.string = data.rewards[1].booster_Bow;
            }
            if(data.rewards[1].booster_Cannon > 0) {
                this.rewardIcon_Premium.spriteFrame = this.cannon;
                this.rewardLabel_Premium.string = data.rewards[1].booster_Cannon;
            }
            if(data.rewards[1].booster_Jester > 0) {
                this.rewardIcon_Premium.spriteFrame = this.jester;
                this.rewardLabel_Premium.string = data.rewards[1].booster_Jester;
            }

            if(data.rewards[1].bomb_Minutes > 0) {
                this.rewardIcon_Premium.spriteFrame = this.bomb;
                this.rewardLabel_Premium.string = data.rewards[1].bomb_Minutes + " " + minString;
            }
            if(data.rewards[1].rocket_Minutes > 0) {
                this.rewardIcon_Premium.spriteFrame = this.rocket;
                this.rewardLabel_Premium.string = data.rewards[1].rocket_Minutes + " " + minString;
            }
            if(data.rewards[1].discoball_Minutes > 0) {
                this.rewardIcon_Premium.spriteFrame = this.discoball;
                this.rewardLabel_Premium.string = data.rewards[1].discoball_Minutes + " " + minString;
            }

            if(data.rewards[1].endlessLives_Minutes > 0) {
                this.rewardIcon_Premium.spriteFrame = this.lives;
                this.rewardLabel_Premium.string = data.rewards[1].endlessLives_Minutes + " " + minString;
            }
            if(data.rewards[1].modifierX2_Minutes > 0) {
                this.rewardIcon_Premium.spriteFrame = this.x2;
                this.rewardLabel_Premium.string = data.rewards[1].modifierX2_Minutes + " " + minString;
            }
            if(data.rewards[1].cardsPack > 0) {
                this.rewardIcon_Premium.spriteFrame = this.cardsIcons[data.rewards[1].cardsPack - 1];
                this.rewardLabel_Premium.string = "";
            }

            if(stageNumber === 0) {
                this.rewardIcon_Premium.spriteFrame = this.specialPremium;
                this.rewardLabel_Premium.string = "";
            }
        }

        if(stageNumber % 5 === 0 && stageNumber > 0) {
            let chestIndex = stageNumber / 5;

            this.rewardIcon_Premium.spriteFrame = chestIndex < this.chestsIcons.length ? this.chestsIcons[chestIndex] : this.chestsIcons[this.chestsIcons.length - 1];

            this.rewardIcon.spriteFrame = this.chestsIcons[0];
            this.rewardLabel.string = "";
            this.rewardLabel_Premium.string = "";
        }

        if(currentStage > stageNumber) {
            tween(this.progressBar)
                .to(0.01, { progress: 1.0 })
                .start();
        }
        else if(currentStage < stageNumber) {
            tween(this.progressBar)
                .to(0.01, { progress: 0.0 })
                .start();
        }
        else {
            tween(this.progressBar)
                .to(2, { progress: 0.5 })
                .start();
        }


        this.complete.active = currentStage > stageNumber;
        this.current.active = currentStage === stageNumber;

        if(currentStage > stageNumber) {
            this.numberIcon.spriteFrame = this.complete_number;
        }
        else if(currentStage === stageNumber) {
            this.numberIcon.spriteFrame = this.current_number;
        }
        else {
            this.numberIcon.spriteFrame = this.next_number;
        }

        this.stage_Complete.active = currentStage > stageNumber;
    }


    refreshAvailability(isFreeTaken: boolean, isPremiumTaken: boolean) {
        let isPremium = UserData.instance.getIsPremium();

        this.takeBtn.node.active = !isFreeTaken && this.isComplete;
        this.takeBtn_Premium.node.active = !isPremiumTaken && this.isComplete && isPremium;

        this.complete.active = this.isComplete && isFreeTaken;
        this.complete_Premium.active = this.isComplete && isPremium && isPremiumTaken;
    }


    onTakeBtnClick() {
        this.node.emit("take", this.stageIndex);
    }

    onTakePremiumBtnClick() {
        this.node.emit("take_premium", this.stageIndex);
    }


    onShowInfoBtnClick() {
        if(this.complete.active) {
            this.info_Done.active = true;
        }
        else if(this.data.rewards[0].isChest) {
            this.info_Chest.active = true;

            this.info_Chest_Comp.initReward(this.data.rewards[0]);
        }
        else if(this.data.rewards[0].modifierX2_Minutes > 0) {
            this.info_x2.active = true;
        }
        else {
            this.info_Common.active = true;
        }
    }

    onShowInfoBtnClick_Premium() {
        if(this.complete.active) {
            this.info_Done_Premium.active = true;
        }
        else if(this.data.rewards[1].isChest) {
            this.info_Chest_Premium.active = true;

            this.info_Chest_Comp_Premium.initReward(this.data.rewards[1]);
        }
        else if(this.data.rewards[1].modifierX2_Minutes > 0) {
            this.info_x2_Premium.active = true;
        }
        else {
            this.info_Common_Premium.active = true;
        }
    }
}


