import { _decorator, Component, Node, Button, Label, tween, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassBonusBank')
export class UIEventBattlepassBonusBank extends Component {

    @property(Node)
    activeContainer: Node = null;
    @property(Node)
    passiveContainer: Node = null;

    @property(Button)
    takeBtn: Button = null;

    @property(Label)
    gold: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;


    start() {
        this.takeBtn.node.on(Button.EventType.CLICK, this.onTakeBtnClick, this);
    }

    refresh(isPremium: boolean, isTakeAvailable: boolean, count: number) {
        this.activeContainer.active = isPremium;
        this.passiveContainer.active = !isPremium;

        this.takeBtn.node.active = isTakeAvailable;

        this.gold.string = count + "/ 5000";

        tween(this.progressBar)
            .to(0.8, { progress: count / 5000 })
            .start();
    }


    onTakeBtnClick() {
        this.node.emit("take");
    }
}


