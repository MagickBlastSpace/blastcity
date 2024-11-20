import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Button, Layout } from 'cc';
import { EventRewardData } from '../data/EventData';
import { UIPopupFrameBase } from './UIPopupFrameBase';
import { ShopItemData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIPopupReward')
export class UIPopupReward extends UIPopupFrameBase {

    @property([Sprite])
    rewardIcons: Sprite[] = [];
    @property([Node])
    rewardNodes: Node[] = [];

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

    @property([Label])
    rewardLabels: Label[] = [];

    @property(Button)
    tapBtn: Button = null;
    @property(Node)
    tapNode: Node = null;

    @property(Layout)
    layout: Layout = null;

    private rewardsPool: EventRewardData[] = [];
    private rewardIndex: number = 0;
    private itemIndex: number = 0;


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
                newData.rocket_Minutes = data.bonuses_Minutes;
                newData.discoball_Minutes = data.bonuses_Minutes;

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


    show() {
        super.show();

        /*this.scheduleOnce(() => {
            this.layout.updateLayout();
        }, 0.32);*/
    }


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

        this.itemIndex = 0;
        
        for(let i = 0; i < this.rewardIcons.length; i++) {
            this.rewardIcons[i].spriteFrame = null;
        }
        for(let i = 0; i < this.rewardLabels.length; i++) {
            this.rewardLabels[i].string = "";
        }
        for(let i = 0; i < this.rewardNodes.length; i++) {
            this.rewardNodes[i].active = false;
        }

        let data = this.rewardsPool[this.rewardIndex];

        this.rewardIndex = this.rewardIndex + 1;

        if(data) {
            if(data.gold > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.gold;
                this.rewardLabels[this.itemIndex].string = "x" + data.gold;

                this.itemIndex = this.itemIndex + 1;
            }

            if(data.startBonus_Bomb > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.bomb;
                this.rewardLabels[this.itemIndex].string = "x" + data.startBonus_Bomb;

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.startBonus_Rocket > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.rocket;
                this.rewardLabels[this.itemIndex].string = "x" + data.startBonus_Rocket;

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.startBonus_Discoball > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.discoball;
                this.rewardLabels[this.itemIndex].string = "x" + data.startBonus_Discoball;

                this.itemIndex = this.itemIndex + 1;
            }

            if(data.booster_Hammer > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.hammer;
                this.rewardLabels[this.itemIndex].string = "x" + data.booster_Hammer;

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.booster_Bow > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.bow;
                this.rewardLabels[this.itemIndex].string = "x" + data.booster_Bow;

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.booster_Cannon > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.cannon;
                this.rewardLabels[this.itemIndex].string = "x" + data.booster_Cannon;

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.booster_Jester > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.jester;
                this.rewardLabels[this.itemIndex].string = "x" + data.booster_Jester;

                this.itemIndex = this.itemIndex + 1;
            }

            if(data.bomb_Minutes > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.bomb;
                this.rewardLabels[this.itemIndex].string = data.bomb_Minutes + " Min";

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.rocket_Minutes > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.rocket;
                this.rewardLabels[this.itemIndex].string = data.rocket_Minutes + " Min";

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.discoball_Minutes > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.discoball;
                this.rewardLabels[this.itemIndex].string = data.discoball_Minutes + " Min";

                this.itemIndex = this.itemIndex + 1;
            }

            if(data.endlessLives_Minutes > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.lives;
                this.rewardLabels[this.itemIndex].string = data.endlessLives_Minutes + " Min";

                this.itemIndex = this.itemIndex + 1;
            }
            if(data.modifierX2_Minutes > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.x2;
                this.rewardLabels[this.itemIndex].string = data.modifierX2_Minutes + " Min";

                this.itemIndex = this.itemIndex + 1;
            }

            if(data.battlepass > 0) {
                if(this.itemIndex >= this.rewardNodes.length || this.itemIndex >= this.rewardLabels.length || this.itemIndex >= this.rewardIcons.length) {
                    return;
                }

                this.rewardNodes[this.itemIndex].active = true;

                this.rewardIcons[this.itemIndex].spriteFrame = this.battlepass;
                this.rewardLabels[this.itemIndex].string = "";

                this.itemIndex = this.itemIndex + 1;
            }
        }
    }


    adjustResolution() {
        super.adjustResolution();

        this.layout.updateLayout();
    }
}


