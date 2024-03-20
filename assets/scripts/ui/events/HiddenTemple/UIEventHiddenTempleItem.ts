import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEventHiddenTempleItem')
export class UIEventHiddenTempleItem extends Component {

    @property([cc.String])
    connectedTiles: string[] = [];


    refresh(predictions: string[]) {
        if(!this.isPredicted(predictions)) {
            this.node.active = true;
        }
        else {
            this.hideItem();
        }
    }

    isPredicted(predictions: string[]): boolean {
        let isPredicted = true;

        for(let i = 0; i < this.connectedTiles.length; i++) {
            if(!predictions.includes(this.connectedTiles[i])) {
                isPredicted = false;
            }
        }

        return isPredicted;
    }

    hideItem() {
        this.scheduleOnce(() => {
            tween(this.node).stop();

            tween(this.node)
                .to(0.2, { scale: new Vec3(2, 2, 2) }, { easing: 'linear' })
                .call(() => {
                    this.node.active = false;
                })
                .start();
        }, 0.2);
    }
}


