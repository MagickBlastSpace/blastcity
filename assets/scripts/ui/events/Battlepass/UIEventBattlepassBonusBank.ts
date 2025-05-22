import { _decorator, Component, Node, Button, Label, tween, ProgressBar, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassBonusBank')
export class UIEventBattlepassBonusBank extends Component {

    @property(Node)
    activeContainer: Node = null;
    @property(Node)
    passiveContainer: Node = null;

    @property(Label)
    gold: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Sprite)
    safeIcon: Sprite = null;
    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    premium: SpriteFrame = null;


    refresh(isPremium: boolean, count: number, isMaxStage: boolean) {
        this.activeContainer.active = isMaxStage;
        this.passiveContainer.active = !isPremium;

        this.gold.string = count + "/ 5000";

        this.safeIcon.spriteFrame = isPremium ? this.premium : this.common;

        tween(this.progressBar)
            .to(0.8, { progress: count / 5000 })
            .start();
    }
}


