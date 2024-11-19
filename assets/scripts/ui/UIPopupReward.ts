import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Button } from 'cc';
import { EventRewardData } from '../data/EventData';
import { UIPopupFrameBase } from './UIPopupFrameBase';
import { ShopItemData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIPopupReward')
export class UIPopupReward extends UIPopupFrameBase {

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
    battlepass: SpriteFrame = null;

    @property(Label)
    rewardLabel: Label = null;

    @property(Button)
    tapBtn: Button = null;
    @property(Node)
    tapNode: Node = null;

    private rewardsPool: EventRewardData[] = [];
    private rewardIndex: number = 0;


    start() {
        /*if (!this.tapBtn) {
            console.error("closeBtn is not assigned in the editor!");

            this.tapNode.on(Node.EventType.TOUCH_END, this.onCloseBtnClick, this);

            return;
        }*/

        //this.tapBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        //this.hideClean();
    }

    init(data: EventRewardData) {
        this.rewardsPool = [];
        this.rewardIndex = 0;

        if(data) {
            if(data.gold > 0) {
                let newData = new EventRewardData();
                newData.gold = data.gold;

                this.rewardsPool.push(newData);
            }

            if(data.startBonus_Bomb > 0) {
                let newData = new EventRewardData();
                newData.startBonus_Bomb = data.startBonus_Bomb;

                this.rewardsPool.push(newData);
            }
            if(data.startBonus_Rocket > 0) {
                let newData = new EventRewardData();
                newData.startBonus_Rocket = data.startBonus_Rocket;

                this.rewardsPool.push(newData);
            }
            if(data.startBonus_Discoball > 0) {
                let newData = new EventRewardData();
                newData.startBonus_Discoball = data.startBonus_Discoball;

                this.rewardsPool.push(newData);
            }

            if(data.booster_Hammer > 0) {
                let newData = new EventRewardData();
                newData.booster_Hammer = data.booster_Hammer;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Bow > 0) {
                let newData = new EventRewardData();
                newData.booster_Bow = data.booster_Bow;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Cannon > 0) {
                let newData = new EventRewardData();
                newData.booster_Cannon = data.booster_Cannon;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Jester > 0) {
                let newData = new EventRewardData();
                newData.booster_Jester = data.booster_Jester;

                this.rewardsPool.push(newData);
            }

            if(data.bomb_Minutes > 0) {
                let newData = new EventRewardData();
                newData.bomb_Minutes = data.bomb_Minutes;

                this.rewardsPool.push(newData);
            }
            if(data.rocket_Minutes > 0) {
                let newData = new EventRewardData();
                newData.rocket_Minutes = data.rocket_Minutes;

                this.rewardsPool.push(newData);
            }
            if(data.discoball_Minutes > 0) {
                let newData = new EventRewardData();
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
        }

        this.tapBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.showNext();
    }


    init_Shop(data: ShopItemData) {
        this.rewardsPool = [];
        this.rewardIndex = 0;

        if(data) {
            if(data.gold > 0) {
                let newData = new EventRewardData();
                newData.gold = data.gold;

                this.rewardsPool.push(newData);
            }

            if(data.bonuses_Minutes > 0) {
                let newData = new EventRewardData();
                newData.bomb_Minutes = data.bonuses_Minutes;
                this.rewardsPool.push(newData);

                newData = new EventRewardData();
                newData.rocket_Minutes = data.bonuses_Minutes;
                this.rewardsPool.push(newData);

                newData = new EventRewardData();
                newData.discoball_Minutes = data.bonuses_Minutes;
                this.rewardsPool.push(newData);
            }
            
            if(data.booster_Hammer > 0) {
                let newData = new EventRewardData();
                newData.booster_Hammer = data.booster_Hammer;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Bow > 0) {
                let newData = new EventRewardData();
                newData.booster_Bow = data.booster_Bow;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Cannon > 0) {
                let newData = new EventRewardData();
                newData.booster_Cannon = data.booster_Cannon;

                this.rewardsPool.push(newData);
            }
            if(data.booster_Jester > 0) {
                let newData = new EventRewardData();
                newData.booster_Jester = data.booster_Jester;

                this.rewardsPool.push(newData);
            }

            if(data.endlessLives_Minutes > 0) {
                let newData = new EventRewardData();
                newData.endlessLives_Minutes = data.endlessLives_Minutes;

                this.rewardsPool.push(newData);
            }
        }

        this.tapBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.showNext();
    }

    init_Battlepass() {
        this.rewardsPool = [];
        this.rewardIndex = 0;

        let newData = new EventRewardData();
        newData.battlepass = 1;

        this.rewardsPool.push(newData);

        this.tapBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.showNext();
    }


    /*show() {
        super.show();

        this.showNext();
    }*/


    onCloseBtnClick() {
        this.showNext();
    }


    showNext() {
        if(this.rewardIndex >= this.rewardsPool.length) {
            this.hide();

            return;
        }

        this.hideClean();
        this.show();
        
        this.rewardLabel.string = "";
        this.rewardIcon.spriteFrame = null;

        let data = this.rewardsPool[this.rewardIndex];

        if(data) {
            if(data.gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
                this.rewardLabel.string = "x" + data.gold;
            }

            if(data.startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = "x" + data.startBonus_Bomb;
            }
            if(data.startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = "x" + data.startBonus_Rocket;
            }
            if(data.startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = "x" + data.startBonus_Discoball;
            }

            if(data.booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
                this.rewardLabel.string = "x" + data.booster_Hammer;
            }
            if(data.booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
                this.rewardLabel.string = "x" + data.booster_Bow;
            }
            if(data.booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
                this.rewardLabel.string = "x" + data.booster_Cannon;
            }
            if(data.booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
                this.rewardLabel.string = "x" + data.booster_Jester;
            }

            if(data.bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.bomb_Minutes + " Min";
            }
            if(data.rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rocket_Minutes + " Min";
            }
            if(data.discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.discoball_Minutes + " Min";
            }

            if(data.endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
                this.rewardLabel.string = data.endlessLives_Minutes + " Min";
            }
            if(data.modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
                this.rewardLabel.string = data.modifierX2_Minutes + " Min";
            }

            if(data.battlepass > 0) {
                this.rewardIcon.spriteFrame = this.battlepass;
                this.rewardLabel.string = "";
            }
        }

        this.rewardIndex = this.rewardIndex + 1;
    }
}


