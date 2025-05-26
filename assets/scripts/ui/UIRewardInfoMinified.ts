import { _decorator, Component, Node, Sprite, SpriteFrame, Button, Label } from 'cc';
import { EventRewardData } from '../data/EventData';
import { ChestRewardData } from '../data/ChestData';
import { Localization } from '../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIRewardInfoMinified')
export class UIRewardInfoMinified extends Component {

    @property([Sprite])
    rewardIcons: Sprite[] = [];
    @property([Label])
    rewardLabels: Label[] = [];
    @property([Node])
    rewardNodes: Node[] = [];
    @property([Node])
    rewardNodesDivider: Node[] = [];

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

    @property([SpriteFrame])
    cards: SpriteFrame[] = [];

    @property(Button)
    closeBtn: Button = null;

    private curIdx: number = 0;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    initReward(data: EventRewardData) {
        this.setAllInactive();

        this.curIdx = 0;

        if(data) {
            if(data.cardsPack > 0) {
                let cardsLabel = "2 карты";
                switch(data.cardsPack) {
                    case 2:
                        cardsLabel = "3 карты";
                        break;
                    case 3:
                        cardsLabel = "4 карты";
                        break;
                    case 4:
                        cardsLabel = "6 карт";
                        break;
                    case 5:
                        cardsLabel = "6 карт";
                        break;
                }
                this.setNextReward(this.cards[data.cardsPack - 1], cardsLabel);
            }
            if(data.gold > 0) {
                this.setNextReward(this.gold, data.gold + "");
            }

            if(data.startBonus_Bomb > 0) {
                this.setNextReward(this.bomb, data.startBonus_Bomb + "");
            }

            if(data.startBonus_Rocket > 0) {
                this.setNextReward(this.rocket, data.startBonus_Rocket + "");
            }

            if(data.discoball_Minutes > 0) {
                this.setNextReward(this.discoball, data.discoball_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.bomb_Minutes > 0) {
                this.setNextReward(this.bomb, data.bomb_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.rocket_Minutes > 0) {
                this.setNextReward(this.rocket, data.rocket_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.startBonus_Discoball > 0) {
                this.setNextReward(this.discoball, data.startBonus_Discoball + "");
            }

            if(data.booster_Hammer > 0) {
                this.setNextReward(this.hammer, data.booster_Hammer + "");
            }

            if(data.booster_Bow > 0) {
                this.setNextReward(this.bow, data.booster_Bow + "");
            }

            if(data.booster_Cannon > 0) {
                this.setNextReward(this.cannon, data.booster_Cannon + "");
            }

            if(data.booster_Jester > 0) {
                this.setNextReward(this.jester, data.booster_Jester + "");
            }

            if(data.endlessLives_Minutes > 0) {
                this.setNextReward(this.lives, data.endlessLives_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.modifierX2_Minutes > 0) {
                this.setNextReward(this.x2, data.modifierX2_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }
        }
    }


    initReward_Chest(data: ChestRewardData) {
        this.setAllInactive();

        this.curIdx = 0;

        if(data) {
            if(data.gold > 0) {
                this.setNextReward(this.gold, data.gold + "");
            }

            if(data.startBonus_Bomb > 0) {
                this.setNextReward(this.bomb, data.startBonus_Bomb + "");
            }

            if(data.startBonus_Rocket > 0) {
                this.setNextReward(this.rocket, data.startBonus_Rocket + "");
            }

            if(data.discoball_Minutes > 0) {
                this.setNextReward(this.discoball, data.discoball_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.bomb_Minutes > 0) {
                this.setNextReward(this.bomb, data.bomb_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.rocket_Minutes > 0) {
                this.setNextReward(this.rocket, data.rocket_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.startBonus_Discoball > 0) {
                this.setNextReward(this.discoball, data.startBonus_Discoball + "");
            }

            if(data.booster_Hammer > 0) {
                this.setNextReward(this.hammer, data.booster_Hammer + "");
            }

            if(data.booster_Bow > 0) {
                this.setNextReward(this.bow, data.booster_Bow + "");
            }

            if(data.booster_Cannon > 0) {
                this.setNextReward(this.cannon, data.booster_Cannon + "");
            }

            if(data.booster_Jester > 0) {
                this.setNextReward(this.jester, data.booster_Jester + "");
            }

            if(data.endlessLives_Minutes > 0) {
                this.setNextReward(this.lives, data.endlessLives_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }

            if(data.modifierX2_Minutes > 0) {
                this.setNextReward(this.x2, data.modifierX2_Minutes + " " + Localization.instance.getLabelByKey("misc.min"));
            }
        }
    }


    setNextReward(sp: SpriteFrame, countLabel: string) {
        if(this.curIdx >= this.rewardNodes.length) {
            return;
        }

        this.rewardNodes[this.curIdx].active = true;
        this.rewardIcons[this.curIdx].spriteFrame = sp;

        if(this.rewardLabels.length > this.curIdx) {
            this.rewardLabels[this.curIdx].string = countLabel;
        }
        
        if(this.curIdx > 0) {
            this.rewardNodesDivider[this.curIdx - 1].active = true;
        }

        this.curIdx = this.curIdx + 1;
    }


    setAllInactive() {
        for(let i = 0; i < this.rewardNodes.length; i++) {
            this.rewardNodes[i].active = false;
        }

        for(let i = 0; i < this.rewardNodesDivider.length; i++) {
            this.rewardNodesDivider[i].active = false;
        }
    }


    onCloseBtnClick() {
        this.node.active = false;
    }
}


