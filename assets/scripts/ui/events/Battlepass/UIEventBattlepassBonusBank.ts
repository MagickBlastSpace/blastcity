import { _decorator, Component, Node, Button, Label, tween, ProgressBar } from 'cc';
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


    refresh(isPremium: boolean, count: number) {
        this.activeContainer.active = isPremium;
        this.passiveContainer.active = !isPremium;

        this.gold.string = count + "/ 5000";

        tween(this.progressBar)
            .to(0.8, { progress: count / 5000 })
            .start();
    }
}


