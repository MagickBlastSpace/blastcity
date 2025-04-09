import { _decorator, Component, Node, Sprite, SpriteFrame, Button } from 'cc';
import { EventRewardData } from '../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIRewardInfoMinified')
export class UIRewardInfoMinified extends Component {

    @property([Sprite])
    rewardIcons: Sprite[] = [];
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
            if(data.gold > 0) {
                this.setNextReward(this.gold);
            }

            if(data.startBonus_Bomb > 0 || data.bomb_Minutes > 0) {
                this.setNextReward(this.bomb);
            }

            if(data.startBonus_Rocket > 0 || data.rocket_Minutes > 0) {
                this.setNextReward(this.rocket);
            }

            if(data.discoball_Minutes > 0 || data.startBonus_Discoball > 0) {
                this.setNextReward(this.discoball);
            }

            if(data.booster_Hammer > 0) {
                this.setNextReward(this.hammer);
            }

            if(data.booster_Bow > 0) {
                this.setNextReward(this.bow);
            }

            if(data.booster_Cannon > 0) {
                this.setNextReward(this.cannon);
            }

            if(data.booster_Jester > 0) {
                this.setNextReward(this.jester);
            }

            if(data.endlessLives_Minutes > 0) {
                this.setNextReward(this.lives);
            }

            if(data.modifierX2_Minutes > 0) {
                this.setNextReward(this.x2);
            }
        }
    }


    setNextReward(sp: SpriteFrame) {
        if(this.curIdx >= this.rewardNodes.length) {
            return;
        }

        this.rewardNodes[this.curIdx].active = true;
        this.rewardIcons[this.curIdx].spriteFrame = sp;

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


