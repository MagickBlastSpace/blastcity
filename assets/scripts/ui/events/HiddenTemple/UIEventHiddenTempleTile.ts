import { _decorator, Component, Node, Button, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEventHiddenTempleTile')
export class UIEventHiddenTempleTile extends Component {

    @property(Button)
    makeMoveBtn: Button = null;

    private tileId: string = "";


    start() {
        this.makeMoveBtn.node.on(Button.EventType.CLICK, this.onMakeMoveBtnClick, this);
    }


    init(tileId: string) {
        this.tileId = tileId;
    }

    refresh(predictions: string[]) {
        if(!predictions.includes(this.tileId)) {
            this.node.active = true;
        }
        else {
            this.hideTile();
        }
    }
s

    onMakeMoveBtnClick() {
        this.node.emit("move", this.tileId);
    }

    hideTile() {
        this.scheduleOnce(() => {
            tween(this.node).stop();

            tween(this.node)
                .to(0.2, { scale: new Vec3(2, 2, 2) }, { easing: 'linear' })
                .call(() => {
                    this.node.active = false;
                })
                .start();
        }, 0);
    }
}


